"""Every model is imported here so Base.metadata is complete."""
from .analytics import ScanEvent
from .auth import AuditLog, StaffSession, StaffUser
from .collection import DEPT_NAMES, InventoryCounter, MuseumObject, ObjectImage
from .programme import Exhibition, MuseumEvent, Tour, TourStop
from .reference import (
    Department,
    Holiday,
    ImageOverride,
    Location,
    OpeningHours,
    Publication,
    Room,
    Setting,
    TicketType,
)
from .visits import Booking, BookingLine

__all__ = [
    "AuditLog", "Booking", "BookingLine", "DEPT_NAMES", "Department", "Exhibition",
    "Holiday", "ImageOverride", "InventoryCounter", "Location", "MuseumEvent",
    "MuseumObject", "ObjectImage", "OpeningHours", "Publication", "Room",
    "ScanEvent", "Setting", "StaffSession", "StaffUser", "TicketType", "Tour",
    "TourStop",
]
