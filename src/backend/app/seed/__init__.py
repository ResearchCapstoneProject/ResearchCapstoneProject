"""Seeding.

The content tiers read src/frontend/assets/seed/*.json -- the same files the
frontend's offline fallback fetches. One source of truth, no codegen, no
drift between what the API serves and what the standalone demo shows.

Derived fields (status, onDisplay, added, seed) are NOT in the JSON. They are
applied here and, identically, in js/data/seed.js on the client.
"""
import json
import random
from datetime import date, datetime, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import SEED_DIR, settings
from ..models import (
    Booking, BookingLine, Department, Exhibition, Location, MuseumEvent,
    MuseumObject, ScanEvent, StaffUser, TicketType, Tour, TourStop,
)
from ..security import hash_password
from ..services import availability, inventory


def _load(name: str) -> list[dict]:
    return json.loads((SEED_DIR / f"{name}.json").read_text(encoding="utf-8"))


def _fnv1a(s: str) -> int:
    """Same hash the prototype used, so the generated demo history matches
    the numbers the team has already shown the museum."""
    h = 2166136261
    for ch in s:
        h ^= ord(ch)
        h = (h * 16777619) & 0xFFFFFFFF
    return h


def seed_content(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(MuseumObject)):
        return

    locations = {l.label: l for l in db.query(Location).all()}
    depts = {d.name: d.code for d in db.query(Department).all()}

    for i, row in enumerate(_load("objects")):
        loc = locations.get(row["location"])
        code = depts.get(row["dept"], "OBJ")
        db.add(MuseumObject(
            id=row["id"],
            dept_code=code,
            seq=int(row["id"].rsplit("-", 1)[-1]),
            art_key=row["art"],
            title=row["title"],
            origin=row.get("origin", ""),
            object_date=row.get("date", ""),
            material=row.get("material", ""),
            dims=row.get("dims", ""),
            location_id=loc.id if loc else None,
            body=row.get("text", ""),
            # The derived fields the prototype applied in its .map() at load.
            status="published",
            is_seed=True,
            added_at=datetime(2026, 8, 1) + timedelta(days=i),
        ))
    db.flush()

    for i, row in enumerate(_load("exhibitions")):
        db.add(Exhibition(exhibition_key=row["key"], art_key=row["art"],
                          kind=row["kind"], dates_label=row["dates"],
                          title=row["title"], body=row["text"], sort_order=i))

    for row in _load("events"):
        db.add(MuseumEvent(event_date=date.fromisoformat(row["d"]),
                           time_label=row["time"], kind=row["kind"],
                           title=row["title"], place=row["place"]))

    for i, row in enumerate(_load("tours")):
        db.add(Tour(id=row["id"], title=row["title"], minutes=row["mins"],
                    start_label=row["start"], audience=row["who"],
                    subtitle=row.get("sub", ""), intro=row.get("intro", ""),
                    sort_order=i))
        db.flush()
        for pos, object_id in enumerate(row["stops"]):
            db.add(TourStop(tour_id=row["id"], position=pos, object_id=object_id))

    db.flush()
    # Must run after the objects exist, or the first object a curator creates
    # collides with a seeded inventory number.
    inventory.sync_counters(db)
    db.commit()


def seed_demo_activity(db: Session) -> None:
    """Demo bookings and scan history, as real rows carrying a demo marker.

    The prototype generated these numbers from a hash at render time. Moving
    them into the database keeps the charts looking the same for a
    presentation while making the aggregation code honest -- and `source`
    means nobody later mistakes them for measurement.
    """
    today = date.today()

    if not db.scalar(select(func.count()).select_from(Booking)):
        tickets = {t.ticket_key: t for t in db.query(TicketType).all()}
        res, intl = tickets.get("res"), tickets.get("intl")
        cap = availability.capacity(db)
        n = 0
        for offset in range(availability.window_days(db)):
            d = today + timedelta(days=offset)
            for hour in availability.slot_hours(db, d):
                x = _fnv1a(f"{d.isoformat()}@{hour}")
                weekend = d.weekday() >= 5
                visitors = (x % 24) + (10 if weekend else 2) + (6 if hour in (11, 14) else 0)
                if x % 17 == 0:
                    visitors = cap          # a few deliberately sold-out slots
                visitors = min(cap, visitors)
                if visitors <= 0:
                    continue
                n += 1
                b = Booking(
                    code=f"BNM-D{n:04d}"[:9], visit_date=d, visit_hour=hour,
                    visitors=visitors, total_thebe=0,
                    visitor_name="Demo visitors", email="demo@example.invalid",
                    country="Botswana", source="demo",
                )
                db.add(b)
                db.flush()
                if res:
                    db.add(BookingLine(booking_id=b.id, ticket_key=res.ticket_key,
                                       qty=visitors, unit_price_thebe=res.price_thebe))
        db.commit()

    if not db.scalar(select(func.count()).select_from(ScanEvent)):
        object_ids = [o.id for o in db.query(MuseumObject)
                      .filter(MuseumObject.status == "published").all()]
        rows = []
        for offset in range(14):
            d = today - timedelta(days=13 - offset)
            x = _fnv1a(f"day-{d.isoformat()}")
            total = 24 + (x % 46) + (26 if d.weekday() >= 5 else 0)
            for i in range(total):
                oid = object_ids[_fnv1a(f"{d}-{i}") % len(object_ids)]
                rows.append(ScanEvent(
                    object_id=oid, source="seed",
                    scanned_at=datetime.combine(d, datetime.min.time())
                    + timedelta(hours=9 + (i % 9), minutes=(i * 7) % 60),
                ))
        db.add_all(rows)
        db.commit()


def seed_admin(db: Session) -> None:
    if db.scalar(select(func.count()).select_from(StaffUser)):
        return
    if not settings.admin_bootstrap_password:
        print("[seed] ADMIN_BOOTSTRAP_PASSWORD is empty -- no staff user created. "
              "Set it in .env and restart to create the first account.")
        return
    db.add(StaffUser(
        username=settings.admin_bootstrap_user,
        display_name="Museum administrator",
        password_hash=hash_password(settings.admin_bootstrap_password),
        role="admin",
    ))
    db.commit()
    print(f"[seed] created admin user '{settings.admin_bootstrap_user}'")


def run(db: Session) -> None:
    seed_content(db)
    seed_demo_activity(db)
    seed_admin(db)
