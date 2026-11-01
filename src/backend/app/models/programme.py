"""Exhibitions, events and themed tours."""
from sqlalchemy import Date, ForeignKey, SmallInteger, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class Exhibition(Base):
    __tablename__ = "exhibition"
    exhibition_key: Mapped[str] = mapped_column(String(32), primary_key=True)
    art_key: Mapped[str] = mapped_column(String(32))
    kind: Mapped[str] = mapped_column(String(64))
    dates_label: Mapped[str] = mapped_column(String(128))
    title: Mapped[str] = mapped_column(String(255))
    body: Mapped[str] = mapped_column(Text)
    is_published: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)


class MuseumEvent(Base):
    __tablename__ = "museum_event"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_date: Mapped[Date] = mapped_column(Date)
    time_label: Mapped[str] = mapped_column(String(64))
    kind: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(255))
    place: Mapped[str] = mapped_column(String(128))
    is_published: Mapped[bool] = mapped_column(default=True)


class TourStop(Base):
    __tablename__ = "tour_stop"
    tour_id: Mapped[str] = mapped_column(
        String(32), ForeignKey("tour.id", ondelete="CASCADE"), primary_key=True
    )
    position: Mapped[int] = mapped_column(SmallInteger, primary_key=True)
    object_id: Mapped[str] = mapped_column(
        String(20), ForeignKey("museum_object.id", ondelete="CASCADE")
    )


class Tour(Base):
    __tablename__ = "tour"
    id: Mapped[str] = mapped_column(String(32), primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    minutes: Mapped[int] = mapped_column(SmallInteger)
    start_label: Mapped[str] = mapped_column(String(128))
    audience: Mapped[str] = mapped_column(String(128))
    subtitle: Mapped[str] = mapped_column(String(255), default="")
    intro: Mapped[str] = mapped_column(Text)
    is_published: Mapped[bool] = mapped_column(default=True)
    sort_order: Mapped[int] = mapped_column(SmallInteger, default=0)

    stops: Mapped[list[TourStop]] = relationship(
        lazy="selectin", order_by=TourStop.position, cascade="all, delete-orphan"
    )
