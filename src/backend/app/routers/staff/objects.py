"""Object CRUD for the staff area."""
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from ...db import get_db
from ...errors import bad_request, not_found
from ...models import Department, Location, MuseumObject, ObjectImage, StaffUser
from ...schemas.objects import ImageOut, NextInventoryNo, ObjectOut, ObjectWrite
from ...deps import require_role
from ...services import audit, images, inventory
from ..serialise import object_out

router = APIRouter(tags=["staff:collection"])


@router.get("/objects", response_model=list[ObjectOut])
def list_all(db: Session = Depends(get_db)) -> list[ObjectOut]:
    """Unlike the public endpoint, this includes drafts."""
    rows = db.scalars(
        select(MuseumObject).order_by(MuseumObject.added_at.desc())
    ).unique().all()
    return [object_out(o) for o in rows]


@router.get("/objects/next-inventory-no", response_model=NextInventoryNo)
def next_inventory_no(dept: str, db: Session = Depends(get_db)) -> NextInventoryNo:
    return NextInventoryNo(dept=dept, preview=inventory.preview(db, dept))


def _apply(db: Session, o: MuseumObject, payload: ObjectWrite) -> None:
    o.title = payload.title
    o.origin = payload.origin
    o.object_date = payload.date
    o.material = payload.material
    o.dims = payload.dims
    o.body = payload.text
    o.status = payload.status
    o.art_key = payload.art or "generic"
    loc = (db.query(Location).filter(Location.label == payload.location).one_or_none()
           if payload.location else None)
    o.location_id = loc.id if loc else None


@router.post("/objects", response_model=ObjectOut, status_code=201)
def create(payload: ObjectWrite, db: Session = Depends(get_db),
           user: StaffUser = Depends(require_role("curator"))) -> ObjectOut:
    dept_name = payload.dept or ""
    if not db.query(Department).filter(Department.name == dept_name).one_or_none():
        raise bad_request("unknown_dept", "Choose a department.")

    code = inventory.dept_code(db, dept_name)
    seq = inventory.allocate(db, code)          # same transaction as the INSERT
    o = MuseumObject(id=inventory.format_inventory_no(code, seq),
                     dept_code=code, seq=seq, body="", created_by=user.id)
    _apply(db, o, payload)
    db.add(o)
    audit.record(db, user_id=user.id, action="create", entity="object",
                 entity_id=o.id)
    db.commit()
    db.refresh(o)
    return object_out(o)


@router.patch("/objects/{object_id}", response_model=ObjectOut)
def update(object_id: str, payload: ObjectWrite, db: Session = Depends(get_db),
           user: StaffUser = Depends(require_role("curator"))) -> ObjectOut:
    o = db.get(MuseumObject, object_id)
    if o is None:
        raise not_found()
    # The department is fixed once allocated: changing it would orphan the
    # inventory number, which must stay stable for printed labels.
    _apply(db, o, payload)
    audit.record(db, user_id=user.id, action="update", entity="object",
                 entity_id=o.id)
    db.commit()
    db.refresh(o)
    return object_out(o)


@router.delete("/objects/{object_id}", status_code=204)
def delete(object_id: str, db: Session = Depends(get_db),
           user: StaffUser = Depends(require_role("curator"))) -> None:
    o = db.get(MuseumObject, object_id)
    if o is None:
        raise not_found()
    for img in o.images:
        images.remove(img.filename)
    db.delete(o)
    audit.record(db, user_id=user.id, action="delete", entity="object",
                 entity_id=object_id)
    db.commit()
    # The inventory counter is deliberately NOT rolled back here.


@router.post("/objects/{object_id}/images", response_model=ImageOut, status_code=201)
async def upload_image(object_id: str, file: UploadFile = File(...),
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))) -> ImageOut:
    o = db.get(MuseumObject, object_id)
    if o is None:
        raise not_found()
    try:
        meta = images.store(await file.read())
    except images.BadImage as exc:
        raise bad_request("bad_image", str(exc)) from exc

    position = max((i.position for i in o.images), default=-1) + 1
    img = ObjectImage(object_id=o.id, position=position, alt=o.title, **meta)
    db.add(img)
    audit.record(db, user_id=user.id, action="update", entity="object_image",
                 entity_id=o.id)
    db.commit()
    db.refresh(img)
    return ImageOut(id=img.id, url=images.url_for(img.filename),
                    position=img.position)


@router.delete("/images/{image_id}", status_code=204)
def delete_image(image_id: int, db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("curator"))) -> None:
    img = db.get(ObjectImage, image_id)
    if img is None:
        raise not_found()
    images.remove(img.filename)
    db.delete(img)
    audit.record(db, user_id=user.id, action="delete", entity="object_image",
                 entity_id=str(image_id))
    db.commit()
