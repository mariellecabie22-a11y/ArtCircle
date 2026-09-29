import json
import logging
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings


logger = logging.getLogger(__name__)


def send_brevo_email(
    to_email,
    to_name,
    subject,
    html_content,
    text_content=None,
    tag=None,
):
    """
    Send a transactional email through Brevo.

    Returns True when Brevo accepts the email.
    Returns False if configuration or delivery request fails.
    """

    if not settings.BREVO_API_KEY:
        logger.error("BREVO_API_KEY is not configured.")
        return False

    if not settings.BREVO_SENDER_EMAIL:
        logger.error("BREVO_SENDER_EMAIL is not configured.")
        return False

    payload = {
        "sender": {
            "name": "ArtCircle",
            "email": settings.BREVO_SENDER_EMAIL,
        },
        "to": [
            {
                "email": to_email,
                "name": to_name or "",
            }
        ],
        "subject": subject,
        "htmlContent": html_content,
    }

    if text_content:
        payload["textContent"] = text_content

    if tag:
        payload["tags"] = [tag]

    data = json.dumps(payload).encode("utf-8")

    request = Request(
        "https://api.brevo.com/v3/smtp/email",
        data=data,
        headers={
            "accept": "application/json",
            "api-key": settings.BREVO_API_KEY,
            "content-type": "application/json",
        },
        method="POST",
    )

    try:
        with urlopen(request, timeout=30) as response:
            response.read()

        return True

    except HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        logger.error(
            "Brevo API error %s: %s",
            exc.code,
            error_body,
        )
        return False

    except URLError as exc:
        logger.error(
            "Unable to connect to Brevo: %s",
            exc,
        )
        return False

    except Exception as exc:
        logger.exception(
            "Unexpected Brevo email error: %s",
            exc,
        )
        return False