"""UT-05  Retention period for booking data (FR-31, NFR-11)."""
from datetime import date, timedelta

import pytest

from app.models import Booking, BookingLine
from app.services import retention
from app.services.availability import put_setting

from tests.conftest import make_booking, next_weekday


def set_days(db, value):
    put_setting(db, "booking_retention_days", str(value))
    db.commit()


# ------------------------------------------------------------ reading the period

def test_the_default_is_keep_rather_than_a_number_a_developer_picked(db):
    """0 means "keep"; a deployment must not start deleting on its own."""
    assert retention.retention_days(db) == 0


@pytest.mark.parametrize("stored,expected", [
    ("30", 30), ("1", 1), ("3650", 3650),
    ("0", 0),
    ("-1", 0),          # nonsense
    ("3651", 0),        # beyond ten years: a typo
    ("thirty", 0),
    ("", 0),
])
def test_an_unusable_period_is_treated_as_keep(db, stored, expected):
    set_days(db, stored)
    assert retention.retention_days(db) == expected


def test_the_cap_is_the_documented_ten_years():
    assert retention.MAX_DAYS == 3650


def test_the_cutoff_is_counted_back_from_today():
    assert retention.cutoff_for(30) == date.today() - timedelta(days=30)


# -------------------------------------------------------------------- purging

def test_nothing_is_deleted_while_the_period_is_zero(db):
    make_booking(db, date.today() - timedelta(days=5000), code="BNM-OLD01")
    assert retention.purge_old_bookings(db) == 0
    assert db.query(Booking).count() == 1


def test_a_booking_older_than_the_period_is_deleted(db):
    set_days(db, 30)
    make_booking(db, date.today() - timedelta(days=31), code="BNM-OLD01")
    assert retention.purge_old_bookings(db) == 1
    assert db.query(Booking).count() == 0


def test_a_booking_inside_the_period_is_kept(db):
    set_days(db, 30)
    make_booking(db, date.today() - timedelta(days=29), code="BNM-NEW01")
    assert retention.purge_old_bookings(db) == 0
    assert db.query(Booking).count() == 1


def test_the_boundary_day_is_kept(db):
    """The comparison is "older than the cutoff", not "on or older"."""
    set_days(db, 30)
    make_booking(db, retention.cutoff_for(30), code="BNM-EDGE1")
    assert retention.purge_old_bookings(db) == 0


def test_a_future_visit_is_never_deleted(db):
    set_days(db, 1)
    make_booking(db, next_weekday(6), code="BNM-FUT01")
    assert retention.purge_old_bookings(db) == 0


def test_the_booking_lines_go_with_the_booking(db):
    """Deleted explicitly, so the result does not depend on the database."""
    set_days(db, 30)
    booking = make_booking(db, date.today() - timedelta(days=99),
                           code="BNM-OLD02")
    db.add(BookingLine(booking_id=booking.id, ticket_key="res", qty=2,
                       unit_price_thebe=0))
    db.commit()
    assert retention.purge_old_bookings(db) == 1
    assert db.query(BookingLine).count() == 0


def test_only_the_bookings_past_the_period_are_touched(db):
    set_days(db, 30)
    make_booking(db, date.today() - timedelta(days=60), code="BNM-OLD03")
    make_booking(db, date.today() - timedelta(days=90), code="BNM-OLD04")
    make_booking(db, date.today() - timedelta(days=2), code="BNM-NEW02")
    assert retention.purge_old_bookings(db) == 2
    remaining = [b.code for b in db.query(Booking).all()]
    assert remaining == ["BNM-NEW02"]
