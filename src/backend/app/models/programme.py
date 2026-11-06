"""The museum's events."""
from sqlalchemy import Date, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class MuseumEvent(Base):
    __tablename__ = "museum_event"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_date: Mapped[Date] = mapped_column(Date)
    time_label: Mapped[str] = mapped_column(String(64))
    kind: Mapped[str] = mapped_column(String(64))
    title: Mapped[str] = mapped_column(String(255))
    place: Mapped[str] = mapped_column(String(128))
    by_line: Mapped[str] = mapped_column(String(128), default="")
    body_text: Mapped[str | None] = mapped_column(Text, nullable=True, default=None)
    pdf_url: Mapped[str] = mapped_column(String(255), default="")
    is_published: Mapped[bool] = mapped_column(default=True)

