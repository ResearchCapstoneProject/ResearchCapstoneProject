"""Booking data do not stay forever.

A booking holds a name, an e-mail address, usually a phone number and the day
somebody was in the building. The privacy notice says those data are used to
manage the visit -- which means they have to go when the visit is long over,
and the museum is the one who decides how long that is.

The period is a setting, in days, and 0 means "keep them", which is the
default: a deployment does not start deleting records because a developer
picked a number. Once the museum sets one, old bookings go on every start of
the API and whenever the staff area asks.
"""
from datetime import date, timedelta

from sqlalchemy import delete
from sqlalchemy.orm import Session

from ..models import Booking, BookingLine
from .availability import setting

MAX_DAYS = 3650          # ten years: beyond that the setting is a typo


def retention_days(db: Session) -> int:
    try:
        days = int(setting(db, "booking_retention_days", "0"))
    except ValueError:
        return 0
    return days if 0 <= days <= MAX_DAYS else 0


def cutoff_for(days: int) -> date:
    return date.today() - timedelta(days=days)


def purge_old_bookings(db: Session) -> int:
    """Delete bookings whose visit is longer ago than the retention period.

    The booking lines are deleted explicitly rather than left to the foreign
    key: MySQL would cascade, SQLite only does with foreign keys switched on,
    and a deletion that depends on which database it runs against is not one
    to trust with personal data.
    """
    days = retention_days(db)
    if days <= 0:
        return 0

    cutoff = cutoff_for(days)
    ids = [row[0] for row in
           db.query(Booking.id).filter(Booking.visit_date < cutoff).all()]
    if not ids:
        return 0

    db.execute(delete(BookingLine).where(BookingLine.booking_id.in_(ids)))
    db.execute(delete(Booking).where(Booking.id.in_(ids)))
    db.commit()
    return len(ids)
