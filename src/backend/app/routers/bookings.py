"""Availability and the booking write path."""
from datetime import date, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..errors import bad_request, conflict, not_found
from ..models import Booking, BookingLine, TicketType
from ..schemas.bookings import (
    BookingCreate, BookingOut, DayAvailability, SlotOut,
)
from ..services import availability, booking_codes

router = APIRouter(prefix="/api", tags=["visits"])


def booking_out(b: Booking) -> BookingOut:
    return BookingOut(
        code=b.code, date=b.visit_date.isoformat(), hour=b.visit_hour,
        q={l.ticket_key: l.qty for l in b.lines},
        visitors=b.visitors, total_thebe=b.total_thebe,
        name=b.visitor_name, email=b.email, phone=b.phone, country=b.country,
        created=int(b.created_at.timestamp() * 1000),
        checked_in=b.checked_in, source=b.source,
    )


@router.get("/availability", response_model=list[DayAvailability])
def get_availability(
    db: Session = Depends(get_db),
    start: date | None = None,
    days: int | None = None,
) -> list[DayAvailability]:
    start = start or date.today()
    days = days or availability.window_days(db)
    cap = availability.capacity(db)
    taken = availability.taken_map(db, start, days)
    holidays = availability.holidays_map(db)

    out = []
    for i in range(days):
        d = start + timedelta(days=i)
        hours = availability.slot_hours(db, d)
        out.append(DayAvailability(
            date=d.isoformat(),
            closed=not hours,
            holiday=holidays.get(d.isoformat()[5:]),
            slots=[SlotOut(hour=h, taken=taken.get((d, h), 0), capacity=cap,
                           past=availability.is_past(d, h)) for h in hours],
        ))
    return out


@router.post("/bookings", response_model=BookingOut, status_code=201)
def create_booking(payload: BookingCreate, db: Session = Depends(get_db)) -> BookingOut:
    tickets = {t.ticket_key: t for t in db.query(TicketType)
               .filter(TicketType.is_active.is_(True)).all()}
    unknown = set(payload.q) - set(tickets)
    if unknown:
        raise bad_request("unknown_ticket", f"Unknown ticket type: {', '.join(sorted(unknown))}")

    # The museum is closed, or that hour is outside opening time.
    hours = availability.slot_hours(db, payload.date)
    if not hours:
        raise bad_request("closed", "The museum is closed on that day.")
    if payload.hour not in hours:
        raise bad_request("closed", "The museum is not open at that time.")
    if availability.is_past(payload.date, payload.hour):
        raise bad_request("past_slot", "That time slot has already started.")

    visitors = sum(q for k, q in payload.q.items() if not tickets[k].is_addon)
    if visitors < 1:
        raise bad_request("no_visitors", "Please choose at least one ticket.")

    tour_qty = sum(q for k, q in payload.q.items() if tickets[k].is_addon)
    if tour_qty:
        if payload.hour not in availability.tour_times(db):
            raise bad_request("tour_time",
                              "Guided tours run only at "
                              + " and ".join(f"{h:02d}:00" for h in availability.tour_times(db)) + ".")
        if tour_qty > visitors:
            raise bad_request("tour_qty", "One guided tour place per visitor.")

    # Re-check capacity under a row lock, not just a plain read: two requests
    # that both see "5 left" would otherwise both insert and oversell.
    left = availability.remaining_for_update(db, payload.date, payload.hour)
    if visitors > left:
        raise conflict("slot_full",
                       "That time slot does not have enough places left.",
                       remaining=max(0, left))

    # The total is recomputed from the price list; a client-supplied total is
    # never trusted.
    total = sum(tickets[k].price_thebe * q for k, q in payload.q.items())

    booking = booking_codes.insert_with_unique_code(db, lambda code: Booking(
        code=code, visit_date=payload.date, visit_hour=payload.hour,
        visitors=visitors, total_thebe=total,
        visitor_name=payload.name, email=payload.email,
        phone=payload.phone, country=payload.country, source="online",
    ))
    for k, q in payload.q.items():
        if q:
            db.add(BookingLine(booking_id=booking.id, ticket_key=k, qty=q,
                               unit_price_thebe=tickets[k].price_thebe))
    db.commit()
    db.refresh(booking)
    return booking_out(booking)


@router.get("/bookings/{code}", response_model=BookingOut)
def get_booking(code: str, db: Session = Depends(get_db)) -> BookingOut:
    b = db.query(Booking).filter(Booking.code == code.upper()).one_or_none()
    if b is None:
        raise not_found("No booking with that code.")
    return booking_out(b)
