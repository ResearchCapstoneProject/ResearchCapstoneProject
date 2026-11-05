"""Reference tables: departments, rooms, locations, hours, tickets, settings."""
from datetime import datetime

from sqlalchemy import CHAR, Enum, ForeignKey, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Department(Base):
    __tablename__ = "department"
    code: Mapped[str] = mapped_column(CHAR(3), primary_key=True)
    name: Mapped[str] = mapped_column(String(64), unique=True)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)


class Room(Base):
    __tablename__ = "room"
    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    sub: Mapped[str | None] = mapped_column(String(128), nullable=True)
    kind: Mapped[str] = mapped_column(
        Enum("gallery", "service", "outdoor", name="room_kind"), default="gallery"
    )
    x: Mapped[int] = mapped_column(SmallInteger)
    y: Mapped[int] = mapped_column(SmallInteger)
    w: Mapped[int] = mapped_column(SmallInteger)
    h: Mapped[int] = mapped_column(SmallInteger)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)


class Location(Base):
    __tablename__ = "location"
    id: Mapped[int] = mapped_column(SmallInteger, primary_key=True, autoincrement=True)
    label: Mapped[str] = mapped_column(String(128), unique=True)
    room_id: Mapped[str | None] = mapped_column(
        String(16), ForeignKey("room.id", ondelete="SET NULL"), nullable=True
    )
    # Replaces the prototype's label.startsWith('Store') test.
    is_store: Mapped[bool] = mapped_column(default=False)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)

    room: Mapped[Room | None] = relationship(lazy="joined")


class OpeningHours(Base):
    __tablename__ = "opening_hours"
    weekday: Mapped[int] = mapped_column(primary_key=True)  # 0=Sunday .. 6=Saturday
    open_hour: Mapped[int | None] = mapped_column(nullable=True)
    close_hour: Mapped[int | None] = mapped_column(nullable=True)


class Holiday(Base):
    __tablename__ = "holiday"
    md: Mapped[str] = mapped_column(CHAR(5), primary_key=True)  # 'MM-DD'
    label: Mapped[str] = mapped_column(String(128))
    closed: Mapped[bool] = mapped_column(default=False)


class TicketType(Base):
    __tablename__ = "ticket_type"
    ticket_key: Mapped[str] = mapped_column(String(16), primary_key=True)
    name: Mapped[str] = mapped_column(String(128))
    description: Mapped[str] = mapped_column(String(255), default="")
    price_thebe: Mapped[int] = mapped_column(default=0)
    is_addon: Mapped[bool] = mapped_column(default=False)
    is_active: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)


class Setting(Base):
    __tablename__ = "setting"
    setting_key: Mapped[str] = mapped_column(String(64), primary_key=True)
    value: Mapped[str] = mapped_column(String(255))
    updated_at: Mapped[datetime] = mapped_column()
