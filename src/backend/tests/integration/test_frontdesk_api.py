"""IT-12 to IT-14  The front desk, retention and erasure
(FR-10, FR-27, FR-31, NFR-11)."""
from datetime import date, timedelta

from app.models import AuditLog, Booking, BookingLine
from app.services.availability import put_setting

from tests.conftest import make_booking


# -------------------------------------------------------------- IT-12 check-in

def test_the_day_s_bookings_are_listed(sign_in, db, open_day):
    make_booking(db, open_day, 10, code="BNM-AAAAA")
    make_booking(db, open_day + timedelta(days=1), 10, code="BNM-BBBBB")
    rows = sign_in("frontdesk").get("/api/staff/bookings",
                                    params={"day": open_day.isoformat()}).json()
    assert [r["code"] for r in rows] == ["BNM-AAAAA"]


def test_a_cancelled_booking_is_not_listed(sign_in, db, open_day):
    make_booking(db, open_day, 10, code="BNM-AAAAA", status="cancelled")
    assert sign_in("frontdesk").get("/api/staff/bookings").json() == []


def test_checking_in_marks_the_booking(sign_in, db, open_day):
    make_booking(db, open_day, 10, visitors=3, code="BNM-AAAAA")
    body = sign_in("frontdesk").post(
        "/api/staff/bookings/BNM-AAAAA/check-in").json()
    assert body["checkedIn"] is True
    assert body["visitors"] == 3


def test_checking_in_twice_does_not_change_the_time(sign_in, db, open_day):
    """The front desk may well press the button again."""
    make_booking(db, open_day, 10, code="BNM-AAAAA")
    client = sign_in("frontdesk")
    client.post("/api/staff/bookings/BNM-AAAAA/check-in")
    first = db.query(Booking).one().checked_in_at
    client.post("/api/staff/bookings/BNM-AAAAA/check-in")
    db.expire_all()
    assert db.query(Booking).one().checked_in_at == first


def test_a_check_in_is_recorded_with_the_member_of_staff(
        sign_in, db, users, open_day):
    """FR-27."""
    make_booking(db, open_day, 10, code="BNM-AAAAA")
    sign_in("frontdesk").post("/api/staff/bookings/BNM-AAAAA/check-in")
    entry = db.query(AuditLog).filter(AuditLog.action == "checkin").one()
    assert entry.user_id == users["frontdesk"].id
    assert entry.entity_id == "BNM-AAAAA"
    assert entry.at is not None


def test_a_lowercase_code_can_be_checked_in(sign_in, db, open_day):
    make_booking(db, open_day, 10, code="BNM-AAAAA")
    assert sign_in("frontdesk").post(
        "/api/staff/bookings/bnm-aaaaa/check-in").status_code == 200


def test_an_unknown_code_cannot_be_checked_in(sign_in):
    assert sign_in("frontdesk").post(
        "/api/staff/bookings/BNM-ZZZZZ/check-in").status_code == 404


# -------------------------------------------------------------- IT-13 retention

def test_the_purge_reports_the_period_and_does_nothing_at_zero(
        sign_in, db, open_day):
    make_booking(db, date.today() - timedelta(days=5000), code="BNM-OLD01")
    body = sign_in("admin").post("/api/staff/bookings/purge").json()
    assert body == {"days": 0, "deleted": 0}
    assert db.query(Booking).count() == 1


def test_the_purge_deletes_what_is_past_the_period(sign_in, db):
    put_setting(db, "booking_retention_days", "30")
    db.commit()
    booking = make_booking(db, date.today() - timedelta(days=60),
                           code="BNM-OLD01")
    db.add(BookingLine(booking_id=booking.id, ticket_key="res", qty=2,
                       unit_price_thebe=0))
    make_booking(db, date.today() - timedelta(days=2), code="BNM-NEW01")
    db.commit()

    body = sign_in("admin").post("/api/staff/bookings/purge").json()
    assert body == {"days": 30, "deleted": 1}
    assert [b.code for b in db.query(Booking).all()] == ["BNM-NEW01"]
    assert db.query(BookingLine).count() == 0


def test_the_purge_is_recorded_without_naming_anybody(sign_in, db):
    put_setting(db, "booking_retention_days", "30")
    db.commit()
    make_booking(db, date.today() - timedelta(days=60), code="BNM-OLD01")
    sign_in("admin").post("/api/staff/bookings/purge")
    entry = db.query(AuditLog).filter(AuditLog.action == "purge").one()
    assert entry.detail == {"days": 30, "deleted": 1}
    assert "Test Visitor" not in str(entry.detail)


# ---------------------------------------------------------------- IT-14 erasure

def test_a_single_booking_can_be_deleted_on_request(sign_in, db, open_day):
    """FR-31: a visitor who asks to be forgotten."""
    booking = make_booking(db, open_day, 10, code="BNM-AAAAA")
    db.add(BookingLine(booking_id=booking.id, ticket_key="res", qty=2,
                       unit_price_thebe=0))
    db.commit()
    assert sign_in("admin").delete(
        "/api/staff/bookings/BNM-AAAAA").status_code == 204
    assert db.query(Booking).count() == 0
    assert db.query(BookingLine).count() == 0


def test_the_erasure_record_keeps_the_code_and_nothing_else(
        sign_in, db, open_day):
    """NFR-11: a log that recorded who was deleted would defeat the deletion."""
    make_booking(db, open_day, 10, code="BNM-AAAAA",
                 visitor_name="Kagiso Molefe", email="kagiso@example.com")
    sign_in("admin").delete("/api/staff/bookings/BNM-AAAAA")
    entry = db.query(AuditLog).filter(AuditLog.action == "delete").one()
    assert entry.entity_id == "BNM-AAAAA"
    assert entry.detail is None
    assert "Kagiso" not in str(entry.__dict__)
    assert "kagiso@example.com" not in str(entry.__dict__)


def test_deleting_an_unknown_booking_is_not_found(sign_in):
    assert sign_in("admin").delete(
        "/api/staff/bookings/BNM-ZZZZZ").status_code == 404


def test_a_deleted_ticket_can_no_longer_be_looked_up(sign_in, client, db,
                                                     open_day):
    make_booking(db, open_day, 10, code="BNM-AAAAA")
    sign_in("admin").delete("/api/staff/bookings/BNM-AAAAA")
    assert client.get("/api/bookings/BNM-AAAAA").status_code == 404


def test_deleting_a_booking_frees_its_place_again(sign_in, client, db, open_day):
    make_booking(db, open_day, 10, visitors=40, code="BNM-AAAAA")
    sign_in("admin").delete("/api/staff/bookings/BNM-AAAAA")
    res = client.get("/api/availability",
                     params={"start": open_day.isoformat(), "days": 1}).json()
    taken = {s["hour"]: s["taken"] for s in res[0]["slots"]}
    assert taken[10] == 0
