"""Booking reference codes.

The alphabet excludes I, O, 0 and 1 on purpose: a visitor reads this code out
at the front desk, and those four are the characters people get wrong.
"""
import secrets

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
ATTEMPTS = 5


def make_code() -> str:
    return "BNM-" + "".join(secrets.choice(ALPHABET) for _ in range(5))


def insert_with_unique_code(db: Session, build, /):
    """Insert a row whose `code` must be unique, retrying on collision.

    Deliberately not SELECT-then-INSERT: between the check and the insert
    another request can take the code. The UNIQUE index is the real guard, so
    we let it fire and try again.
    """
    for attempt in range(ATTEMPTS):
        code = make_code()
        obj = build(code)
        db.add(obj)
        try:
            db.flush()
            return obj
        except IntegrityError:
            db.rollback()
            if attempt == ATTEMPTS - 1:
                raise
    raise RuntimeError("unreachable")
