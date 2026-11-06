"""Reference tables: departments, rooms, locations, hours, tickets, settings."""
from datetime import datetime

from sqlalchemy import CHAR, Enum, ForeignKey, SmallInteger, String, Text, func
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
    # The DDL carries DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);
    # declaring the server default here keeps the ORM from inserting an explicit
    # NULL, which MySQL rejects on a NOT NULL column.
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())


class Publication(Base):
    """A publication added in the staff area, shown with the bundled ones."""

    __tablename__ = "publication"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    type_key: Mapped[str] = mapped_column(String(32))
    title: Mapped[str] = mapped_column(String(255))
    date_label: Mapped[str] = mapped_column(String(64), default="")
    thumb_url: Mapped[str] = mapped_column(String(255), default="")
    pdf_url: Mapped[str] = mapped_column(String(255), default="")
    href: Mapped[str] = mapped_column(String(255), default="")
    is_published: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class TextOverride(Base):
    """A text the museum rewrote: path into the content modules -> new text."""

    __tablename__ = "text_override"
    text_key: Mapped[str] = mapped_column(String(191), primary_key=True)
    value: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())


class ImageOverride(Base):
    """A picture the museum replaced: bundled path -> uploaded file."""

    __tablename__ = "image_override"
    asset_path: Mapped[str] = mapped_column(String(191), primary_key=True)
    filename: Mapped[str] = mapped_column(String(190))
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())
