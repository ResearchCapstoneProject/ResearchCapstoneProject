"""Staff accounts, sessions and the audit trail."""
from datetime import datetime

from sqlalchemy import CHAR, Enum, ForeignKey, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class StaffUser(Base):
    __tablename__ = "staff_user"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    username: Mapped[str] = mapped_column(String(64), unique=True)
    email: Mapped[str | None] = mapped_column(String(190), unique=True, nullable=True)
    display_name: Mapped[str] = mapped_column(String(128))
    password_hash: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(
        Enum("curator", "frontdesk", "admin", name="staff_role"), default="curator"
    )
    is_active: Mapped[bool] = mapped_column(default=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    last_login_at: Mapped[datetime | None] = mapped_column(nullable=True)


class StaffSession(Base):
    __tablename__ = "staff_session"
    # sha256 of the cookie token, never the token, so a database dump does not
    # hand over live sessions.
    id: Mapped[str] = mapped_column(CHAR(64), primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("staff_user.id", ondelete="CASCADE")
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    last_seen_at: Mapped[datetime] = mapped_column(server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column()
    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_log"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("staff_user.id", ondelete="SET NULL"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(32))
    entity: Mapped[str] = mapped_column(String(32))
    entity_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    at: Mapped[datetime] = mapped_column(server_default=func.now())
    detail: Mapped[dict | None] = mapped_column(JSON, nullable=True)
