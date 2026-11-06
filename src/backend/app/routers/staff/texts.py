"""Rewriting any text the site carries in its content modules.

The key is the path to the text inside those modules -- 'pagecopy.events.lede',
'about.ABOUT.0', 'explore.SECTIONS.3.lede' -- so nothing has to be migrated
when the museum rewrites something, "reset" is a deleted row, and the text the
site shipped with is always still underneath. core/text.js walks the same path
in the browser and assigns the new value before the first render.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import not_found
from ...models import StaffUser, TextOverride
from ...schemas.content import TextOverrideOut, TextOverrideWrite
from ...services import audit

router = APIRouter(tags=["staff:texts"])


def _out(row: TextOverride) -> TextOverrideOut:
    return TextOverrideOut(key=row.text_key, value=row.value,
                           updated=int(row.updated_at.timestamp() * 1000))


@router.get("/texts", response_model=list[TextOverrideOut])
def list_texts(db: Session = Depends(get_db)) -> list[TextOverrideOut]:
    return [_out(r) for r in db.query(TextOverride)
            .order_by(TextOverride.text_key).all()]


@router.put("/texts", response_model=TextOverrideOut)
def set_text(payload: TextOverrideWrite, db: Session = Depends(get_db),
             user: StaffUser = Depends(require_role("curator"))
             ) -> TextOverrideOut:
    row = db.get(TextOverride, payload.key)
    if row is None:
        row = TextOverride(text_key=payload.key, value=payload.value)
        db.add(row)
    else:
        row.value = payload.value

    audit.record(db, user_id=user.id, action="update", entity="text_override",
                 entity_id=payload.key,
                 detail={"length": len(payload.value)})
    db.commit()
    db.refresh(row)
    return _out(row)


@router.delete("/texts", status_code=204)
def clear_text(key: str, db: Session = Depends(get_db),
               user: StaffUser = Depends(require_role("curator"))) -> None:
    """Back to the text the site ships with."""
    row = db.get(TextOverride, (key or "").strip())
    if row is None:
        raise not_found("That text has not been changed.")

    db.delete(row)
    audit.record(db, user_id=user.id, action="reset", entity="text_override",
                 entity_id=row.text_key)
    db.commit()
