"""GET /api/config -- one call replacing nine hard-coded frontend constants."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..config import settings
from ..db import get_db
from ..models import Department, Holiday, Location, OpeningHours, Room, TicketType
from ..schemas.reference import (
    ConfigOut, DepartmentOut, LocationOut, RoomOut, TicketTypeOut,
)
from ..services import availability

router = APIRouter(prefix="/api", tags=["config"])


@router.get("/config", response_model=ConfigOut)
def get_config(db: Session = Depends(get_db)) -> ConfigOut:
    hours: dict[str, list[int] | None] = {}
    for row in db.query(OpeningHours).order_by(OpeningHours.weekday).all():
        hours[str(row.weekday)] = (
            None if row.open_hour is None else [row.open_hour, row.close_hour]
        )

    return ConfigOut(
        departments=[
            DepartmentOut(key=d.name, code=d.code)
            for d in db.query(Department).order_by(Department.sort_order).all()
        ],
        locations=[
            LocationOut(label=l.label, room_id=l.room_id, is_store=l.is_store)
            for l in db.query(Location).order_by(Location.sort_order).all()
        ],
        rooms=[
            RoomOut(id=r.id, name=r.name, sub=r.sub, kind=r.kind,
                    x=r.x, y=r.y, w=r.w, h=r.h)
            for r in db.query(Room).order_by(Room.sort_order).all()
        ],
        hours=hours,
        holidays={h.md: h.label for h in db.query(Holiday).all()},
        tickets=[
            TicketTypeOut(key=t.ticket_key, name=t.name, desc=t.description,
                          price_thebe=t.price_thebe, addon=t.is_addon)
            for t in db.query(TicketType)
            .filter(TicketType.is_active.is_(True))
            .order_by(TicketType.sort_order).all()
        ],
        capacity=availability.capacity(db),
        tour_times=availability.tour_times(db),
        # What the client bakes into printed QR codes.
        public_base_url=settings.public_base_url,
        booking_window_days=availability.window_days(db),
        currency=availability.setting(db, "currency", "BWP"),
    )
