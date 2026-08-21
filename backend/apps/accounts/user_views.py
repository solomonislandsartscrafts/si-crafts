"""Account management for super admins.

One endpoint to create, read, update and delete every kind of login the site
has: super admins, editors, stockists, and plain users with no role yet.

A role is not a column on the user. It is derived from which profile rows
exist — an active ``AdminProfile`` makes someone an editor or super admin, and
a linked ``Stockist`` record makes them a stockist. Granting a role therefore
creates (or reactivates) the matching profile, and revoking one deactivates it
rather than deleting it, so history and order records survive.
"""

import secrets

from django.contrib.auth.models import User
from django.db import transaction
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.settings import api_settings

from apps.stockists.models import Stockist
from apps.stockists.views import send_stockist_password_invite

from .models import AdminProfile
from .password_policy import MIN_PASSWORD_LENGTH, password_error
from .permissions import IsSuperAdmin
from .serializers import AccountUserSerializer, resolve_role

ADMIN_ROLES = ("super_admin", "editor")
ROLE_STOCKIST = "stockist"
ROLE_NONE = "user"
ALL_ROLES = ADMIN_ROLES + (ROLE_STOCKIST, ROLE_NONE)

# Re-exported for callers that already import it from here.
__all__ = ["MIN_PASSWORD_LENGTH", "UserAdminViewSet", "apply_role"]

# Fields an admin fills in on behalf of a stockist who never applied.
STOCKIST_FIELDS = ("business_name", "abn", "contact_name", "phone", "description")


class ValidationProblem(Exception):
    """A message to hand straight back to the admin UI."""

    def __init__(self, message):
        super().__init__(message)
        self.message = message


# --- small helpers -----------------------------------------------------------


def _clean(value):
    return str(value or "").strip()


def _split_name(name):
    parts = _clean(name).split()
    if not parts:
        return "", ""
    return parts[0], " ".join(parts[1:])


def _unique_username(email):
    """Usernames must be unique and fit in 150 chars; emails are neither."""
    username = email[:150]
    if User.objects.filter(username__iexact=username).exists():
        username = f"{username[:140]}-{secrets.token_hex(4)}"
    return username


def _email_taken(email, exclude_user_id=None):
    qs = User.objects.filter(email__iexact=email)
    if exclude_user_id is not None:
        qs = qs.exclude(pk=exclude_user_id)
    return qs.exists()


def _stockist_email_taken(email, exclude_user_id=None):
    qs = Stockist.objects.filter(email__iexact=email)
    if exclude_user_id is not None:
        qs = qs.exclude(user_id=exclude_user_id)
    return qs.exists()


def _active_super_admins(exclude_user_id=None, lock=False):
    """Return the set of super admins who can actually sign in.

    A deactivated login with an active admin profile is not a usable super
    admin, so the "keep at least one" guards must not count it.

    When *lock=True* the matching rows are locked with SELECT FOR UPDATE in a
    stable order (by pk) so that concurrent demote/deactivate/delete requests
    serialise against each other. The full set is materialized (including the
    target) so callers can inspect membership directly.

    The caller MUST already be inside a transaction.atomic() block when using
    lock=True.

    Returns a list of user_ids of active super admins.
    """
    qs = AdminProfile.objects.filter(
        role="super_admin", is_active=True, user__is_active=True
    ).order_by("user_id")
    if lock:
        qs = qs.select_for_update()
    # Materialize the full locked set — do NOT exclude the target so the lock
    # covers it and callers can check sole-membership.
    return list(qs.values_list("user_id", flat=True))


def _as_bool(value, default=True):
    """Coerce an is_active flag from JSON, form data or query strings.

    Form-encoded and query payloads deliver "false"/"0", which are truthy
    strings in Python. Normalise once so the guards and the field assignment
    can never disagree.
    """
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() not in ("", "false", "0", "no", "off")
    return bool(value)


def _validate_password(password):
    """Apply the configured AUTH_PASSWORD_VALIDATORS, not a local length rule."""
    if not password:
        return
    problem = password_error(password)
    if problem:
        raise ValidationProblem(problem)


# An active admin profile, which is what makes someone an editor/super admin and
# what makes admin access outrank stockist access in resolve_role().
_HAS_ADMIN_ACCESS = Q(admin_profile__isnull=False) & Q(admin_profile__is_active=True)
_HAS_STOCKIST_ACCESS = Q(stockist__isnull=False) & Q(stockist__status="approved")


def _role_queryset_filter(role):
    """Express resolve_role() as a queryset filter.

    Role is computed from attached profiles rather than stored, so filtering used
    to happen in Python after serializing every account. These conditions must
    stay in step with serializers.resolve_role: admin access wins, then an
    approved stockist record, then nothing.

    Returns None for an unrecognised role.
    """
    if role in ADMIN_ROLES:
        return _HAS_ADMIN_ACCESS & Q(admin_profile__role=role)
    if role == ROLE_STOCKIST:
        return ~_HAS_ADMIN_ACCESS & _HAS_STOCKIST_ACCESS
    if role == ROLE_NONE:
        return ~_HAS_ADMIN_ACCESS & ~_HAS_STOCKIST_ACCESS
    return None


def _stockist_payload(data):
    """Pull stockist details from either a nested object or flat keys."""
    nested = data.get("stockist")
    source = nested if isinstance(nested, dict) else data
    return {field: _clean(source.get(field)) for field in STOCKIST_FIELDS if field in source}


# --- role transitions --------------------------------------------------------


def _grant_admin_role(user, role):
    profile, created = AdminProfile.objects.get_or_create(
        user=user, defaults={"role": role}
    )
    profile.role = role
    profile.is_active = True
    profile.failed_login_attempts = 0
    profile.locked_until = None
    profile.save()
    label = "Super Admin" if role == "super_admin" else "Editor"
    return f"{label} access granted." if created else f"Role set to {label}."


def _revoke_admin_role(user):
    """Deactivate rather than delete, so the role can be handed back later."""
    profile = getattr(user, "admin_profile", None)
    if profile is None or not profile.is_active:
        return None
    profile.is_active = False
    profile.save(update_fields=["is_active", "updated_at"])
    return "Admin dashboard access removed."


def _grant_stockist_role(user, stockist_data, password=None, send_invite=False):
    """Turn an existing login into an approved stockist.

    Used both for someone who applied through the public form and for someone
    an admin is adding straight from the dashboard, which is why the business
    details are required here rather than assumed to already exist.
    """
    stockist = getattr(user, "stockist", None)

    if stockist is None:
        # Reuse an unlinked application with the same email if there is one,
        # so promoting someone doesn't orphan their existing record.
        stockist = Stockist.objects.filter(
            email__iexact=user.email, user__isnull=True
        ).first()

    details = dict(stockist_data or {})

    if stockist is None:
        business_name = details.get("business_name", "")
        contact_name = details.get("contact_name") or user.get_full_name() or user.username
        if not business_name:
            raise ValidationProblem(
                "Business name is required to make someone a stockist."
            )
        if not contact_name:
            raise ValidationProblem(
                "Contact name is required to make someone a stockist."
            )
        if _stockist_email_taken(user.email, exclude_user_id=user.pk):
            raise ValidationProblem(
                "Another stockist record already uses that email address."
            )
        stockist = Stockist(
            user=user,
            email=user.email,
            business_name=business_name,
            contact_name=contact_name,
            abn=details.get("abn", ""),
            phone=details.get("phone", ""),
            description=details.get("description", ""),
            status="approved",
        )
        stockist.save()
        created = True
    else:
        for field, value in details.items():
            setattr(stockist, field, value)
        stockist.user = user
        stockist.email = user.email
        stockist.status = "approved"
        stockist.save()
        created = False

    if not user.is_active:
        user.is_active = True
        user.save(update_fields=["is_active"])

    action_word = "Stockist access granted." if created else "Stockist access restored."

    if password:
        user.set_password(password)
        user.save()
        return f"{action_word} They can sign in now with the password you set."

    if send_invite or not user.has_usable_password():
        def _deliver_invite():
            try:
                send_stockist_password_invite(stockist)
            except Exception:
                import logging
                logging.getLogger(__name__).exception(
                    "Failed to send stockist password invite to %s — resend it "
                    "from the Accounts page.",
                    stockist.email,
                )

        # Deferred until the surrounding transaction commits. Creating the
        # token and sending the email inside the transaction meant a later
        # rollback could leave a live password link for a grant that never
        # happened, and the recipient could follow a link to a row that was
        # never written. Outside a transaction on_commit runs immediately.
        transaction.on_commit(_deliver_invite)
        return f"{action_word} A password setup email is on its way."

    return f"{action_word} They sign in with their existing password."


def _revoke_stockist_role(user):
    """Suspend, never delete — deleting a stockist takes their orders with it."""
    stockist = getattr(user, "stockist", None)
    if stockist is None or stockist.status != "approved":
        return None
    stockist.status = "suspended"
    stockist.save(update_fields=["status", "updated_at"])
    return "Stockist access suspended (their record and order history are kept)."


def apply_role(user, role, stockist_data=None, password=None, send_invite=False):
    """Move a user onto exactly one role, cleaning up the other one."""
    if role not in ALL_ROLES:
        raise ValidationProblem(
            f"Unknown role '{role}'. Choose one of: {', '.join(ALL_ROLES)}."
        )

    messages = []

    if role in ADMIN_ROLES:
        messages.append(_grant_admin_role(user, role))
        messages.append(_revoke_stockist_role(user))
    elif role == ROLE_STOCKIST:
        messages.append(
            _grant_stockist_role(
                user, stockist_data, password=password, send_invite=send_invite
            )
        )
        messages.append(_revoke_admin_role(user))
    else:
        messages.append(_revoke_admin_role(user))
        messages.append(_revoke_stockist_role(user))
        if not any(messages):
            messages.append("No roles to remove.")

    return " ".join(m for m in messages if m)


# --- viewset -----------------------------------------------------------------


class UserAdminViewSet(viewsets.ViewSet):
    """Full CRUD over every login, restricted to super admins."""

    permission_classes = [IsSuperAdmin]

    def _queryset(self):
        return User.objects.select_related("admin_profile", "stockist").order_by(
            "-date_joined"
        )

    def _get_user(self, pk):
        try:
            return self._queryset().get(pk=pk)
        except (User.DoesNotExist, ValueError):
            return None

    def _serialize(self, user, message=None):
        data = AccountUserSerializer(user).data
        if message:
            data["message"] = message
        return data

    # -- read

    def list(self, request):
        users = self._queryset()

        role = _clean(request.query_params.get("role"))
        search = _clean(request.query_params.get("search"))

        if search:
            users = users.filter(
                Q(email__icontains=search)
                | Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                # The Accounts page searches business names too, so this has to
                # match or moving the filter server-side would lose a feature.
                | Q(stockist__business_name__icontains=search)
            ).distinct()

        if role:
            role_filter = _role_queryset_filter(role)
            if role_filter is None:
                return Response(
                    {"error": f"Unknown role '{role}'."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            users = users.filter(role_filter)

        # Paginate with the project default (PageNumberPagination, PAGE_SIZE 50),
        # the same as every other list endpoint. This is a plain ViewSet, so the
        # paginator has to be driven by hand rather than inherited from
        # ListModelMixin. Serialization now only touches the current page.
        paginator = api_settings.DEFAULT_PAGINATION_CLASS()
        page = paginator.paginate_queryset(users, request, view=self)
        if page is None:
            return Response(AccountUserSerializer(users, many=True).data)

        serialized = AccountUserSerializer(page, many=True).data
        return paginator.get_paginated_response(serialized)

    def retrieve(self, request, pk=None):
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)
        return Response(self._serialize(user))

    # -- create

    def create(self, request):
        data = request.data
        email = _clean(data.get("email")).lower()
        name = _clean(data.get("name"))
        role = _clean(data.get("role")) or ROLE_NONE
        password = _clean(data.get("password"))
        send_invite = bool(data.get("send_invite"))

        if not email:
            return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)
        if role not in ALL_ROLES:
            return Response(
                {"error": f"Unknown role '{role}'."}, status=status.HTTP_400_BAD_REQUEST
            )
        if _email_taken(email):
            return Response(
                {"error": "An account with that email already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            _validate_password(password)
        except ValidationProblem as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        if role in ADMIN_ROLES and not password:
            return Response(
                {"error": "Admins need a password. Set one of at least 8 characters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        first_name, last_name = _split_name(name)

        try:
            with transaction.atomic():
                user = User(
                    username=_unique_username(email),
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    is_active=_as_bool(data.get("is_active")),
                )
                if password:
                    user.set_password(password)
                else:
                    user.set_unusable_password()
                user.save()

                message = apply_role(
                    user,
                    role,
                    stockist_data=_stockist_payload(data),
                    password=None,  # already set above
                    send_invite=send_invite or (role == ROLE_STOCKIST and not password),
                )
        except ValidationProblem as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        user.refresh_from_db()
        return Response(
            self._serialize(user, f"Account created. {message}".strip()),
            status=status.HTTP_201_CREATED,
        )

    # -- update

    def partial_update(self, request, pk=None):
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        data = request.data
        is_self = request.user.pk == user.pk
        messages = []

        # Normalise once, then reuse. Reading the raw value at each guard let a
        # string "false" slip past the self-deactivation and last-super-admin
        # checks and then be coerced back to True by bool().
        has_is_active = "is_active" in data
        wants_active = _as_bool(data.get("is_active")) if has_is_active else None

        new_role = _clean(data.get("role"))
        if new_role and new_role != resolve_role(user):
            if is_self:
                return Response(
                    {"error": "You can't change your own role."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if user.is_superuser and new_role != "super_admin":
                return Response(
                    {"error": "This account is a Django superuser and must stay a super admin."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        password = _clean(data.get("password"))
        try:
            _validate_password(password)
        except ValidationProblem as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        if has_is_active and not wants_active:
            if is_self:
                return Response(
                    {"error": "You can't deactivate your own account."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            with transaction.atomic():
                # Lock the full active super-admin set in stable order so
                # concurrent demote/deactivate requests serialise correctly.
                active_sa_ids = _active_super_admins(lock=True)

                if (
                    new_role
                    and new_role != resolve_role(user)
                    and resolve_role(user) == "super_admin"
                    and new_role != "super_admin"
                    and active_sa_ids == [user.pk]
                ):
                    raise ValidationProblem("There must be at least one active super admin.")

                if (
                    has_is_active
                    and not wants_active
                    and resolve_role(user) == "super_admin"
                    and active_sa_ids == [user.pk]
                ):
                    raise ValidationProblem("There must be at least one active super admin.")
                user_fields = []

                if "name" in data:
                    user.first_name, user.last_name = _split_name(data.get("name"))
                    user_fields += ["first_name", "last_name"]

                if "email" in data:
                    email = _clean(data.get("email")).lower()
                    if not email:
                        raise ValidationProblem("Email can't be blank.")
                    if email != (user.email or "").lower():
                        if _email_taken(email, exclude_user_id=user.pk):
                            raise ValidationProblem(
                                "Another account already uses that email address."
                            )
                        if _stockist_email_taken(email, exclude_user_id=user.pk):
                            raise ValidationProblem(
                                "A stockist record already uses that email address."
                            )
                        user.email = email
                        user_fields.append("email")

                if has_is_active:
                    user.is_active = wants_active
                    user_fields.append("is_active")

                if user_fields:
                    user.save(update_fields=list(dict.fromkeys(user_fields)))

                if password:
                    user.set_password(password)
                    user.save()
                    messages.append("Password updated.")

                # Keep the stockist record in step with the user's details.
                stockist_data = _stockist_payload(data)
                stockist = getattr(user, "stockist", None)
                if stockist is not None:
                    changed = []
                    for field, value in stockist_data.items():
                        if getattr(stockist, field) != value:
                            setattr(stockist, field, value)
                            changed.append(field)
                    if user.email and stockist.email.lower() != user.email.lower():
                        stockist.email = user.email
                        changed.append("email")
                    if changed:
                        stockist.save()
                        messages.append("Stockist details updated.")

                if new_role and new_role != resolve_role(user):
                    messages.append(
                        apply_role(
                            user,
                            new_role,
                            stockist_data=stockist_data,
                            send_invite=bool(data.get("send_invite")),
                        )
                    )
                elif new_role in ADMIN_ROLES:
                    # Same role name, but make sure the profile is active.
                    _grant_admin_role(user, new_role)

                # Deactivating the login should also lock the stockist out.
                # Inside the transaction, so the login and the stockist record
                # can't disagree: previously this ran after the commit, and a
                # failure here left the account disabled while the stockist
                # stayed approved — still holding wholesale access.
                if has_is_active:
                    stockist = getattr(user, "stockist", None)
                    if stockist is not None:
                        wanted = "approved" if user.is_active else "suspended"
                        if (
                            stockist.status in ("approved", "suspended")
                            and stockist.status != wanted
                        ):
                            stockist.status = wanted
                            stockist.save(update_fields=["status", "updated_at"])
        except ValidationProblem as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        user = self._get_user(user.pk)
        return Response(
            self._serialize(user, " ".join(messages) or "Changes saved.")
        )

    def update(self, request, pk=None):
        # Treat PUT the same as PATCH — the UI only ever sends partial updates.
        return self.partial_update(request, pk)

    # -- delete

    def destroy(self, request, pk=None):
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if request.user.pk == user.pk:
            return Response(
                {"error": "You can't delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if user.is_superuser:
            return Response(
                {"error": "Django superusers can't be deleted from here."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                active_sa_ids = _active_super_admins(lock=True)
                if (
                    resolve_role(user) == "super_admin"
                    and active_sa_ids == [user.pk]
                ):
                    raise ValidationProblem("There must be at least one active super admin.")

                # Stockist.user is SET_NULL, so the stockist record and its orders
                # survive as an unlinked application. Delete it from the Stockists
                # page if it should go too.
                had_stockist = getattr(user, "stockist", None) is not None
                user.delete()
        except ValidationProblem as exc:
            return Response({"error": exc.message}, status=status.HTTP_400_BAD_REQUEST)

        message = "Account deleted."
        if had_stockist:
            message += " Their stockist record was kept — remove it from Stockists if needed."
        return Response({"success": True, "message": message})

    # -- extras

    @action(detail=True, methods=["post"], url_path="send-password-link")
    def send_password_link(self, request, pk=None):
        """Email a stockist a fresh link to set their own password."""
        user = self._get_user(pk)
        if user is None:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        stockist = getattr(user, "stockist", None)
        if stockist is None:
            return Response(
                {"error": "Password links are only available for stockists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            message = send_stockist_password_invite(stockist)
        except Exception:
            import logging
            logging.getLogger(__name__).exception(
                "Failed to send stockist password invite to %s", stockist.email
            )
            return Response(
                {"error": "Couldn't send the email. Check the mail settings and try again."},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"success": True, "message": message})
