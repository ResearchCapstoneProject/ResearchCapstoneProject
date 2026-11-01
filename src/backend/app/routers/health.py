"""The probe target for the frontend's online/offline decision.

Kept deliberately cheap: the client calls this exactly once per page load
with a short timeout, and branches every later request on the result.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..db import get_db

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
def health(db: Session = Depends(get_db)) -> dict:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "version": 1}
