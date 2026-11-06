"""IT-01  GET /api/availability (FR-01, FR-02, FR-03)."""
from datetime import date, timedelta

from app.services.availability import put_setting

from tests.conftest import make_booking, next_weekday

SATURDAY, MONDAY = 6, 1


def days(client, **params):
    res = client.get("/api/availability", params=params)
    assert res.status_code == 200, res.text
    return res.json()


def day_for(client, wanted: date, **params):
    return next(d for d in days(client, **params) if d["date"] == wanted.isoformat())


def test_the_window_is_the_fourteen_days_the_museum_set(client):
    out = days(client)
    assert len(out) == 14
    assert out[0]["date"] == date.today().isoformat()
    assert out[-1]["date"] == (date.today() + timedelta(days=13)).isoformat()


def test_the_window_follows_the_setting(client, db):
    put_setting(db, "booking_window_days", "7")
    db.commit()
    assert len(days(client)) == 7


def test_a_monday_is_reported_as_closed_with_no_slots(client, closed_day):
    day = day_for(client, closed_day)
    assert day["closed"] is True
    assert day["slots"] == []


def test_a_saturday_has_the_eight_hourly_slots(client, open_day):
    day = day_for(client, open_day)
    assert day["closed"] is False
    assert [s["hour"] for s in day["slots"]] == list(range(9, 17))
    assert all(s["minute"] == 0 and s["minutes"] == 60 for s in day["slots"])


def test_every_slot_carries_the_capacity_and_the_measured_occupancy(
        client, open_day):
    slot = day_for(client, open_day)["slots"][0]
    assert slot["capacity"] == 40
    assert slot["taken"] == 0


def test_an_existing_booking_shows_up_as_occupancy(client, db, open_day):
    make_booking(db, open_day, 10, visitors=24, code="BNM-AAAAA")
    slots = {s["hour"]: s for s in day_for(client, open_day)["slots"]}
    assert slots[10]["taken"] == 24
    assert slots[11]["taken"] == 0


def test_a_cancelled_booking_does_not_occupy_a_place(client, db, open_day):
    make_booking(db, open_day, 10, visitors=10, code="BNM-AAAAA",
                 status="cancelled")
    slots = {s["hour"]: s for s in day_for(client, open_day)["slots"]}
    assert slots[10]["taken"] == 0


def test_a_public_holiday_is_labelled(client):
    """FINDING F-02: it is labelled only -- the day stays bookable."""
    out = days(client, start="2026-09-30", days=1)
    assert out[0]["holiday"] == "Botswana Day"


def test_a_shorter_slot_length_reaches_the_api(client, db, open_day):
    put_setting(db, "slot_minutes", "30")
    db.commit()
    slots = day_for(client, open_day)["slots"]
    assert len(slots) == 16
    assert slots[1]["hour"] == 9 and slots[1]["minute"] == 30
    assert all(s["minutes"] == 30 for s in slots)


def test_slots_of_today_that_have_started_are_marked_past(client):
    today = next(d for d in days(client) if d["date"] == date.today().isoformat())
    if today["closed"]:
        return
    assert all(isinstance(s["past"], bool) for s in today["slots"])
    hours = [s["hour"] for s in today["slots"] if s["past"]]
    assert hours == sorted(hours)        # the past slots are the early ones


def test_a_future_day_has_no_past_slots(client, open_day):
    assert all(s["past"] is False for s in day_for(client, open_day)["slots"])
