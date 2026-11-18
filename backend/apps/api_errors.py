"""
API-wide exception handler (REST_FRAMEWORK["EXCEPTION_HANDLER"]).

DRF only turns its own exceptions into JSON responses. A Django
ValidationError (e.g. Wagtail rejecting a page) or a database IntegrityError
(e.g. a duplicate product code) raised inside a view would otherwise escape as
an HTML "500 Server Error", which the admin can only show as "API error: 500".
These are problems with the submitted data, so they become a 400 with a
readable message. Anything else that goes wrong is logged with its traceback
(visible in the Render logs) and returned as a JSON 500 with a plain message.
"""

import logging

from django.core.exceptions import ValidationError
from django.db import IntegrityError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler as drf_exception_handler

logger = logging.getLogger(__name__)


def _validation_message(exc):
    if hasattr(exc, "message_dict"):
        return "; ".join(
            " ".join(msgs) if field == "__all__" else f"{field}: {' '.join(msgs)}"
            for field, msgs in exc.message_dict.items()
        )
    return " ".join(exc.messages)


def api_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    if response is not None:
        return response

    if isinstance(exc, ValidationError):
        return Response({"error": _validation_message(exc)}, status=status.HTTP_400_BAD_REQUEST)

    if isinstance(exc, IntegrityError):
        logger.warning("IntegrityError in API view: %s", exc)
        return Response(
            {"error": "This conflicts with an existing record (for example a duplicate code or name). Please change it and try again."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    logger.exception("Unhandled error in API view", exc_info=exc)
    return Response(
        {"error": "Something went wrong on the server and this was not saved. Please try again, and if it keeps happening, let the site developer know."},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
