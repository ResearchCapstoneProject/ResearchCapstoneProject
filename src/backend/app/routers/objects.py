"""Public collection endpoints."""
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from ..db import get_db
from ..errors import not_found
from ..models import Location, MuseumObject
from ..schemas.objects import FacetCount, ObjectList, ObjectOut
from ..services import search
from .serialise import object_out

router = APIRouter(prefix="/api", tags=["collection"])


def _base(db: Session, q: str, room: str, on_display: bool | None):
    stmt = (
        select(MuseumObject)
        .join(Location, MuseumObject.location_id == Location.id, isouter=True)
        .where(MuseumObject.status == "published")
    )
    stmt = search.apply_query(stmt, q)
    if room and room != "All":
        stmt = (
            stmt.where(Location.is_store.is_(True))
            if room == "store"
            else stmt.where(Location.room_id == room)
        )
    if on_display:
        stmt = stmt.where(Location.is_store.is_(False),
                          MuseumObject.location_id.is_not(None))
    return stmt


@router.get("/objects", response_model=ObjectList)
def list_objects(
    db: Session = Depends(get_db),
    q: str = "",
    dept: str = "All",
    room: str = "All",
    on_display: bool = Query(False, alias="onDisplay"),
    sort: str = "inv",
) -> ObjectList:
    # Facets are counted before the department filter, exactly like the
    # prototype's filtered(true) pass, so each chip shows how many results it
    # would give rather than how many are currently shown.
    pre_dept = db.scalars(_base(db, q, room, on_display)).unique().all()
    facets = [FacetCount(key="All", count=len(pre_dept))]
    counts: dict[str, int] = {}
    for o in pre_dept:
        counts[o.department] = counts.get(o.department, 0) + 1
    facets += [FacetCount(key=k, count=v) for k, v in sorted(counts.items())]

    rows = pre_dept if dept == "All" else [o for o in pre_dept if o.department == dept]

    if sort == "title":
        rows = sorted(rows, key=lambda o: o.title.lower())
    elif sort == "new":
        rows = sorted(rows, key=lambda o: o.added_at, reverse=True)
    else:
        rows = sorted(rows, key=lambda o: o.id)

    return ObjectList(items=[object_out(o) for o in rows],
                      total=len(rows), facets=facets)


@router.get("/objects/{object_id}", response_model=ObjectOut)
def get_object(object_id: str, db: Session = Depends(get_db)) -> ObjectOut:
    o = db.get(MuseumObject, object_id)
    if o is None or o.status != "published":
        raise not_found("No object with that inventory number.")
    return object_out(o)


@router.get("/objects/{object_id}/related", response_model=list[ObjectOut])
def related(object_id: str, db: Session = Depends(get_db)) -> list[ObjectOut]:
    o = db.get(MuseumObject, object_id)
    if o is None:
        raise not_found()
    rows = db.scalars(
        select(MuseumObject)
        .where(MuseumObject.status == "published",
               MuseumObject.dept_code == o.dept_code,
               MuseumObject.id != o.id)
        .limit(4)
    ).unique().all()
    return [object_out(x) for x in rows]
