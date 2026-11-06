"""Seeding.

The content tiers read src/frontend/assets/seed/*.json -- the same files the
frontend's offline fallback fetches. One source of truth, no codegen, no
drift between what the API serves and what the standalone demo shows.

Derived fields (status, onDisplay, added, seed) are NOT in the JSON. They are
applied here and, identically, in decorateSeedObjects() in js/data/local.js.
"""
import json
from datetime import date, datetime, timedelta

from PIL import Image
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..config import FRONTEND_DIR, SEED_DIR, settings
from ..models import (
    Department, Location, MuseumEvent, MuseumObject, ObjectImage, StaffUser,
)
from ..security import hash_password
from ..services import availability, inventory


def _load(name: str) -> list[dict]:
    return json.loads((SEED_DIR / f"{name}.json").read_text(encoding="utf-8"))


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
            catalogue=row.get("catalogue", ""),
            # The derived fields the prototype applied in its .map() at load.
            status="published",
            is_seed=True,
            added_at=datetime(2026, 8, 1) + timedelta(days=i),
        ))
        # Photos that ship with the frontend (ACB catalogue). The row keeps
        # the asset path; services/images.url_for passes it through.
        for pos, url in enumerate(row.get("images", [])):
            with Image.open(FRONTEND_DIR / url.lstrip("/")) as im:
                w, h = im.size
            db.add(ObjectImage(object_id=row["id"], position=pos, filename=url,
                               mime="image/webp", width=w, height=h,
                               bytes=(FRONTEND_DIR / url.lstrip("/")).stat().st_size,
                               alt=row["title"]))
    db.flush()

    events = _load("events")
    availability.put_setting(db, "seeded_events", str(len(events)))
    for row in events:
        db.add(MuseumEvent(by_line=row.get("by", ""),
                           body_text=row.get("text") or None,
                           pdf_url=row.get("pdf", ""),
                           event_date=date.fromisoformat(row["d"]),
                           time_label=row["time"], kind=row["kind"],
                           title=row["title"], place=row["place"]))

    db.flush()
    # Must run after the objects exist, or the first object a curator creates
    # collides with a seeded inventory number.
    inventory.sync_counters(db)
    db.commit()


def seed_new_events(db: Session) -> None:
    """Add events the seed file has gained since this database was created.

    seed_content() runs only on an empty database, so an event added to
    assets/seed/events.json later would never reach a server that is already
    running -- and since the events page now reads the programme from the
    database rather than from the frontend's own copy, "never" would mean the
    museum's own past events quietly disappearing from the live site.

    The marker is a count rather than a comparison of titles, because the
    seed file is only ever appended to: an event the museum has deleted in
    the staff area stays deleted, which a title match would undo on the next
    restart.
    """
    rows = _load("events")
    done = int(availability.setting(db, "seeded_events", "-1") or -1)

    if done < 0:
        # A database from before this marker existed. Work out once what it
        # already has, by date and title, so the events it was seeded with
        # are not added a second time. From here on the count governs.
        have = {(e.event_date.isoformat(), e.title)
                for e in db.query(MuseumEvent).all()}
        missing = [r for r in rows if (r["d"], r["title"]) not in have]
    else:
        missing = rows[done:]

    if not missing:
        availability.put_setting(db, "seeded_events", str(len(rows)))
        db.commit()
        return

    for row in missing:
        db.add(MuseumEvent(by_line=row.get("by", ""),
                           body_text=row.get("text") or None,
                           pdf_url=row.get("pdf", ""),
                           event_date=date.fromisoformat(row["d"]),
                           time_label=row["time"], kind=row["kind"],
                           title=row["title"], place=row["place"]))
    availability.put_setting(db, "seeded_events", str(len(rows)))
    db.commit()
    print(f"[seed] added {len(missing)} event(s) from the seed file")


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
    seed_new_events(db)
    seed_admin(db)
