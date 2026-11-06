"""The appearance kit: colours, fonts, logo and the home-page picture.

Admin only, like the visitor groups. Everything here writes `setting` rows,
so there is nothing to migrate and "reset" means deleting a row rather than
remembering what the original value was.
"""
from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import bad_request, not_found
from ...models import StaffUser
from ...schemas.theme import FontOption, ThemeAdminOut, ThemeOut, ThemeUpdate
from ...services import audit, images, theme

router = APIRouter(tags=["staff:theme"])


def _defaults_out() -> ThemeOut:
    d = dict(theme.DEFAULTS)
    return ThemeOut(
        **d,
        heading_stack=theme.stack_for(d["heading_font"], ""),
        body_stack=theme.stack_for(d["body_font"], ""),
    )


def _admin_out(db: Session) -> ThemeAdminOut:
    current = theme.resolved(db)
    return ThemeAdminOut(
        theme=ThemeOut(**current),
        defaults=_defaults_out(),
        fonts=[FontOption(**f) for f in theme.FONTS],
        contrast={f: theme.contrast_on_white(current[f])
                  for f in theme.COLOUR_FIELDS},
    )


@router.get("/theme", response_model=ThemeAdminOut)
def get_theme(db: Session = Depends(get_db)) -> ThemeAdminOut:
    return _admin_out(db)


@router.patch("/theme", response_model=ThemeAdminOut)
def update_theme(payload: ThemeUpdate, db: Session = Depends(get_db),
                 user: StaffUser = Depends(require_role("admin"))
                 ) -> ThemeAdminOut:
    changed = payload.model_dump(exclude_unset=True)
    if not changed:
        return _admin_out(db)

    # "custom" is only a font once a file has been uploaded for it.
    wants_custom = any(changed.get(f) == "custom" for f in theme.FONT_FIELDS)
    if wants_custom and not theme.get(db)["custom_font_url"]:
        raise bad_request(
            "no_font_uploaded",
            "Upload a .woff2 font file first, then choose it here.")

    theme.put(db, changed)
    audit.record(db, user_id=user.id, action="update", entity="setting",
                 entity_id="theme", detail=changed)
    db.commit()
    return _admin_out(db)


@router.post("/theme/image/{slot}", response_model=ThemeAdminOut)
async def upload_theme_image(slot: str, file: UploadFile = File(...),
                             db: Session = Depends(get_db),
                             user: StaffUser = Depends(require_role("admin"))
                             ) -> ThemeAdminOut:
    """Replace the logo or the picture on the home page."""
    if slot not in theme.IMAGE_SLOTS:
        raise not_found("The kit has no such image: use logo or hero.")

    try:
        url, previous = theme.set_image(db, slot, await file.read())
    except images.BadImage as exc:
        raise bad_request("image", str(exc)) from exc

    audit.record(db, user_id=user.id, action="update", entity="setting",
                 entity_id=f"theme.{slot}", detail={"url": url})
    db.commit()
    theme.drop_upload(previous)      # only after the new value is committed
    return _admin_out(db)


@router.delete("/theme/image/{slot}", response_model=ThemeAdminOut)
def reset_theme_image(slot: str, db: Session = Depends(get_db),
                      user: StaffUser = Depends(require_role("admin"))
                      ) -> ThemeAdminOut:
    if slot not in theme.IMAGE_SLOTS:
        raise not_found("The kit has no such image: use logo or hero.")

    orphaned = theme.reset(db, [theme.IMAGE_SLOTS[slot]])
    audit.record(db, user_id=user.id, action="reset", entity="setting",
                 entity_id=f"theme.{slot}")
    db.commit()
    for url in orphaned:
        theme.drop_upload(url)
    return _admin_out(db)


@router.post("/theme/font", response_model=ThemeAdminOut)
async def upload_theme_font(file: UploadFile = File(...), family: str = Form(""),
                            db: Session = Depends(get_db),
                            user: StaffUser = Depends(require_role("admin"))
                            ) -> ThemeAdminOut:
    """Add a .woff2 the museum owns a licence for, and name its family."""
    try:
        url, previous = theme.set_font(db, await file.read(), family)
    except theme.BadAsset as exc:
        raise bad_request("font", str(exc)) from exc

    audit.record(db, user_id=user.id, action="update", entity="setting",
                 entity_id="theme.font", detail={"url": url, "family": family})
    db.commit()
    theme.drop_upload(previous)
    return _admin_out(db)


@router.delete("/theme/font", response_model=ThemeAdminOut)
def reset_theme_font(db: Session = Depends(get_db),
                     user: StaffUser = Depends(require_role("admin"))
                     ) -> ThemeAdminOut:
    """Remove the uploaded font; headings fall back to the bundled face."""
    orphaned = theme.reset(db, ["custom_font_url", "custom_font_name"])
    audit.record(db, user_id=user.id, action="reset", entity="setting",
                 entity_id="theme.font")
    db.commit()
    for url in orphaned:
        theme.drop_upload(url)
    return _admin_out(db)


@router.delete("/theme", response_model=ThemeAdminOut)
def reset_theme(db: Session = Depends(get_db),
                user: StaffUser = Depends(require_role("admin"))
                ) -> ThemeAdminOut:
    """Back to the design the site shipped with, uploads and all."""
    orphaned = theme.reset(db)
    audit.record(db, user_id=user.id, action="reset", entity="setting",
                 entity_id="theme")
    db.commit()
    for url in orphaned:
        theme.drop_upload(url)
    return _admin_out(db)
