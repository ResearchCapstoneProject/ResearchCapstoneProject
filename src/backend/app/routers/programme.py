"""Exhibitions, events and tours."""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..db import get_db
from ..errors import not_found
from ..models import Exhibition, MuseumEvent, Publication, Tour
from ..schemas.content import PublicationOut
from ..schemas.programme import EventOut, ExhibitionOut, TourOut

router = APIRouter(prefix="/api", tags=["programme"])


def _tour_out(t: Tour) -> TourOut:
    return TourOut(id=t.id, title=t.title, mins=t.minutes, start=t.start_label,
                   who=t.audience, sub=t.subtitle, intro=t.intro,
                   stops=[s.object_id for s in t.stops])


@router.get("/exhibitions", response_model=list[ExhibitionOut])
def exhibitions(db: Session = Depends(get_db)) -> list[ExhibitionOut]:
    rows = (db.query(Exhibition).filter(Exhibition.is_published.is_(True))
            .order_by(Exhibition.sort_order).all())
    return [ExhibitionOut(key=e.exhibition_key, art=e.art_key, kind=e.kind,
                          dates=e.dates_label, title=e.title, text=e.body)
            for e in rows]


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


@router.get("/tours", response_model=list[TourOut])
def tours(db: Session = Depends(get_db)) -> list[TourOut]:
    rows = (db.query(Tour).filter(Tour.is_published.is_(True))
            .order_by(Tour.sort_order).all())
    return [_tour_out(t) for t in rows]


@router.get("/tours/{tour_id}", response_model=TourOut)
def tour(tour_id: str, db: Session = Depends(get_db)) -> TourOut:
    t = db.get(Tour, tour_id)
    if t is None or not t.is_published:
        raise not_found("No such tour.")
    return _tour_out(t)
