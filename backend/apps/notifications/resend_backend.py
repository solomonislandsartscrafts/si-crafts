"""
Resend HTTP email backend for SI Crafts.

Why this exists
---------------
Our host (Render's free plan) blocks outbound SMTP ports (25/465/587), so
Gmail/SMTP can never connect from production — the socket hangs until the
worker is killed. Resend sends over HTTPS (port 443), which is not blocked, so
it works on the free plan.

Design
------
This is a drop-in Django email backend: it subclasses BaseEmailBackend and
implements send_messages(). Every existing caller — send_mail(),
EmailMultiAlternatives, and all the notify_* helpers in emails.py — keeps
working unchanged. Nothing outside settings.py needs to know Resend exists.

No new dependency: Resend's API is a single JSON POST, so we use the stdlib
urllib rather than pulling in requests or the resend SDK (KISS).
"""

import json
import logging
import urllib.error
import urllib.request

from django.conf import settings
from django.core.mail.backends.base import BaseEmailBackend

logger = logging.getLogger(__name__)

RESEND_ENDPOINT = "https://api.resend.com/emails"


class ResendEmailBackend(BaseEmailBackend):
    """Send email through the Resend HTTP API instead of SMTP."""

    def __init__(self, fail_silently=False, **kwargs):
        super().__init__(fail_silently=fail_silently, **kwargs)
        self.api_key = getattr(settings, "RESEND_API_KEY", "")
        self.timeout = getattr(settings, "EMAIL_TIMEOUT", 10) or 10

    def send_messages(self, email_messages):
        """Send one or more EmailMessage objects. Returns the number sent."""
        if not email_messages:
            return 0
        if not self.api_key:
            # Misconfiguration: backend selected but no key. Fail loudly unless
            # the caller opted into silence, so it surfaces in logs/tests.
            if not self.fail_silently:
                raise ValueError("RESEND_API_KEY is not set; cannot send email via Resend.")
            logger.error("[email] Resend backend selected but RESEND_API_KEY is empty; skipping send.")
            return 0

        sent = 0
        for message in email_messages:
            if self._send_one(message):
                sent += 1
        return sent

    def _send_one(self, message) -> bool:
        payload = self._build_payload(message)
        data = json.dumps(payload).encode("utf-8")
        request = urllib.request.Request(
            RESEND_ENDPOINT,
            data=data,
            method="POST",
            headers={
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                # Cloudflare fronts the Resend API and blocks the default
                # "Python-urllib/x.y" agent as a bot (HTTP 403, "error code: 1010").
                # A real User-Agent gets the request through to the API.
                "User-Agent": "SIAC-Backend/1.0 (+https://solomonislandsartsandcrafts.com.au)",
            },
        )
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                # Resend returns 200 with a JSON body containing the message id.
                response.read()
            return True
        except urllib.error.HTTPError as e:
            # 4xx/5xx from Resend — read the body for the reason (bad key,
            # unverified domain, invalid recipient, etc.).
            body = ""
            try:
                body = e.read().decode("utf-8", "replace")
            except Exception:
                pass
            logger.error("[email] Resend rejected message (HTTP %s): %s", e.code, body)
            if not self.fail_silently:
                raise
            return False
        except Exception as e:
            # Network/timeout error. Never let it bubble up and 500 a request
            # when the caller asked for silence.
            logger.error("[email] Resend send failed: %s", e)
            if not self.fail_silently:
                raise
            return False

    def _build_payload(self, message) -> dict:
        """Map a Django EmailMessage onto Resend's JSON schema."""
        payload = {
            "from": message.from_email or settings.DEFAULT_FROM_EMAIL,
            "to": list(message.to),
            "subject": message.subject,
        }
        if message.cc:
            payload["cc"] = list(message.cc)
        if message.bcc:
            payload["bcc"] = list(message.bcc)
        if message.reply_to:
            payload["reply_to"] = list(message.reply_to)

        # message.body is the primary content. Its type depends on the email:
        #   - EmailMessage with content_subtype "html" -> body is HTML
        #   - EmailMultiAlternatives -> body is plain text, HTML is an alternative
        #   - send_mail(..., html_message=...) builds an EmailMultiAlternatives
        text_body = None
        html_body = None
        if getattr(message, "content_subtype", "plain") == "html":
            html_body = message.body
        else:
            text_body = message.body

        for content, mimetype in getattr(message, "alternatives", []) or []:
            if mimetype == "text/html":
                html_body = content

        if text_body is not None:
            payload["text"] = text_body
        if html_body is not None:
            payload["html"] = html_body
        # Resend requires at least one of text/html.
        if "text" not in payload and "html" not in payload:
            payload["text"] = ""

        return payload
