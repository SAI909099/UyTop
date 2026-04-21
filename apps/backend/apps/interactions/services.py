import hashlib
from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from apps.interactions.models import RecentlyViewed, VisitorSession


ONLINE_WINDOW_MINUTES = 5


def record_recently_viewed(*, user, listing):
    RecentlyViewed.objects.update_or_create(
        user=user,
        listing=listing,
        defaults={"last_viewed_at": timezone.now()},
    )


def get_online_cutoff():
    return timezone.now() - timedelta(minutes=ONLINE_WINDOW_MINUTES)


def build_ip_hash(request):
    forwarded_for = request.headers.get("X-Forwarded-For", "")
    remote_addr = forwarded_for.split(",")[0].strip() if forwarded_for else request.META.get("REMOTE_ADDR", "").strip()

    if not remote_addr:
        return ""

    digest = hashlib.sha256(f"{settings.SECRET_KEY}:{remote_addr}".encode("utf-8"))
    return digest.hexdigest()


def summarize_user_agent(request):
    user_agent = request.headers.get("User-Agent", "").strip()
    return user_agent[:255]


def record_visitor_session(*, session_key: str, current_path: str, locale: str, request, user=None):
    normalized_key = session_key.strip()[:64]
    normalized_path = ((current_path or "/").strip() or "/")[:255]
    is_guest = not bool(user and user.is_authenticated)

    visitor_session, _ = VisitorSession.objects.update_or_create(
        session_key=normalized_key,
        defaults={
            "user": None if is_guest else user,
            "is_guest": is_guest,
            "locale": (locale or settings.UYTOP_DEFAULT_LANGUAGE)[:16],
            "current_path": normalized_path,
            "user_agent": summarize_user_agent(request),
            "ip_hash": build_ip_hash(request),
            "last_seen_at": timezone.now(),
        },
    )
    return visitor_session
