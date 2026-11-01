"""Bookings and their per-ticket-type lines."""
from datetime import date, datetime

from sqlalchemy import CHAR, Date, Enum, ForeignKey, SmallInteger, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..db import Base


class BookingLine(Base):
    __tablename__ = "booking_line"
    booking_id: Mapped[int] = mapped_column(
        ForeignKey("booking.id", ondelete="CASCADE"), primary_key=True
    )
    ticket_key: Mapped[str] = mapped_column(
        String(16), ForeignKey("ticket_type.ticket_key"), primary_key=True
    )
    qty: Mapped[int] = mapped_column(SmallInteger)
    # Captured at purchase time, so a later price change does not rewrite history.
    unit_price_thebe: Mapped[int] = mapped_column()


class Booking(Base):
    __tablename__ = "booking"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(CHAR(9), unique=True)  # 'BNM-K7M2P'
    visit_date: Mapped[date] = mapped_column(Date)
    visit_hour: Mapped[int] = mapped_column()
    visitors: Mapped[int] = mapped_column(SmallInteger)
    total_thebe: Mapped[int] = mapped_column()
    visitor_name: Mapped[str] = mapped_column(String(128))
    email: Mapped[str] = mapped_column(String(190))
    phone: Mapped[str] = mapped_column(String(32), default="")
    country: Mapped[str] = mapped_column(String(64), default="")
    source: Mapped[str] = mapped_column(
        Enum("online", "desk", "demo", name="booking_source"), default="online"
    )
    status: Mapped[str] = mapped_column(
        Enum("confirmed", "cancelled", name="booking_status"), default="confirmed"
    )
    created_at: Mapped[datetime] = mapped_column(server_default=func.now())
    checked_in_at: Mapped[datetime | None] = mapped_column(nullable=True)

    lines: Mapped[list[BookingLine]] = relationship(
        lazy="selectin", cascade="all, delete-orphan"
    )

    @property
    def checked_in(self) -> bool:
        return self.checked_in_at is not None
