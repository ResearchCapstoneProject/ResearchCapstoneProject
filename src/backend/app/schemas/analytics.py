from .common import CamelModel


class ScanCreate(CamelModel):
    object_id: str
    source: str = "qr"


class DayCount(CamelModel):
    date: str
    total: int
    demo: int = 0


class NamedCount(CamelModel):
    key: str
    label: str
    total: int
    demo: int = 0


class ScanStats(CamelModel):
    days: list[DayCount]
    by_room: list[NamedCount]
    top_objects: list[NamedCount]
    total: int
    labelled_objects: int
    average_per_day: float
    most_scanned: str | None = None
