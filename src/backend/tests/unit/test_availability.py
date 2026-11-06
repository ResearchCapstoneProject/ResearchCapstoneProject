"""UT-02 to UT-04  Opening hours, slot tiling and the booking window."""
from datetime import date

import pytest
from freezegun import freeze_time

from app.services import availability
from app.services.availability import put_setting

from tests.conftest import make_booking, next_weekday

SATURDAY = 6      # the schema counts weekdays like JavaScript: Sunday = 0
MONDAY = 1


# ------------------------------------------------------------------ UT-02 tiling

def test_hourly_slots_tile_the_opening_hours(db):
    """Saturday is 09:00-17:00, so eight hourly slots, 09:00 to 16:00."""
    starts = availability.slot_starts(db, next_weekday(SATURDAY))
    assert starts == [(h, 0) for h in range(9, 17)]


def test_a_closed_day_has_no_slots(db):
    assert availability.slot_starts(db, next_weekday(MONDAY)) == []


@pytest.mark.parametrize("length,expected_last,expected_count", [
    (15, (16, 45), 32),
    (20, (16, 40), 24),
    (30, (16, 30), 16),
    (45, (15, 45), 10),     # 09:00 + 10*45 min = 16:30; the rest is dropped
    (60, (16, 0), 8),
    (90, (15, 0), 5),
    (120, (15, 0), 4),
])
def test_every_legal_slot_length_tiles_without_running_past_closing(
        db, length, expected_last, expected_count):
    """A trailing remainder shorter than one slot is dropped, not kept."""
    put_setting(db, "slot_minutes", str(length))
    db.commit()
    starts = availability.slot_starts(db, next_weekday(SATURDAY))

    assert len(starts) == expected_count
    assert starts[0] == (9, 0)
    assert starts[-1] == expected_last
    last = starts[-1][0] * 60 + starts[-1][1]
    assert last + length <= 17 * 60      # never past closing time


def test_a_remainder_shorter_than_one_slot_is_dropped(db):
    """45 minutes does not divide the 8-hour Saturday evenly.

    Ten slots fit (09:00 to 16:30); the 30 minutes left over do not become a
    short ninth slot and no slot is allowed to run past 17:00.
    """
    put_setting(db, "slot_minutes", "45")
    db.commit()
    starts = availability.slot_starts(db, next_weekday(SATURDAY))
    assert starts[-1] == (15, 45)         # ends 16:30
    assert (16, 30) not in starts         # would end 17:15
    assert all(h * 60 + m + 45 <= 17 * 60 for h, m in starts)


# ------------------------------------------------------ UT-03 setting robustness

@pytest.mark.parametrize("stored", ["37", "0", "-60", "1440", "sixty", ""])
def test_an_unusable_slot_length_falls_back_to_an_hour(db, stored):
    put_setting(db, "slot_minutes", stored)
    db.commit()
    assert availability.slot_minutes(db) == 60


@pytest.mark.parametrize("length", availability.SLOT_LENGTHS)
def test_a_legal_slot_length_is_accepted(db, length):
    put_setting(db, "slot_minutes", str(length))
    db.commit()
    assert availability.slot_minutes(db) == length


def test_capacity_and_window_come_from_the_settings(db):
    assert availability.capacity(db) == 40
    assert availability.window_days(db) == 14
    put_setting(db, "capacity_per_hour", "25")
    put_setting(db, "booking_window_days", "7")
    db.commit()
    assert availability.capacity(db) == 25
    assert availability.window_days(db) == 7


def test_tour_times_are_parsed_and_an_empty_setting_means_none(db):
    assert availability.tour_times(db) == [10, 14]
    put_setting(db, "tour_times", "")
    db.commit()
    assert availability.tour_times(db) == []


# ------------------------------------------------------------ UT-04 "is it past"

@freeze_time("2026-11-07 08:00:00")      # 10:00 in Gaborone (UTC+2)
def test_a_slot_counts_as_past_the_moment_it_starts():
    today = date(2026, 11, 7)
    assert availability.is_past(today, 10, 0) is True     # starts exactly now
    assert availability.is_past(today, 9, 0) is True
    assert availability.is_past(today, 11, 0) is False


@freeze_time("2026-11-07 08:00:00")
def test_past_is_judged_in_gaborone_time_not_utc():
    """08:00 UTC is 10:00 in Gaborone, so the 09:00 slot has gone."""
    assert availability.is_past(date(2026, 11, 7), 9, 30) is True


@freeze_time("2026-11-07 08:00:00")
def test_other_days_are_judged_by_the_date_alone():
    assert availability.is_past(date(2026, 11, 6), 23, 0) is True
    assert availability.is_past(date(2026, 11, 8), 0, 0) is False


@freeze_time("2026-11-07 08:00:00")
def test_the_slot_minute_is_part_of_the_comparison():
    today = date(2026, 11, 7)
    assert availability.is_past(today, 10, 0) is True
    assert availability.is_past(today, 10, 15) is False


# ---------------------------------------------------------- occupancy accounting

def test_occupancy_counts_only_confirmed_bookings(db):
    day = next_weekday(SATURDAY)
    make_booking(db, day, 10, visitors=3, code="BNM-AAAAA")
    make_booking(db, day, 10, visitors=5, code="BNM-BBBBB",
                 status="cancelled")
    taken = availability.taken_map(db, day, 1)
    assert taken[(day, 10, 0)] == 3


def test_occupancy_is_counted_per_slot_minute(db):
    """Half-hour slots share an hour, so the minute has to be in the key."""
    day = next_weekday(SATURDAY)
    make_booking(db, day, 10, 0, visitors=4, code="BNM-AAAAA")
    make_booking(db, day, 10, 30, visitors=6, code="BNM-BBBBB")
    taken = availability.taken_map(db, day, 1)
    assert taken[(day, 10, 0)] == 4
    assert taken[(day, 10, 30)] == 6


def test_remaining_subtracts_the_confirmed_visitors(db):
    day = next_weekday(SATURDAY)
    make_booking(db, day, 10, visitors=24, code="BNM-AAAAA")
    assert availability.remaining(db, day, 10, 0) == 16
