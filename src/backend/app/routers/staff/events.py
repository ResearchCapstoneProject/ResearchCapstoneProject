"""The museum's programme: events the staff area adds, edits and withdraws.

The table was there from the start (`museum_event`, seeded from the museum's
own material); what was missing was any way to change it without a developer.
Curators may edit events, the front desk may not.
"""
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import bad_request, not_found
from ...models import MuseumEvent, StaffUser
from ...schemas.content import EventAdminOut, EventPatch, EventWrite
from ...services import audit, files

router = APIRouter(tags=["staff:events"])


def _out(e: MuseumEvent) -> EventAdminOut:
    return EventAdminOut(
        id=e.id, d=e.event_date.isoformat(), time=e.time_label, kind=e.kind,
        title=e.title, place=e.place, by=e.by_line, text=e.body_text or "",
        pdf=e.pdf_url, published=e.is_published,
    )


def _get(db: Session, event_id: int) -> MuseumEvent:
    e = db.get(MuseumEvent, event_id)
    if e is None:
        raise not_found("No event with that number.")
    return e


@router.get("/events", response_model=list[EventAdminOut])
def list_events(db: Session = Depends(get_db)) -> list[EventAdminOut]:
    """Newest first -- the staff table is for editing, not for visitors."""
    rows = (db.query(MuseumEvent)
            .order_by(MuseumEvent.event_date.desc(), MuseumEvent.id.desc()).all())
    return [_out(e) for e in rows]


@router.post("/events", response_model=EventAdminOut, status_code=201)
def create_event(payload: EventWrite, db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("curator"))
                 ) -> EventAdminOut:
    e = MuseumEvent(
        event_date=payload.d, time_label=payload.time, kind=payload.kind,
        title=payload.title, place=payload.place, by_line=payload.by,
        body_text=payload.text or None, is_published=payload.published,
    )
    db.add(e)
    db.flush()
    audit.record(db, user_id=user.id, action="create", entity="museum_event",
                 entity_id=str(e.id), detail={"title": e.title})
    db.commit()
    db.refresh(e)
    return _out(e)


@router.patch("/events/{event_id}", response_model=EventAdminOut)
def update_event(event_id: int, payload: EventPatch,
                 db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("curator"))
                 ) -> EventAdminOut:
    e = _get(db, event_id)
    changed = payload.model_dump(exclude_unset=True)
    # The audit log's `detail` is a JSON column, and `changed` holds a real
    # date object for the day of the event -- which json.dumps refuses, at
    # commit time, as a 500 on an otherwise valid edit. mode="json" gives the
    # same fields with the date as a string.
    logged = payload.model_dump(exclude_unset=True, mode="json")
    fields = {"d": "event_date", "time": "time_label", "by": "by_line",
              "text": "body_text", "published": "is_published"}
    for field, value in changed.items():
        setattr(e, fields.get(field, field),
                (value or None) if field == "text" else value)

    audit.record(db, user_id=user.id, action="update", entity="museum_event",
                 entity_id=str(event_id), detail=logged)
    db.commit()
    db.refresh(e)
    return _out(e)


@router.delete("/events/{event_id}", status_code=204)
def delete_event(event_id: int, db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("curator"))) -> None:
    e = _get(db, event_id)
    flyer = e.pdf_url
    db.delete(e)
    audit.record(db, user_id=user.id, action="delete", entity="museum_event",
                 entity_id=str(event_id), detail={"title": e.title})
    db.commit()
    files.remove(flyer)          # only after the row is gone


@router.post("/events/{event_id}/flyer", response_model=EventAdminOut)
async def upload_flyer(event_id: int, file: UploadFile = File(...),
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))
                       ) -> EventAdminOut:
    """The flyer visitors can download from a past event."""
    e = _get(db, event_id)
    previous = e.pdf_url
    try:
        e.pdf_url = files.store_pdf(await file.read())
    except files.BadFile as exc:
        raise bad_request("pdf", str(exc)) from exc

    audit.record(db, user_id=user.id, action="update", entity="museum_event",
                 entity_id=str(event_id), detail={"pdf": e.pdf_url})
    db.commit()
    db.refresh(e)
    files.remove(previous)
    return _out(e)


@router.delete("/events/{event_id}/flyer", response_model=EventAdminOut)
def remove_flyer(event_id: int, db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("curator"))
                 ) -> EventAdminOut:
    e = _get(db, event_id)
    previous = e.pdf_url
    e.pdf_url = ""
    audit.record(db, user_id=user.id, action="update", entity="museum_event",
                 entity_id=str(event_id), detail={"pdf": ""})
    db.commit()
    db.refresh(e)
    files.remove(previous)
    return _out(e)
