"""UT-01  Booking reference codes (FR-07)."""
import re
from datetime import date
from unittest.mock import patch

import pytest
from sqlalchemy.exc import IntegrityError

from app.models import Booking
from app.services import booking_codes

CODE = re.compile(r"^BNM-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{5}$")
CONFUSABLE = set("IO01")


def test_code_has_the_documented_shape():
    assert CODE.match(booking_codes.make_code())


def test_alphabet_never_uses_a_confusable_character():
    """I, O, 0 and 1 are the four a visitor misreads at the front desk."""
    body = "".join(booking_codes.make_code()[4:] for _ in range(2000))
    assert not (set(body) & CONFUSABLE)
    assert len(body) == 10000


def test_codes_are_drawn_from_the_whole_alphabet():
    seen = {c for _ in range(2000) for c in booking_codes.make_code()[4:]}
    assert seen == set(booking_codes.ALPHABET)


def test_codes_do_not_repeat_in_practice():
    codes = {booking_codes.make_code() for _ in range(5000)}
    assert len(codes) > 4990       # 32**5 = 33.5 M; collisions are the exception


def test_insert_retries_after_a_collision(db):
    """The UNIQUE index is the guard, not a SELECT before the INSERT."""
    calls = []
    real_flush = db.flush

    def flush_once_failing():
        calls.append(1)
        if len(calls) == 1:
            raise IntegrityError("duplicate", None, Exception("duplicate"))
        return real_flush()

    with patch.object(db, "flush", flush_once_failing):
        obj = booking_codes.insert_with_unique_code(
            db, lambda code: Booking(
                code=code, visit_date=date(2026, 11, 7), visit_hour=10,
                visit_minute=0, visitors=1, total_thebe=0,
                visitor_name="A", email="a@example.com"),
        )
    assert len(calls) == 2
    assert CODE.match(obj.code)


def test_insert_gives_up_after_five_attempts(db):
    def always_failing():
        raise IntegrityError("duplicate", None, Exception("duplicate"))

    with patch.object(db, "flush", always_failing):
        with pytest.raises(IntegrityError):
            booking_codes.insert_with_unique_code(
                db, lambda code: Booking(
                    code=code, visit_date=date(2026, 11, 7), visit_hour=10,
                    visit_minute=0, visitors=1, total_thebe=0,
                    visitor_name="A", email="a@example.com"),
            )
