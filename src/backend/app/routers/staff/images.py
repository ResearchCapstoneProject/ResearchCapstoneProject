"""Replacing a picture the site ships with.

The museum's answer to "can we change that photo?" used to be a code change.
A row in `image_override` maps the bundled path to an upload, every page load
gets the map with GET /api/config, and core/assets.js rewrites the pictures
after a render -- so a replacement reaches every page that shows that file,
including ones nobody thought about, and "back to the original" is a deleted
row rather than a second upload.
"""
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import bad_request, not_found
from ...models import ImageOverride, StaffUser
from ...schemas.content import ImageOverrideOut
from ...services import audit, images

router = APIRouter(tags=["staff:images"])

# The path is /image-overrides, not /images/overrides: object photographs
# already own /images/{image_id}, and "overrides" would be matched by it as
# an id that cannot be parsed.

PREFIXES = ("/assets/img/", "/assets/publications/")


def _out(row: ImageOverride) -> ImageOverrideOut:
    return ImageOverrideOut(
        path=row.asset_path, url=images.url_for(row.filename),
        updated=int(row.updated_at.timestamp() * 1000),
    )


def _check_path(path: str) -> str:
    """Only a path the site actually ships -- this is a lookup key, not a URL.

    Without this the table would accept anything, including an absolute
    address somewhere else, and the map we hand to every browser would be a
    place to park a link.
    """
    path = (path or "").strip()
    if ".." in path or len(path) > 191 or not path.startswith(PREFIXES):
        raise bad_request(
            "path",
            "That is not a picture of this website. Pick one from the list.")
    return path


@router.get("/image-overrides", response_model=list[ImageOverrideOut])
def list_overrides(db: Session = Depends(get_db)) -> list[ImageOverrideOut]:
    return [_out(r) for r in db.query(ImageOverride)
            .order_by(ImageOverride.asset_path).all()]


@router.post("/image-overrides", response_model=ImageOverrideOut)
async def set_override(path: str = Form(...), file: UploadFile = File(...),
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("curator"))
                       ) -> ImageOverrideOut:
    """Upload a replacement for one bundled picture."""
    key = _check_path(path)
    try:
        meta = images.store(await file.read())
    except images.BadImage as exc:
        raise bad_request("image", str(exc)) from exc

    row = db.get(ImageOverride, key)
    previous = row.filename if row else ""
    if row is None:
        row = ImageOverride(asset_path=key, filename=meta["filename"])
        db.add(row)
    else:
        row.filename = meta["filename"]

    audit.record(db, user_id=user.id, action="update", entity="image_override",
                 entity_id=key, detail={"filename": meta["filename"]})
    db.commit()
    db.refresh(row)
    if previous:
        images.remove(previous)
    return _out(row)


@router.delete("/image-overrides", status_code=204)
def clear_override(path: str, db: Session = Depends(get_db),
                   user: StaffUser = Depends(require_role("curator"))) -> None:
    """Back to the picture the site ships with."""
    row = db.get(ImageOverride, (path or "").strip())
    if row is None:
        raise not_found("That picture has not been replaced.")

    filename = row.filename
    db.delete(row)
    audit.record(db, user_id=user.id, action="reset", entity="image_override",
                 entity_id=row.asset_path)
    db.commit()
    images.remove(filename)
