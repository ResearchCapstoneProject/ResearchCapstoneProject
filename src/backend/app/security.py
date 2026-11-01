"""Password hashing and opaque session tokens.

Session cookie rather than a JWT, on purpose:

  - the SPA is same-origin with the API, so the usual reason to reach for a
    token (cross-origin requests) does not apply here;
  - this app builds its pages with innerHTML from staff-entered text, so a
    token readable by JavaScript is a real XSS liability, while an HttpOnly
    cookie is not;
  - revocation for a handover ("the intern's laptop was stolen") is one
    DELETE, where a stateless JWT needs a blocklist table -- a session table
    with extra steps.

Only sha256(token) is stored, so a database dump does not hand over live
sessions.
"""
import hashlib
import secrets
from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext

from .config import settings

pwd = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(raw: str) -> str:
    return pwd.hash(raw)


def verify_password(raw: str, hashed: str) -> bool:
    try:
        return pwd.verify(raw, hashed)
    except ValueError:
        return False


def new_token() -> str:
    return secrets.token_urlsafe(32)


def token_id(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def session_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=settings.session_hours)


def absolute_cap() -> timedelta:
    return timedelta(days=settings.session_max_days)
