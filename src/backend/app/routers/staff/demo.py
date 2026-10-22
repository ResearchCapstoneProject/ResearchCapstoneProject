"""Reset the demo data -- the server-side twin of the prototype bar's button."""
from fastapi import APIRouter, Depends
from sqlalchemy import delete
from sqlalchemy.orm import Session

from ...config import settings
from ...db import get_db
from ...deps import require_role
from ...errors import forbidden
from ...models import Booking, MuseumObject, ScanEvent, StaffUser
from ...services import audit

router = APIRouter(tags=["staff:demo"])


@router.post("/demo/reset")
def reset(db: Session = Depends(get_db),
          user: StaffUser = Depends(require_role("admin"))) -> dict:
    if not settings.demo_reset_enabled:
        raise forbidden("Demo reset is disabled on this deployment.")

    bookings = db.execute(delete(Booking).where(Booking.source != "demo")).rowcount
    scans = db.execute(delete(ScanEvent).where(ScanEvent.source != "seed")).rowcount
    objects = db.execute(
        delete(MuseumObject).where(MuseumObject.is_seed.is_(False))
    ).rowcount

    audit.record(db, user_id=user.id, action="reset", entity="demo")
    db.commit()
    # inventory_counter is deliberately untouched: a number must never be
    # reused, not even after a reset. This looks like a bug if you do not know.
    return {"bookings": bookings, "scans": scans, "objects": objects}
