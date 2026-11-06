"""UT-15  The confirmation e-mail (FR-08).

The end of the entry window is computed from the slot length, which became
configurable in the final phase: the arithmetic has to wrap correctly and
must not produce a 25th hour.
"""
import email
import glob
import os

from app.config import settings
from app.routers.bookings import send_confirmation
from app.services.availability import put_setting


def outbox():
    return sorted(glob.glob(str(settings.mail_outbox_dir / "*.eml")),
                  key=os.path.getmtime)


def last_message():
    with open(outbox()[-1], "rb") as fh:
        return email.message_from_binary_file(fh)


def send(db, hour, minute, length=60, **over):
    put_setting(db, "slot_minutes", str(length))
    db.commit()
    args = dict(code="BNM-JR339", to="kagiso@example.com", name="Kagiso Molefe",
                day="2026-11-07", hour=hour, minute=minute, visitors=3,
                total_thebe=0, q={"res": 3}, event_title="")
    args.update(over)
    send_confirmation(**args)
    return last_message().get_payload()


def test_the_entry_window_is_the_slot_length_after_the_start(db):
    assert "10:00 – 11:00" in send(db, 10, 0, 60)


def test_a_half_hour_slot_ends_half_an_hour_later(db):
    assert "10:30 – 11:00" in send(db, 10, 30, 30)


def test_a_ninety_minute_slot_crosses_the_hour(db):
    assert "09:00 – 10:30" in send(db, 9, 0, 90)


def test_a_slot_that_runs_past_midnight_wraps_to_the_next_day(db):
    """23:00 + 120 min must read 01:00, never 25:00."""
    assert "23:00 – 01:00" in send(db, 23, 0, 120)


def test_a_fifteen_minute_slot_keeps_the_minutes(db):
    assert "16:45 – 17:00" in send(db, 16, 45, 15)


def test_the_booking_code_is_in_the_message(db):
    assert "BNM-JR339" in send(db, 10, 0)


def test_the_ticket_link_uses_the_configured_public_address(db):
    body = send(db, 10, 0)
    assert f"{settings.public_base_url}/#/ticket/BNM-JR339" in body


def test_free_admission_is_worded_as_free(db):
    assert "free" in send(db, 10, 0, total_thebe=0).lower()


def test_a_price_is_shown_in_pula_to_be_paid_at_the_front_desk(db):
    body = send(db, 10, 0, total_thebe=5000)
    assert "BWP 50.00" in body
    assert "front desk" in body


def test_the_subject_carries_the_code_not_the_visitor_s_name(db):
    send(db, 10, 0)
    subject = last_message()["Subject"]
    assert "BNM-JR339" in subject
    assert "Kagiso" not in subject


def test_the_visitor_group_names_are_resolved_from_the_price_list(db):
    assert "Admission" in send(db, 10, 0, q={"res": 3})
