from .common import CamelModel


class DepartmentOut(CamelModel):
    key: str     # 'Archaeology' -- what the object records carry
    code: str    # 'ARC'


class RoomOut(CamelModel):
    id: str
    name: str
    sub: str | None = None
    kind: str
    x: int
    y: int
    w: int
    h: int


class LocationOut(CamelModel):
    label: str
    room_id: str | None = None
    is_store: bool


class TicketTypeOut(CamelModel):
    key: str
    name: str
    desc: str
    price_thebe: int
    addon: bool = False


class ConfigOut(CamelModel):
    """One call replacing nine hard-coded frontend constants."""

    departments: list[DepartmentOut]
    locations: list[LocationOut]
    rooms: list[RoomOut]
    hours: dict[str, list[int] | None]   # weekday '0'..'6' -> [open, close] | null
    holidays: dict[str, str]             # 'MM-DD' -> label
    tickets: list[TicketTypeOut]
    capacity: int
    tour_times: list[int]
    public_base_url: str
    booking_window_days: int
    currency: str
