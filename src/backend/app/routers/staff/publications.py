"""Publications the museum adds itself.

The catalogue the site ships with -- the brochures, the Zebra's Voice issues,
the Plant and Insect of the Month posters with their transcribed texts -- is
bundled content and stays as it is. A row here is an addition, shown in the
same section as the bundled items under the same `type_key`. That way the
museum can publish this year's brochure without us, and nothing it adds can
damage the material transcribed from the posters.
"""
from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import bad_request, not_found
from ...models import Publication, StaffUser
from ...schemas.content import PublicationOut, PublicationPatch, PublicationWrite
from ...services import audit, files, images

router = APIRouter(tags=["staff:publications"])


def _out(p: Publication) -> PublicationOut:
    return PublicationOut(
        id=p.id, type_key=p.type_key, title=p.title, date=p.date_label,
        thumb=p.thumb_url, pdf=p.pdf_url, href=p.href,
        published=p.is_published, sort_order=p.sort_order,
    )


def _get(db: Session, pub_id: int) -> Publication:
    p = db.get(Publication, pub_id)
    if p is None:
        raise not_found("No publication with that number.")
    return p


@router.get("/publications", response_model=list[PublicationOut])
def list_publications(db: Session = Depends(get_db)) -> list[PublicationOut]:
    rows = (db.query(Publication)
            .order_by(Publication.type_key, Publication.sort_order,
                      Publication.id.desc()).all())
    return [_out(p) for p in rows]


@router.post("/publications", response_model=PublicationOut, status_code=201)
def create_publication(payload: PublicationWrite, db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))
                       ) -> PublicationOut:
    p = Publication(
        type_key=payload.type_key, title=payload.title,
        date_label=payload.date, href=payload.href,
        is_published=payload.published, sort_order=payload.sort_order,
    )
    db.add(p)
    db.flush()
    audit.record(db, user_id=user.id, action="create", entity="publication",
                 entity_id=str(p.id), detail={"title": p.title})
    db.commit()
    db.refresh(p)
    return _out(p)


@router.patch("/publications/{pub_id}", response_model=PublicationOut)
def update_publication(pub_id: int, payload: PublicationPatch,
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))
                       ) -> PublicationOut:
    p = _get(db, pub_id)
    changed = payload.model_dump(exclude_unset=True)
    fields = {"date": "date_label", "published": "is_published"}
    for field, value in changed.items():
        setattr(p, fields.get(field, field), value)

    audit.record(db, user_id=user.id, action="update", entity="publication",
                 entity_id=str(pub_id), detail=changed)
    db.commit()
    db.refresh(p)
    return _out(p)


@router.delete("/publications/{pub_id}", status_code=204)
def delete_publication(pub_id: int, db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))) -> None:
    p = _get(db, pub_id)
    cover, pdf = p.thumb_url, p.pdf_url
    db.delete(p)
    audit.record(db, user_id=user.id, action="delete", entity="publication",
                 entity_id=str(pub_id), detail={"title": p.title})
    db.commit()
    images.remove(cover.rsplit("/", 1)[-1] if cover.startswith("/uploads/") else "")
    files.remove(pdf)


@router.post("/publications/{pub_id}/cover", response_model=PublicationOut)
async def upload_cover(pub_id: int, file: UploadFile = File(...),
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))
                       ) -> PublicationOut:
    """The cover picture shown in the list."""
    p = _get(db, pub_id)
    previous = p.thumb_url
    try:
        meta = images.store(await file.read())
    except images.BadImage as exc:
        raise bad_request("image", str(exc)) from exc
    p.thumb_url = images.url_for(meta["filename"])

    audit.record(db, user_id=user.id, action="update", entity="publication",
                 entity_id=str(pub_id), detail={"thumb": p.thumb_url})
    db.commit()
    db.refresh(p)
    if previous.startswith("/uploads/"):
        images.remove(previous.rsplit("/", 1)[-1])
    return _out(p)


@router.post("/publications/{pub_id}/pdf", response_model=PublicationOut)
async def upload_pdf(pub_id: int, file: UploadFile = File(...),
                     db: Session = Depends(get_db),
                     user: StaffUser = Depends(require_role("curator"))
                     ) -> PublicationOut:
    p = _get(db, pub_id)
    previous = p.pdf_url
    try:
        p.pdf_url = files.store_pdf(await file.read())
    except files.BadFile as exc:
        raise bad_request("pdf", str(exc)) from exc

    audit.record(db, user_id=user.id, action="update", entity="publication",
                 entity_id=str(pub_id), detail={"pdf": p.pdf_url})
    db.commit()
    db.refresh(p)
    files.remove(previous)
    return _out(p)
