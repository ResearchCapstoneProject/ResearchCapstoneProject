"""IT-08, IT-11  Sign-in, cookies and sessions (NFR-07, NFR-08, NFR-09)."""
import time

from app.config import settings
from app.models import AuditLog, StaffSession
from app.security import token_id

from tests.conftest import PASSWORD, utc_naive


def cookies_of(res):
    """Set-Cookie headers as {name: raw header}."""
    out = {}
    for raw in res.headers.get_list("set-cookie"):
        out[raw.split("=", 1)[0]] = raw
    return out


def login(client, username="admin", password=PASSWORD):
    return client.post("/api/auth/login",
                       json={"username": username, "password": password})


# ------------------------------------------------------------------- signing in

def test_a_correct_password_signs_the_user_in(client, users):
    res = login(client)
    assert res.status_code == 200
    assert res.json()["username"] == "admin"
    assert res.json()["role"] == "admin"


def test_a_wrong_password_is_refused(client, users):
    assert login(client, password="wrong").status_code == 401


def test_an_unknown_user_is_refused(client, users):
    assert login(client, username="nobody").status_code == 401


def test_a_wrong_password_and_an_unknown_user_answer_identically(client, users):
    """So the response cannot be used to find out which accounts exist."""
    unknown = login(client, username="nobody")
    wrong = login(client, password="wrong")
    assert unknown.status_code == wrong.status_code
    assert unknown.json() == wrong.json()


def test_a_deactivated_account_cannot_sign_in(client, db, users):
    users["curator"].is_active = False
    db.commit()
    assert login(client, username="curator").status_code == 401


def test_the_password_is_never_echoed_back(client, users):
    assert PASSWORD not in login(client).text


# -------------------------------------------------------- IT-08 the cookie flags

def test_the_session_cookie_is_httponly(client, users):
    """NFR-07. This page builds markup from staff text, so a token readable
    by JavaScript would be an XSS liability."""
    jar = cookies_of(login(client))
    assert "HttpOnly" in jar[settings.cookie_name]


def test_the_session_cookie_is_samesite_lax(client, users):
    jar = cookies_of(login(client))
    assert "samesite=lax" in jar[settings.cookie_name].lower()


def test_the_csrf_cookie_is_readable_by_the_client_on_purpose(client, users):
    """The client mirrors it into X-CSRF-Token, so it must not be HttpOnly."""
    jar = cookies_of(login(client))
    assert "HttpOnly" not in jar[settings.csrf_cookie_name]


def test_both_cookies_are_marked_secure_in_production(client, users,
                                                      monkeypatch):
    """NFR-07 requires Secure once the site is served over HTTPS.

    COOKIE_SECURE=1 is what the server's .env sets; the flag is asserted
    here rather than read off a deployed response.
    """
    monkeypatch.setattr(settings, "cookie_secure", True)
    jar = cookies_of(login(client))
    assert "Secure" in jar[settings.cookie_name]
    assert "Secure" in jar[settings.csrf_cookie_name]


def test_the_cookies_are_not_secure_in_local_development(client, users):
    jar = cookies_of(login(client))
    assert "Secure" not in jar[settings.cookie_name]


def test_the_cookie_lifetime_matches_the_session_length(client, users):
    jar = cookies_of(login(client))
    assert f"Max-Age={settings.session_hours * 3600}" in jar[settings.cookie_name]


# ------------------------------------------------------------- the session row

def test_only_the_hash_of_the_token_is_stored(client, db, users):
    """NFR-08: a database dump must not hand over live sessions."""
    login(client)
    token = client.cookies[settings.cookie_name]
    rows = db.query(StaffSession).all()
    assert len(rows) == 1
    assert rows[0].id == token_id(token)
    assert token not in rows[0].id


def test_the_sign_in_is_recorded_in_the_audit_trail(client, db, users):
    login(client)
    entry = db.query(AuditLog).filter(AuditLog.action == "login").one()
    assert entry.user_id == users["admin"].id


def test_the_last_sign_in_is_recorded_on_the_account(client, db, users):
    login(client)
    db.refresh(users["admin"])
    assert users["admin"].last_login_at is not None


def test_the_user_agent_is_kept_for_the_session(client, db, users):
    client.post("/api/auth/login",
                json={"username": "admin", "password": PASSWORD},
                headers={"User-Agent": "Front desk tablet"})
    assert db.query(StaffSession).one().user_agent == "Front desk tablet"


# ------------------------------------------------------------- who am I / expiry

def test_me_answers_for_a_signed_in_user(client, users):
    login(client)
    assert client.get("/api/auth/me").json()["username"] == "admin"


def test_me_is_refused_without_a_session(client, users):
    assert client.get("/api/auth/me").status_code == 401


def test_an_expired_session_is_refused(client, db, users):
    login(client)
    db.query(StaffSession).one().expires_at = utc_naive(hours=-1)
    db.commit()
    res = client.get("/api/auth/me")
    assert res.status_code == 401
    assert "expired" in res.json()["detail"]["message"].lower()


def test_a_session_whose_account_was_deactivated_is_refused(client, db, users):
    login(client)
    users["admin"].is_active = False
    db.commit()
    assert client.get("/api/auth/me").status_code == 401


def test_a_made_up_token_is_refused(client, users):
    client.cookies.set(settings.cookie_name, "not-a-real-token")
    assert client.get("/api/auth/me").status_code == 401


def test_using_the_session_slides_its_last_seen_time(client, db, users):
    """The sliding expiry of NFR-08.

    Both timestamps are the ones the API itself writes, one request apart.
    Comparing against a value inserted by the database's own DEFAULT
    CURRENT_TIMESTAMP(3) would compare two different clocks -- the DB
    server's and the API process's -- which says nothing about the sliding
    expiry.
    """
    login(client)
    client.get("/api/auth/me")
    db.commit()
    db.expire_all()
    before = db.query(StaffSession).one().last_seen_at

    db.commit()
    time.sleep(0.05)                 # one tick of DATETIME(3)
    client.get("/api/auth/me")
    db.commit()
    db.expire_all()
    assert db.query(StaffSession).one().last_seen_at > before


# --------------------------------------------------------------- signing out

def test_signing_out_deletes_the_session_row(client, db, users):
    login(client)
    client.post("/api/auth/logout")
    assert db.query(StaffSession).count() == 0


def test_a_token_cannot_be_reused_after_signing_out(client, db, users):
    login(client)
    token = client.cookies[settings.cookie_name]
    client.post("/api/auth/logout")
    client.cookies.set(settings.cookie_name, token)
    assert client.get("/api/auth/me").status_code == 401


def test_signing_out_without_a_session_is_harmless(client, users):
    assert client.post("/api/auth/logout").status_code == 200
