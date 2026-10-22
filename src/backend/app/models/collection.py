"""The collection: objects, their images and the inventory-number counters."""
from datetime import datetime

from sqlalchemy import CHAR, Enum, ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base
from .reference import Location


class InventoryCounter(Base):
    """Per-department sequence for inventory numbers.

    Deliberately not MAX(seq)+1: that recycles a deleted object's number and
    races under concurrent inserts. See services/inventory.py.
    """

    __tablename__ = "inventory_counter"
    dept_code: Mapped[str] = mapped_column(
        CHAR(3), ForeignKey("department.code", ondelete="CASCADE"), primary_key=True
    )
    next_seq: Mapped[int] = mapped_column(default=1)


class ObjectImage(Base):
    __tablename__ = "object_image"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    object_id: Mapped[str] = mapped_column(
        String(20), ForeignKey("museum_object.id", ondelete="CASCADE")
    )
    position: Mapped[int] = mapped_column(SmallInteger, default=0)
    filename: Mapped[str] = mapped_column(String(255))
    mime: Mapped[str] = mapped_column(String(64))
    width: Mapped[int] = mapped_column(SmallInteger)
    height: Mapped[int] = mapped_column(SmallInteger)
    bytes: Mapped[int] = mapped_column()
    alt: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())


class MuseumObject(Base):
    __tablename__ = "museum_object"
    id: Mapped[str] = mapped_column(String(20), primary_key=True)  # 'BNM-ETH-0142'
    dept_code: Mapped[str] = mapped_column(CHAR(3), ForeignKey("department.code"))
    seq: Mapped[int] = mapped_column()
    art_key: Mapped[str] = mapped_column(String(32), default="generic")
    title: Mapped[str] = mapped_column(String(255))
    origin: Mapped[str] = mapped_column(String(255), default="")
    object_date: Mapped[str] = mapped_column(String(64), default="")
    material: Mapped[str] = mapped_column(String(255), default="")
    dims: Mapped[str] = mapped_column(String(128), default="")
    location_id: Mapped[int | None] = mapped_column(
        SmallInteger, ForeignKey("location.id", ondelete="SET NULL"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text)
    status: Mapped[str] = mapped_column(
        Enum("published", "draft", name="object_status"), default="draft"
    )
    is_seed: Mapped[bool] = mapped_column(default=False)
    added_at: Mapped[datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now())
    created_by: Mapped[int | None] = mapped_column(
        ForeignKey("staff_user.id", ondelete="SET NULL"), nullable=True
    )

    location: Mapped[Location | None] = relationship(lazy="joined")
    images: Mapped[list[ObjectImage]] = relationship(
        lazy="selectin", order_by=ObjectImage.position, cascade="all, delete-orphan"
    )

    @property
    def department(self) -> str:
        return DEPT_NAMES.get(self.dept_code, self.dept_code)

    @property
    def on_display(self) -> bool:
        """Derived, never stored."""
        return self.location is not None and not self.location.is_store


# Filled once at startup so ObjectOut can render the department name without
# a join per row.
DEPT_NAMES: dict[str, str] = {}
