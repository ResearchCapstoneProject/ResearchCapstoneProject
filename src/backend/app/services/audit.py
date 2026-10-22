"""Append-only record of who changed what."""
from sqlalchemy.orm import Session

from ..models import AuditLog


def record(db: Session, *, user_id: int | None, action: str, entity: str,
           entity_id: str | None = None, detail: dict | None = None) -> None:
    db.add(AuditLog(user_id=user_id, action=action, entity=entity,
                    entity_id=entity_id, detail=detail))
