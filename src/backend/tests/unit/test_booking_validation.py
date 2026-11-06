"""UT-13  Server-side validation of a booking request (FR-06, NFR-10).

TC-04 in the report showed the browser refusing bad input. These tests show
the *server* refusing it, which is the check that matters: the client-side
one can be bypassed with curl.
"""
from datetime import date

import pytest
from pydantic import ValidationError

from app.schemas.bookings import BookingCreate

GOOD = dict(date=date(2026, 11, 7), hour=10, minute=0, q={"res": 2},
            name="Kagiso Molefe", email="kagiso@example.com", agree=True)


def make(**over):
    return BookingCreate(**{**GOOD, **over})


def test_a_complete_request_is_accepted():
    booking = make()
    assert booking.name == "Kagiso Molefe"
    assert booking.q == {"res": 2}
    assert booking.agree is True


# ----------------------------------------------------------------------- name

@pytest.mark.parametrize("name", ["", " ", "A", "  x  "])
def test_a_name_shorter_than_two_characters_is_refused(name):
    with pytest.raises(ValidationError):
        make(name=name)


def test_the_name_is_trimmed():
    assert make(name="  Kagiso  ").name == "Kagiso"


# ---------------------------------------------------------------------- e-mail

@pytest.mark.parametrize("email", [
    "no-at-sign",               # no @
    "kagiso@localhost",         # no dot in the domain
    "kagiso@",
])
def test_a_malformed_address_is_refused(email):
    with pytest.raises(ValidationError):
        make(email=email)


@pytest.mark.parametrize("email", [
    "kagiso molefe@example.com",                 # space
    "kagiso\tmolefe@example.com",                # tab: a second, empty recipient
    "kagiso@example.com\nBcc: victim@example.com",   # header injection
    "kagiso@example.com\r\nSubject: spam",
])
def test_whitespace_and_control_characters_are_refused(email):
    """A newline in an address is what mail-header injection needs."""
    with pytest.raises(ValidationError):
        make(email=email)


def test_a_valid_address_survives_trimming():
    assert make(email="  kagiso@example.com ").email == "kagiso@example.com"


def test_the_address_check_is_deliberately_shape_only():
    """Documented limit of this validator, pinned so a change is noticed.

    It checks the shape the wizard checks, not deliverability: an empty local
    part passes. app/schemas/bookings.py explains why EmailStr is not used
    (the email-validator package is not in this deployment).
    """
    assert make(email="@example.com").email == "@example.com"


# ------------------------------------------------------------------ quantities

def test_a_negative_quantity_is_refused():
    with pytest.raises(ValidationError):
        make(q={"res": -1})


def test_zero_quantities_are_allowed_in_the_payload():
    """The wizard sends every group, most of them zero; the router counts."""
    assert make(q={"res": 2, "child": 0}).q == {"res": 2, "child": 0}


# -------------------------------------------------------------- house rules

def test_the_house_rules_have_to_be_accepted():
    with pytest.raises(ValidationError):
        make(agree=False)


@pytest.mark.xfail(strict=True, reason="FINDING F-01: Pydantic v2 does not run "
                                       "field validators on default values, so a "
                                       "request that omits 'agree' entirely is "
                                       "accepted. Fix: make the field required, or "
                                       "Field(default=False, validate_default=True).")
def test_the_acceptance_is_required_not_merely_defaulted():
    """FR-06 requires the house rules to be accepted.

    Sending agree=false is refused (above), but *omitting* the field is not:
    the declared default False is never validated. A booking can therefore be
    made through the API without accepting the house rules.
    """
    with pytest.raises(ValidationError):
        BookingCreate(**{k: v for k, v in GOOD.items() if k != "agree"})


# ----------------------------------------------------------------- slot bounds

@pytest.mark.parametrize("hour", [-1, 24, 99])
def test_an_impossible_hour_is_refused(hour):
    with pytest.raises(ValidationError):
        make(hour=hour)


@pytest.mark.parametrize("minute", [-1, 60, 61])
def test_an_impossible_minute_is_refused(minute):
    with pytest.raises(ValidationError):
        make(minute=minute)


def test_the_minute_defaults_to_the_top_of_the_hour():
    assert BookingCreate(**{k: v for k, v in GOOD.items()
                            if k != "minute"}).minute == 0
