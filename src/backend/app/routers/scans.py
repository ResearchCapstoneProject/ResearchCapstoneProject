"""QR scan logging.

The prototype counted a staff button click as a visitor scan. Here the source
is recorded, so the visitor chart can exclude staff_demo and seed rows.
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from ..db import get_db
from ..errors import not_found
from ..models import MuseumObject, ScanEvent
from ..schemas.analytics import ScanCreate
from ..services.privacy import daily_hash

router = APIRouter(prefix="/api", tags=["analytics"])

ALLOWED_SOURCES = {"qr", "staff_demo"}


@router.post("/scans", status_code=201)
def record_scan(payload: ScanCreate, request: Request,
                db: Session = Depends(get_db)) -> dict:
    if db.get(MuseumObject, payload.object_id) is None:
        raise not_found("No object with that inventory number.")
    source = payload.source if payload.source in ALLOWED_SOURCES else "qr"
    db.add(ScanEvent(
        object_id=payload.object_id,
        source=source,
        ip_hash=daily_hash(request.client.host if request.client else None),
        ua_hash=daily_hash(request.headers.get("user-agent")),
    ))
    db.commit()
    return {"ok": True, "source": source}
