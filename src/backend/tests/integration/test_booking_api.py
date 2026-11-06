"""IT-02 to IT-06  POST /api/bookings (FR-03 to FR-07, NFR-10)."""
from datetime import date, timedelta

from app.models import Booking, BookingLine
from app.services.availability import put_setting

from tests.conftest import booking_payload, make_booking, next_weekday


def post(client, payload):
    return client.post("/api/bookings", json=payload)


def detail(res):
    return res.json()["detail"]


# --------------------------------------------------------------- IT-02 happy path

def test_a_valid_booking_is_created(client, open_day):
    res = post(client, booking_payload(open_day))
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["code"].startswith("BNM-")
    assert body["visitors"] == 2
    assert body["date"] == open_day.isoformat()
    assert body["checkedIn"] is False
    assert body["source"] == "online"


def test_the_booking_and_its_lines_are_written(client, db, open_day):
    code = post(client, booking_payload(open_day)).json()["code"]
    booking = db.query(Booking).filter(Booking.code == code).one()
    assert booking.visitors == 2
    lines = db.query(BookingLine).filter(BookingLine.booking_id == booking.id).all()
    assert {l.ticket_key: l.qty for l in lines} == {"res": 2}


def test_zero_quantities_are_not_written_as_lines(client, db, open_day):
    code = post(client, booking_payload(open_day,
                                        q={"res": 2, "child": 0})).json()["code"]
    booking = db.query(Booking).filter(Booking.code == code).one()
    assert len(booking.lines) == 1


def test_only_non_addon_groups_count_as_visitors(client, open_day):
    body = post(client, booking_payload(
        open_day, q={"res": 2, "tour": 2})).json()
    assert body["visitors"] == 2        # the two tour places are not people


# ------------------------------------------------------ IT-03 the total is ours

def test_the_total_is_calculated_from_the_museum_s_price_list(client, open_day):
    body = post(client, booking_payload(open_day, q={"intl": 2})).json()
    assert body["totalThebe"] == 10000      # 2 x P 50.00


def test_a_mixed_booking_is_added_up_correctly(client, open_day):
    body = post(client, booking_payload(
        open_day, q={"intl": 1, "child": 2, "res": 1})).json()
    assert body["totalThebe"] == 5000 + 2 * 2000 + 0


def test_free_admission_totals_nothing(client, open_day):
    assert post(client, booking_payload(open_day)).json()["totalThebe"] == 0


def test_a_total_supplied_by_the_client_is_ignored(client, open_day):
    """NFR-10: the server never trusts a price it did not calculate."""
    payload = booking_payload(open_day, q={"intl": 2})
    payload["totalThebe"] = 1
    payload["total_thebe"] = 1
    payload["price"] = 1
    assert post(client, payload).json()["totalThebe"] == 10000


def test_a_retired_visitor_group_cannot_be_booked(client, open_day):
    res = post(client, booking_payload(open_day, q={"old": 1}))
    assert res.status_code == 400
    assert detail(res)["code"] == "unknown_ticket"


def test_an_invented_visitor_group_is_refused(client, open_day):
    res = post(client, booking_payload(open_day, q={"freebie": 50}))
    assert res.status_code == 400
    assert detail(res)["code"] == "unknown_ticket"


# ------------------------------------------------------------- IT-04 slot rules

def test_a_booking_on_a_closed_day_is_refused(client, closed_day):
    res = post(client, booking_payload(closed_day))
    assert res.status_code == 400
    assert detail(res)["code"] == "closed"


def test_a_booking_outside_the_opening_hours_is_refused(client, open_day):
    res = post(client, booking_payload(open_day, hour=20))
    assert res.status_code == 400
    assert detail(res)["code"] == "closed"


def test_a_booking_that_would_start_mid_slot_is_refused(client, open_day):
    """With hourly slots, 10:30 is not the start of anything."""
    res = post(client, booking_payload(open_day, hour=10, minute=30))
    assert res.status_code == 400
    assert detail(res)["code"] == "closed"


def test_a_start_minute_becomes_valid_when_the_museum_shortens_the_slots(
        client, db, open_day):
    put_setting(db, "slot_minutes", "30")
    db.commit()
    assert post(client, booking_payload(open_day, hour=10,
                                        minute=30)).status_code == 201


def test_a_slot_in_the_past_is_refused(client):
    yesterday = date.today() - timedelta(days=1)
    res = post(client, booking_payload(yesterday, hour=10))
    assert res.status_code == 400
    assert detail(res)["code"] in ("past_slot", "closed")


def test_a_booking_with_no_visitors_is_refused(client, open_day):
    res = post(client, booking_payload(open_day, q={"res": 0}))
    assert res.status_code == 400
    assert detail(res)["code"] == "no_visitors"


def test_a_booking_of_add_ons_alone_is_refused(client, open_day):
    res = post(client, booking_payload(open_day, hour=10, q={"tour": 2}))
    assert res.status_code == 400
    assert detail(res)["code"] == "no_visitors"


# ---------------------------------------------------------- IT-05 slot capacity

def test_a_booking_that_would_exceed_the_capacity_is_refused(
        client, db, open_day):
    make_booking(db, open_day, 10, visitors=38, code="BNM-AAAAA")
    res = post(client, booking_payload(open_day, hour=10, q={"res": 3}))
    assert res.status_code == 409
    assert detail(res)["code"] == "slot_full"
    assert detail(res)["remaining"] == 2


def test_a_booking_that_exactly_fills_the_slot_is_accepted(client, db, open_day):
    make_booking(db, open_day, 10, visitors=38, code="BNM-AAAAA")
    assert post(client, booking_payload(open_day, hour=10,
                                        q={"res": 2})).status_code == 201


def test_a_full_slot_reports_no_places_left(client, db, open_day):
    make_booking(db, open_day, 10, visitors=40, code="BNM-AAAAA")
    res = post(client, booking_payload(open_day, hour=10, q={"res": 1}))
    assert res.status_code == 409
    assert detail(res)["remaining"] == 0


def test_a_full_slot_does_not_block_the_next_one(client, db, open_day):
    make_booking(db, open_day, 10, visitors=40, code="BNM-AAAAA")
    assert post(client, booking_payload(open_day, hour=11)).status_code == 201


def test_the_capacity_is_never_exceeded_across_several_bookings(
        client, db, open_day):
    accepted = 0
    for _ in range(25):
        if post(client, booking_payload(open_day, hour=10,
                                        q={"res": 3})).status_code == 201:
            accepted += 1
    total = sum(b.visitors for b in db.query(Booking)
                .filter(Booking.visit_hour == 10,
                        Booking.status == "confirmed").all())
    assert accepted == 13          # 13 x 3 = 39; the 14th would make 42
    assert total == 39
    assert total <= 40


# -------------------------------------------------------------- IT-06 add-ons

def test_a_guided_tour_outside_the_tour_times_is_refused(client, open_day):
    res = post(client, booking_payload(open_day, hour=11,
                                       q={"res": 2, "tour": 2}))
    assert res.status_code == 400
    assert detail(res)["code"] == "tour_time"


def test_a_guided_tour_at_a_tour_time_is_accepted(client, open_day):
    assert post(client, booking_payload(open_day, hour=10,
                                        q={"res": 2, "tour": 2})).status_code == 201


def test_at_most_one_tour_place_per_visitor(client, open_day):
    res = post(client, booking_payload(open_day, hour=10,
                                       q={"res": 1, "tour": 2}))
    assert res.status_code == 400
    assert detail(res)["code"] == "tour_qty"


def test_clearing_the_tour_times_frees_the_add_on_from_fixed_hours(
        client, db, open_day):
    put_setting(db, "tour_times", "")
    db.commit()
    assert post(client, booking_payload(open_day, hour=11,
                                        q={"res": 2, "tour": 2})).status_code == 201


# ------------------------------------------------------------- IT-07 validation

def test_the_server_refuses_input_the_browser_would_have_caught(
        client, open_day):
    """TC-04 showed the browser refusing this; here the API does."""
    for bad in ({"name": "A"}, {"email": "nope"}, {"agree": False},
                {"q": {"res": -1}}):
        res = post(client, booking_payload(open_day, **bad))
        assert res.status_code == 422, (bad, res.text)


def test_an_address_with_a_newline_is_refused_by_the_api(client, open_day):
    res = post(client, booking_payload(
        open_day, email="k@example.com\nBcc: victim@example.com"))
    assert res.status_code == 422
