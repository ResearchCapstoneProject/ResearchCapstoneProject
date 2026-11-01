"""Sign in and out. See app/security.py for why this is a cookie, not a JWT."""
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Request, Response
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..deps import current_user
from ..errors import unauthorised
from ..models import StaffSession, StaffUser
from ..schemas.auth import LoginIn, UserOut
from ..security import new_token, session_expiry, token_id, verify_password
from ..services import audit

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _set_cookies(response: Response, token: str, csrf: str) -> None:
    common = dict(secure=settings.cookie_secure, samesite="lax", path="/")
    response.set_cookie(settings.cookie_name, token, httponly=True,
                        max_age=settings.session_hours * 3600, **common)
    # Readable by JS on purpose: the client mirrors it into X-CSRF-Token.
    response.set_cookie(settings.csrf_cookie_name, csrf, httponly=False,
                        max_age=settings.session_hours * 3600, **common)


@router.post("/login", response_model=UserOut)
def login(payload: LoginIn, request: Request, response: Response,
          db: Session = Depends(get_db)) -> UserOut:
    user = (db.query(StaffUser)
            .filter(StaffUser.username == payload.username).one_or_none())
    # Same message either way, so the response cannot be used to enumerate
    # which usernames exist.
    if user is None or not user.is_active or not verify_password(
            payload.password, user.password_hash):
        raise unauthorised("Incorrect username or password.")

    token, csrf = new_token(), secrets.token_urlsafe(24)
    db.add(StaffSession(
        id=token_id(token), user_id=user.id,
        expires_at=session_expiry().replace(tzinfo=None),
        user_agent=(request.headers.get("user-agent") or "")[:255],
    ))
    user.last_login_at = datetime.now(timezone.utc).replace(tzinfo=None)
    audit.record(db, user_id=user.id, action="login", entity="staff_user",
                 entity_id=str(user.id))
    db.commit()

    _set_cookies(response, token, csrf)
    return UserOut(id=user.id, username=user.username,
                   display_name=user.display_name, role=user.role)


@router.post("/logout")
def logout(request: Request, response: Response,
           db: Session = Depends(get_db)) -> dict:
    token = request.cookies.get(settings.cookie_name)
    if token:
        row = db.get(StaffSession, token_id(token))
        if row:
            db.delete(row)
            db.commit()
    response.delete_cookie(settings.cookie_name, path="/")
    response.delete_cookie(settings.csrf_cookie_name, path="/")
    return {"ok": True}


@router.get("/me", response_model=UserOut)
def me(user: StaffUser = Depends(current_user)) -> UserOut:
    return UserOut(id=user.id, username=user.username,
                   display_name=user.display_name, role=user.role)
