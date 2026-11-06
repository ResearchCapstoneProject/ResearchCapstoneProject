"""UT-14  Password hashing and session tokens (NFR-08)."""
import hashlib
import re
from datetime import datetime, timedelta, timezone

from app import security


def test_passwords_are_stored_as_argon2id():
    """NFR-08 names the algorithm, so the test checks the algorithm."""
    hashed = security.hash_password("a password")
    assert hashed.startswith("$argon2id$")


def test_the_plain_password_never_appears_in_the_hash():
    assert "battery staple" not in security.hash_password("battery staple")


def test_the_same_password_hashes_differently_every_time():
    """A per-hash salt, so equal passwords are not visible in a dump."""
    a = security.hash_password("same")
    b = security.hash_password("same")
    assert a != b
    assert security.verify_password("same", a)
    assert security.verify_password("same", b)


def test_a_wrong_password_is_rejected():
    hashed = security.hash_password("right")
    assert security.verify_password("wrong", hashed) is False


def test_an_unparsable_hash_is_rejected_rather_than_raising():
    """A corrupted row must fail the sign-in, not return a 500."""
    assert security.verify_password("anything", "not-a-hash") is False
    assert security.verify_password("anything", "") is False


def test_session_tokens_are_long_and_random():
    tokens = {security.new_token() for _ in range(500)}
    assert len(tokens) == 500
    assert all(len(t) >= 43 for t in tokens)       # 32 bytes, urlsafe base64
    assert all(re.fullmatch(r"[A-Za-z0-9_-]+", t) for t in tokens)


def test_only_the_sha256_of_a_token_is_ever_stored():
    """NFR-08: a database dump must not hand over live sessions."""
    token = security.new_token()
    stored = security.token_id(token)
    assert stored == hashlib.sha256(token.encode()).hexdigest()
    assert len(stored) == 64
    assert token not in stored


def test_token_hashing_is_deterministic():
    token = security.new_token()
    assert security.token_id(token) == security.token_id(token)


def test_a_session_expires_twelve_hours_after_sign_in():
    """NFR-08 states 12 hours; the default must match the requirement."""
    delta = security.session_expiry() - datetime.now(timezone.utc)
    assert timedelta(hours=11, minutes=59) < delta <= timedelta(hours=12)


def test_the_absolute_cap_is_seven_days():
    assert security.absolute_cap() == timedelta(days=7)
