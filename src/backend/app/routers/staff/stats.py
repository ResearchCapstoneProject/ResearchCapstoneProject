"""Scan statistics, aggregated from scan_event rows.

The prototype generated these numbers from a hash of the object id at render
time. They are real rows now; the seeded demo history carries source='seed'
and the staff simulate button carries source='staff_demo', so a chart can
separate "what visitors did" from "what we generated for the demo".
"""
from datetime import date, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ...db import get_db
from ...models import Location, MuseumObject, Room, ScanEvent
from ...schemas.analytics import DayCount, NamedCount, ScanStats

router = APIRouter(tags=["staff:analytics"])


@router.get("/stats/scans", response_model=ScanStats)
def scan_stats(days: int = 14, db: Session = Depends(get_db)) -> ScanStats:
    start = date.today() - timedelta(days=days - 1)
    since = datetime.combine(start, datetime.min.time())

    per_day = {
        r[0]: (int(r[1]), int(r[2] or 0))
        for r in db.execute(
            select(func.date(ScanEvent.scanned_at),
                   func.count(),
                   func.sum(func.if_(ScanEvent.source == "staff_demo", 1, 0)))
            .where(ScanEvent.scanned_at >= since)
            .group_by(func.date(ScanEvent.scanned_at))
        ).all()
    }
    day_rows = []
    for i in range(days):
        d = start + timedelta(days=i)
        total, demo = per_day.get(d, (0, 0))
        day_rows.append(DayCount(date=d.isoformat(), total=total, demo=demo))

    by_object = {
        r[0]: (int(r[1]), int(r[2] or 0))
        for r in db.execute(
            select(ScanEvent.object_id, func.count(),
                   func.sum(func.if_(ScanEvent.source == "staff_demo", 1, 0)))
            .where(ScanEvent.scanned_at >= since)
            .group_by(ScanEvent.object_id)
        ).all()
    }

    objects = db.scalars(
        select(MuseumObject).where(MuseumObject.status == "published")
    ).unique().all()

    top = sorted(
        (NamedCount(key=o.id, label=o.title, total=by_object.get(o.id, (0, 0))[0],
                    demo=by_object.get(o.id, (0, 0))[1]) for o in objects),
        key=lambda n: n.total, reverse=True,
    )

    rooms: dict[str, NamedCount] = {}
    for o in objects:
        room = o.location.room if o.location else None
        if room is None:
            continue
        entry = rooms.setdefault(room.id, NamedCount(key=room.id, label=room.name,
                                                     total=0, demo=0))
        entry.total += by_object.get(o.id, (0, 0))[0]
        entry.demo += by_object.get(o.id, (0, 0))[1]

    total = sum(d.total for d in day_rows)
    return ScanStats(
        days=day_rows,
        by_room=sorted(rooms.values(), key=lambda n: n.total, reverse=True),
        top_objects=top[:8],
        total=total,
        labelled_objects=len(objects),
        average_per_day=round(total / days, 1) if days else 0.0,
        most_scanned=top[0].label if top and top[0].total else None,
    )
