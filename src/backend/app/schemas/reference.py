from .common import CamelModel
from .theme import ThemeOut


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
    slot_minutes: int = 60
    tour_times: list[int]
    public_base_url: str
    booking_window_days: int
    currency: str
    # Colours, fonts, logo and hero picture, as the staff area set them.
    theme: ThemeOut
    # Bundled picture path -> the upload that replaced it. core/assets.js
    # rewrites every <img> after a render with this.
    image_overrides: dict[str, str] = {}
    # Path into the content modules -> the text the museum put there instead.
    texts: dict[str, str] = {}
    # False on a real deployment, where "Reset demo data" would delete the
    # museum's own bookings, scans and objects. The staff area then does not
    # offer the button at all.
    demo_reset_enabled: bool = True
    # Days after a visit before a booking is deleted; 0 while the museum has
    # not set a period. The privacy notice says which of the two it is.
    booking_retention_days: int = 0
    # False once the museum has gone live: the draft banner, the footer's
    # sample-content line and the staff area's demo wording disappear.
    demo_mode: bool = True
    # Whether a confirmation can actually be sent. The ticket page promises an
    # e-mail only where there is a mail account behind it.
    email_enabled: bool = False
