"""Events and publications."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import MuseumEvent, Publication
from ..schemas.content import PublicationOut
from ..schemas.programme import EventOut

router = APIRouter(prefix="/api", tags=["programme"])


@router.get("/events", response_model=list[EventOut])
def events(db: Session = Depends(get_db)) -> list[EventOut]:
    rows = (db.query(MuseumEvent).filter(MuseumEvent.is_published.is_(True))
            .order_by(MuseumEvent.event_date).all())
    return [EventOut(id=e.id, d=e.event_date.isoformat(), time=e.time_label, kind=e.kind,
                     title=e.title, place=e.place, by=e.by_line,
                     text=e.body_text or "", pdf=e.pdf_url) for e in rows]


@router.get("/publications", response_model=list[PublicationOut])
def publications(db: Session = Depends(get_db)) -> list[PublicationOut]:
    """What the museum added itself; the bundled catalogue ships with the
    frontend and is merged with this in views/publications.js."""
    rows = (db.query(Publication).filter(Publication.is_published.is_(True))
            .order_by(Publication.type_key, Publication.sort_order,
                      Publication.id.desc()).all())
    return [PublicationOut(id=p.id, type_key=p.type_key, title=p.title,
                           date=p.date_label, thumb=p.thumb_url, pdf=p.pdf_url,
                           href=p.href, published=True, sort_order=p.sort_order)
            for p in rows]

