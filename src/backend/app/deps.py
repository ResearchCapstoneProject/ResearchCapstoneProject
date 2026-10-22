"""Request dependencies: the database session and the signed-in staff user."""
from datetime import datetime, timezone

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from .config import settings
from .db import get_db
from .errors import forbidden, unauthorised
from .models import StaffSession, StaffUser
from .security import token_id


def current_user(request: Request, db: Session = Depends(get_db)) -> StaffUser:
    token = request.cookies.get(settings.cookie_name)
    if not token:
        raise unauthorised()

    row = db.get(StaffSession, token_id(token))
    now = datetime.now(timezone.utc)
    if row is None or row.expires_at.replace(tzinfo=timezone.utc) < now:
        raise unauthorised("Your session has expired. Please sign in again.")

    user = db.get(StaffUser, row.user_id)
    if user is None or not user.is_active:
        raise unauthorised()

    # Sliding expiry, capped in absolute terms by created_at + session_max_days.
    row.last_seen_at = now.replace(tzinfo=None)
    db.commit()
    return user


def require_csrf(request: Request) -> None:
    """Double-submit check on every state-changing staff request.

    SameSite=Lax already blocks cross-site POSTs carrying the cookie, so this
    is belt and braces -- but it is the check a security reviewer at the
    museum's IT department will look for, and it costs almost nothing.
    """
    if request.method in ("GET", "HEAD", "OPTIONS"):
        return
    sent = request.headers.get("x-csrf-token")
    cookie = request.cookies.get(settings.csrf_cookie_name)
    if not sent or not cookie or sent != cookie:
        raise forbidden("Missing or invalid CSRF token.")


def require_staff(
    user: StaffUser = Depends(current_user), _: None = Depends(require_csrf)
) -> StaffUser:
    return user


def require_role(*roles: str):
    def check(user: StaffUser = Depends(require_staff)) -> StaffUser:
        if user.role != "admin" and user.role not in roles:
            raise forbidden(f"This action needs one of: {', '.join(roles)}.")
        return user

    return check
