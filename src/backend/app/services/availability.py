"""Opening hours, slot capacity and the booking window.

The prototype derived occupancy from a hash of the date so the demo looked
busy. Here it is a real count over confirmed bookings.
"""
from datetime import date, datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..models import Booking, Holiday, OpeningHours, Setting

GABORONE = ZoneInfo("Africa/Gaborone")


def setting(db: Session, key: str, default: str) -> str:
    row = db.get(Setting, key)
    return row.value if row else default


def put_setting(db: Session, key: str, value: str) -> None:
    """Upsert a setting. The caller commits, so several land in one transaction."""
    row = db.get(Setting, key)
    if row is None:
        db.add(Setting(setting_key=key, value=value))
    else:
        row.value = value


def capacity(db: Session) -> int:
    return int(setting(db, "capacity_per_hour", "40"))


# What the staff area may choose. Anything else would leave slots that do not
# tile the opening hours, or a slot that runs past closing time.
SLOT_LENGTHS = (15, 20, 30, 45, 60, 90, 120)


def slot_minutes(db: Session) -> int:
    """Length of one entry slot. Falls back to an hour on a bad value."""
    try:
        v = int(setting(db, "slot_minutes", "60"))
    except ValueError:
        return 60
    return v if v in SLOT_LENGTHS else 60


def tour_times(db: Session) -> list[int]:
    return [int(x) for x in setting(db, "tour_times", "10,14").split(",") if x]


def window_days(db: Session) -> int:
    return int(setting(db, "booking_window_days", "14"))


def hours_map(db: Session) -> dict[int, tuple[int, int] | None]:
    out: dict[int, tuple[int, int] | None] = {}
    for row in db.query(OpeningHours).all():
        out[row.weekday] = (
            None if row.open_hour is None else (row.open_hour, row.close_hour)
        )
    return out


def holidays_map(db: Session) -> dict[str, str]:
    return {h.md: h.label for h in db.query(Holiday).all()}


def slot_hours(db: Session, d: date) -> list[int]:
    """Opening hours as whole hours. Kept for callers that only need the span."""
    # Python's weekday() is Mon=0; the schema uses JS's Sun=0.
    js_dow = (d.weekday() + 1) % 7
    rng = hours_map(db).get(js_dow)
    return [] if not rng else list(range(rng[0], rng[1]))


def slot_starts(db: Session, d: date) -> list[tuple[int, int]]:
    """Every (hour, minute) a visit may start on this day.

    Slots tile the opening hours from opening time onwards; a trailing
    remainder shorter than one slot is dropped rather than letting a slot
    run past closing time.
    """
    js_dow = (d.weekday() + 1) % 7
    rng = hours_map(db).get(js_dow)
    if not rng:
        return []
    step = slot_minutes(db)
    first, last = rng[0] * 60, rng[1] * 60
    return [(t // 60, t % 60) for t in range(first, last - step + 1, step)]


def taken_map(db: Session, start: date,
              days: int) -> dict[tuple[date, int, int], int]:
    end = start + timedelta(days=days)
    rows = db.execute(
        select(Booking.visit_date, Booking.visit_hour, Booking.visit_minute,
               func.sum(Booking.visitors))
        .where(
            Booking.visit_date >= start,
            Booking.visit_date < end,
            Booking.status == "confirmed",
        )
        .group_by(Booking.visit_date, Booking.visit_hour, Booking.visit_minute)
    ).all()
    return {(r[0], r[1], r[2]): int(r[3] or 0) for r in rows}


def is_past(d: date, hour: int, minute: int = 0) -> bool:
    """A slot counts as past once it has started."""
    now = datetime.now(GABORONE)
    if d < now.date():
        return True
    return d == now.date() and hour * 60 + minute <= now.hour * 60 + now.minute


def remaining(db: Session, d: date, hour: int, minute: int = 0) -> int:
    """Advisory only -- for display. Use remaining_for_update() before writing."""
    return capacity(db) - taken_map(db, d, 1).get((d, hour, minute), 0)


def remaining_for_update(db: Session, d: date, hour: int,
                         minute: int = 0) -> int:
    """Places left in a slot, holding a lock until the transaction commits.

    A plain SELECT then INSERT oversells: two requests both read "5 left",
    both insert, and the slot ends up over capacity. Measured at 48 in a
    40-place slot under 20-way concurrency before this existed.

    FOR UPDATE over the (visit_date, visit_hour, visit_minute, status) index
    takes next-key
    locks on that range, so a concurrent insert into the same slot blocks
    until we commit -- including the gap when the slot is still empty.
    """
    taken = db.execute(
        select(func.coalesce(func.sum(Booking.visitors), 0))
        .where(
            Booking.visit_date == d,
            Booking.visit_hour == hour,
            Booking.visit_minute == minute,
            Booking.status == "confirmed",
        )
        .with_for_update()
    ).scalar_one()
    return capacity(db) - int(taken or 0)
