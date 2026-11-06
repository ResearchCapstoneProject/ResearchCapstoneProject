"""Front-desk view of bookings."""
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import not_found
from ...models import Booking, BookingLine, StaffUser
from ...schemas.bookings import BookingOut
from ...services import audit, retention
from ..bookings import booking_out

router = APIRouter(tags=["staff:visits"])


@router.get("/bookings", response_model=list[BookingOut])
def list_bookings(day: date | None = None,
                  db: Session = Depends(get_db)) -> list[BookingOut]:
    q = db.query(Booking).filter(Booking.status == "confirmed")
    if day:
        q = q.filter(Booking.visit_date == day)
    rows = q.order_by(Booking.created_at.desc()).all()
    return [booking_out(b) for b in rows]


@router.delete("/bookings/{code}", status_code=204)
def delete_booking(code: str, db: Session = Depends(get_db),
                   user: StaffUser = Depends(require_role("admin"))) -> None:
    """Delete one booking, for a visitor who asks to be forgotten.

    The audit entry keeps the code and nothing else: a log that recorded who
    was deleted would defeat the deletion.
    """
    b = db.query(Booking).filter(Booking.code == code.upper()).one_or_none()
    if b is None:
        raise not_found("No booking with that code.")

    db.execute(delete(BookingLine).where(BookingLine.booking_id == b.id))
    db.delete(b)
    audit.record(db, user_id=user.id, action="delete", entity="booking",
                 entity_id=b.code)
    db.commit()


@router.post("/bookings/purge")
def purge(db: Session = Depends(get_db),
          user: StaffUser = Depends(require_role("admin"))) -> dict:
    """Apply the retention period now, rather than at the next restart."""
    days = retention.retention_days(db)
    deleted = retention.purge_old_bookings(db)
    audit.record(db, user_id=user.id, action="purge", entity="booking",
                 detail={"days": days, "deleted": deleted})
    db.commit()
    return {"days": days, "deleted": deleted}


@router.post("/bookings/{code}/check-in", response_model=BookingOut)
def check_in(code: str, db: Session = Depends(get_db),
             user: StaffUser = Depends(require_role("frontdesk"))) -> BookingOut:
    b = db.query(Booking).filter(Booking.code == code.upper()).one_or_none()
    if b is None:
        raise not_found("No booking with that code.")
    if b.checked_in_at is None:
        b.checked_in_at = datetime.now(timezone.utc).replace(tzinfo=None)
        audit.record(db, user_id=user.id, action="checkin", entity="booking",
                     entity_id=b.code)
        db.commit()
        db.refresh(b)
    return booking_out(b)
