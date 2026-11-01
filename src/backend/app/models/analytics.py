"""QR scan events."""
from datetime import datetime

from sqlalchemy import CHAR, Enum, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from ..db import Base


class ScanEvent(Base):
    __tablename__ = "scan_event"
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    object_id: Mapped[str] = mapped_column(
        String(20), ForeignKey("museum_object.id", ondelete="CASCADE")
    )
    scanned_at: Mapped[datetime] = mapped_column(server_default=func.now())
    # 'qr' is a real visitor at a gallery label; 'staff_demo' is the staff
    # "Simulate visitor scan" button, which the prototype wrongly counted as a
    # visitor; 'seed' is generated history so the charts are not empty.
    source: Mapped[str] = mapped_column(
        Enum("qr", "staff_demo", "seed", name="scan_source"), default="qr"
    )
    ip_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
    ua_hash: Mapped[str | None] = mapped_column(CHAR(64), nullable=True)
