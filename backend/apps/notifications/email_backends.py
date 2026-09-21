"""
Django email backend that sends over Resend's HTTP API instead of SMTP.

Why this exists: Render's free plan blocks outbound traffic to SMTP ports
(25/465/587), so `smtp.EmailBackend` cannot deliver from production — the
connection is silently dropped rather than refused, which hangs the request
until gunicorn kills the worker. Resend's API is plain HTTPS on 443, which is
not blocked, so delivery works on the free plan.

This is a drop-in `EMAIL_BACKEND`: every existing `send_mail()` call and every
helper in `emails.py` keeps working unchanged. Swapping providers or going back
to SMTP is a one-line settings change.

Uses `urllib` from the standard library on purpose — the payload is a single
JSON POST, so an HTTP client dependency would not earn its place.
"""

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"

# urllib's default User-Agent ("Python-urllib/3.x") is rejected by the Cloudflare
# edge in front of the Resend API with a 403 (error 1010, "browser signature
# banned") before the request ever reaches Resend — so this is load-bearing, not
# cosmetic. Send a real identifier instead.
USER_AGENT = "si-crafts-backend/1.0 (+https://solomonislandsartsandcrafts.com.au)"


class ResendEmailBackend(BaseEmailBackend):
    """Send Django EmailMessage objects through Resend's REST API."""

    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, "RESEND_API_KEY", "")
        # Reuse the SMTP timeout setting so there is one knob for "how long may
        # sending an email stall a request", whichever transport is in use.
        self.timeout = getattr(settings, "EMAIL_TIMEOUT", 10) or 10

    def send_messages(self, email_messages):
        """Send one or more messages. Returns the number actually accepted."""
        if not email_messages:
            return 0

        if not self.api_key:
            # Misconfiguration, not a transient failure: say so loudly once per
            # batch rather than silently dropping notifications.
            logger.error(
                "[email] RESEND_API_KEY is not set — cannot send %d message(s) "
                "via the Resend backend.",
                len(email_messages),
            )
            if not self.fail_silently:
                raise ValueError("RESEND_API_KEY is not configured")
            return 0

        sent = 0
        for message in email_messages:
            if self._send(message):
                sent += 1
        return sent

    def _payload(self, message):
        """Map a Django EmailMessage onto Resend's request schema."""
        payload = {
            "from": message.from_email,
            "to": list(message.to),
            "subject": message.subject,
        }

        # A message built with content_subtype="html" carries HTML in .body;
        # otherwise .body is the plain-text part.
        if getattr(message, "content_subtype", "plain") == "html":
            payload["html"] = message.body
        else:
            payload["text"] = message.body

        # send_mail(html_message=...) attaches the HTML as an alternative.
        for content, mimetype in getattr(message, "alternatives", []) or []:
            if mimetype == "text/html":
                payload["html"] = content

        if message.cc:
            payload["cc"] = list(message.cc)
        if message.bcc:
            payload["bcc"] = list(message.bcc)
        if message.reply_to:
            payload["reply_to"] = list(message.reply_to)

        return payload

    def _send(self, message):
        """POST a single message. Returns True when Resend accepted it."""
        if not message.to:
            return False

        request = urllib.request.Request(
            RESEND_ENDPOINT,
            data=json.dumps(self._payload(message)).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "User-Agent": USER_AGENT,
                "Accept": "application/json",
            },
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                body = json.loads(response.read().decode("utf-8") or "{}")
            logger.info(
                "[email] Resend accepted '%s' for %s (id=%s)",
                message.subject,
                message.to,
                body.get("id", "unknown"),
            )
            return True
        except urllib.error.HTTPError as exc:
            # Resend returns a JSON body explaining the rejection (unverified
            # sending domain, invalid recipient, bad key). Log it — it is the
            # difference between a five-minute fix and a guessing game.
            detail = exc.read().decode("utf-8", errors="replace")[:500]
            logger.error(
                "[email] Resend rejected '%s' for %s: HTTP %s %s",
                message.subject,
                message.to,
                exc.code,
                detail,
            )
            if not self.fail_silently:
                raise
            return False
        except Exception as exc:
            logger.error(
                "[email] Resend request failed for '%s' to %s: %s",
                message.subject,
                message.to,
                exc,
            )
            if not self.fail_silently:
                raise
            return False
