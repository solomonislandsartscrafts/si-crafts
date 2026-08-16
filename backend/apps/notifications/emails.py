"""
Email notification helpers for SI Crafts.

All email sending goes through this module. Uses Django's built-in SMTP backend.
Fails silently (logs errors) so email issues never block user actions.
"""

import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)

ADMIN_EMAIL = getattr(settings, "ADMIN_NOTIFICATION_EMAIL", settings.DEFAULT_FROM_EMAIL)
SITE_NAME = "Solomon Islands Arts Crafts"
SITE_URL = getattr(settings, "SITE_URL", "https://solomonislandsartsandcrafts.com.au")


def _send(subject: str, body: str, recipient_list: list[str], html_body: str | None = None):
    """Send an email, failing silently with a log message on error."""
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=recipient_list,
            html_message=html_body,
            fail_silently=False,
        )
        logger.info(f"[email] Sent '{subject}' to {recipient_list}")
    except Exception as e:
        logger.error(f"[email] Failed to send '{subject}' to {recipient_list}: {e}")


def _get_admin_emails() -> list[str]:
    """Get all active admin email addresses for notifications."""
    from apps.accounts.models import AdminProfile
    profiles = AdminProfile.objects.filter(is_active=True).select_related("user")
    emails = [p.user.email for p in profiles if p.user.email]
    # Fallback to ADMIN_NOTIFICATION_EMAIL if no admins found
    return emails or [ADMIN_EMAIL]


# --- 1. Stockist Application Received (notify admins) ---

def notify_stockist_application(business_name: str, contact_name: str, email: str, description: str = ""):
    """Notify admins that a new stockist application was submitted."""
    subject = f"[SIAC] New stockist application: {business_name}"
    body = (
        f"A new stockist application has been submitted.\n\n"
        f"Business: {business_name}\n"
        f"Contact: {contact_name}\n"
        f"Email: {email}\n"
        f"Description: {description or '(none)'}\n\n"
        f"Review and approve/reject at:\n"
        f"{SITE_URL}/admin/stockists\n"
    )
    _send(subject, body, _get_admin_emails())


# --- 2. Stockist Approved (send credentials to stockist) ---

def notify_stockist_approved(stockist_email: str, business_name: str, password: str):
    """Send login credentials to a newly approved stockist."""
    subject = f"[SIAC] Your stockist account has been approved"
    body = (
        f"Hi,\n\n"
        f"Great news — your stockist application for {business_name} has been approved!\n\n"
        f"You can now log in to view our wholesale catalogue and place orders.\n\n"
        f"Your login credentials:\n"
        f"  Email: {stockist_email}\n"
        f"  Password: {password}\n\n"
        f"Log in at: {SITE_URL}/login\n\n"
        f"Please change your password after your first login.\n\n"
        f"Thank you for partnering with {SITE_NAME}.\n"
    )
    _send(subject, body, [stockist_email])


# --- 3. New Order Placed (notify admins) ---

def notify_new_order(reference_number: str, stockist_name: str, total_aud: float, item_count: int):
    """Notify admins that a stockist submitted a new order."""
    subject = f"[SIAC] New order #{reference_number} from {stockist_name}"
    body = (
        f"A new wholesale order has been submitted.\n\n"
        f"Reference: {reference_number}\n"
        f"Stockist: {stockist_name}\n"
        f"Items: {item_count}\n"
        f"Total: A${total_aud:.2f}\n\n"
        f"Review at: {SITE_URL}/admin/orders\n"
    )
    if total_aud > 1000:
        body += f"\n⚠️ NOTE: This order exceeds A$1,000 (GST threshold).\n"
    _send(subject, body, _get_admin_emails())


# --- 4. Order Status Update (notify stockist) ---

def notify_order_status_update(stockist_email: str, reference_number: str, new_status: str):
    """Notify stockist that their order status has changed."""
    status_messages = {
        "Confirmed": "Your order has been confirmed and is being prepared.",
        "Shipped": "Your order has been shipped! You should receive it within 5-10 business days.",
    }
    message = status_messages.get(new_status, f"Your order status has been updated to: {new_status}.")

    subject = f"[SIAC] Order #{reference_number} — {new_status}"
    body = (
        f"Hi,\n\n"
        f"{message}\n\n"
        f"Order reference: {reference_number}\n"
        f"New status: {new_status}\n\n"
        f"You can view your order history at: {SITE_URL}/stockist/order-history\n\n"
        f"Thank you,\n{SITE_NAME}\n"
    )
    _send(subject, body, [stockist_email])


# --- 5. Contact Form Submission (notify admins) ---

def notify_contact_form(name: str, email: str, reason: str, message: str):
    """Notify admins of a new contact form submission."""
    subject = f"[SIAC] Contact form: {reason} — from {name}"
    body = (
        f"New contact form submission.\n\n"
        f"Name: {name}\n"
        f"Email: {email}\n"
        f"Reason: {reason}\n\n"
        f"Message:\n{message}\n\n"
        f"Reply directly to: {email}\n"
        f"Or manage in: {SITE_URL}/admin/inbox\n"
    )
    _send(subject, body, _get_admin_emails())


# --- 6. Maker Enquiry (notify admins) ---

def notify_maker_enquiry(name: str, village: str, province: str, craft: str, message: str, contact: str):
    """Notify admins that a maker has expressed interest in working with SIAC."""
    subject = f"[SIAC] Maker enquiry: {name} from {village}, {province}"
    body = (
        f"A maker has expressed interest in working with SIAC.\n\n"
        f"Name: {name}\n"
        f"Village: {village}\n"
        f"Province: {province}\n"
        f"Craft: {craft}\n"
        f"Contact: {contact}\n\n"
        f"Message:\n{message}\n\n"
        f"Manage in: {SITE_URL}/admin/inbox\n"
    )
    _send(subject, body, _get_admin_emails())


# --- 7. Stockist Application Confirmation (sent to the applicant) ---

def confirm_stockist_application(stockist_email: str, business_name: str, contact_name: str):
    """Send a confirmation email to the stockist that their application was received."""
    subject = f"[SIAC] We received your stockist application"
    body = (
        f"Hi {contact_name},\n\n"
        f"Thank you for applying to become a wholesale stockist with {SITE_NAME}.\n\n"
        f"We have received your application for {business_name} and will review it shortly.\n\n"
        f"What happens next:\n"
        f"  1. Our team will review your application (usually within 2-3 business days)\n"
        f"  2. If approved, you'll receive an email with your login credentials\n"
        f"  3. Once logged in, you can browse our wholesale catalogue and place orders\n\n"
        f"If you have any questions in the meantime, reply to this email or use our contact form at {SITE_URL}/contact\n\n"
        f"Thank you for your interest in Solomon Islands arts and crafts.\n\n"
        f"Kind regards,\n"
        f"The {SITE_NAME} Team\n"
    )
    _send(subject, body, [stockist_email])


# --- 8. Stockist Application Rejected (sent to the applicant) ---

def notify_stockist_rejected(stockist_email: str, business_name: str, contact_name: str):
    """Send a polite rejection email to the stockist."""
    subject = f"[SIAC] Update on your stockist application"
    body = (
        f"Hi {contact_name},\n\n"
        f"Thank you for your interest in becoming a wholesale stockist with {SITE_NAME}.\n\n"
        f"After reviewing your application for {business_name}, we are unable to approve your account at this time.\n\n"
        f"This may be because:\n"
        f"  - We are not currently accepting new stockists in your area\n"
        f"  - We need additional information about your business\n"
        f"  - Your business type may not be a good fit for our products at this stage\n\n"
        f"If you believe this was an error or your circumstances have changed, "
        f"please feel free to get in touch via {SITE_URL}/contact and we will be happy to discuss.\n\n"
        f"Thank you for your understanding.\n\n"
        f"Kind regards,\n"
        f"The {SITE_NAME} Team\n"
    )
    _send(subject, body, [stockist_email])


# --- 9. Stockist Approved — Set Password Link ---

def notify_stockist_approved_with_link(stockist_email: str, business_name: str, contact_name: str, set_password_token: str):
    """Send approval email with a link to set their password."""
    set_password_url = f"{SITE_URL}/stockist/set-password?token={set_password_token}"

    subject = f"[SIAC] Your stockist account has been approved!"
    body = (
        f"Hi {contact_name},\n\n"
        f"Great news — your stockist application for {business_name} has been approved!\n\n"
        f"To get started, please set your password by clicking the link below:\n\n"
        f"  {set_password_url}\n\n"
        f"This link is valid for 7 days.\n\n"
        f"Once you've set your password, you can log in at {SITE_URL}/login to:\n"
        f"  - Browse our wholesale catalogue with pricing\n"
        f"  - Place wholesale order requests\n"
        f"  - View your order history\n\n"
        f"Thank you for partnering with {SITE_NAME}.\n\n"
        f"Kind regards,\n"
        f"The {SITE_NAME} Team\n"
    )
    _send(subject, body, [stockist_email])


# --- 10. Password Reset Request ---

def notify_password_reset(stockist_email: str, contact_name: str, reset_token: str):
    """Send a password reset link to the stockist."""
    reset_url = f"{SITE_URL}/stockist/reset-password?token={reset_token}"

    subject = f"[SIAC] Reset your password"
    body = (
        f"Hi {contact_name},\n\n"
        f"We received a request to reset your password.\n\n"
        f"Click the link below to choose a new password:\n\n"
        f"  {reset_url}\n\n"
        f"This link is valid for 7 days.\n\n"
        f"If you didn't request this, you can safely ignore this email.\n\n"
        f"Kind regards,\n"
        f"The {SITE_NAME} Team\n"
    )
    _send(subject, body, [stockist_email])
