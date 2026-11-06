from datetime import date

from pydantic import Field, field_validator

from .common import CamelModel


class BookingCreate(CamelModel):
    date: date
    hour: int = Field(ge=0, le=23)
    # Slot start minute; 0 unless the museum runs slots shorter than an hour.
    minute: int = Field(default=0, ge=0, le=59)
    # ticket_key -> quantity, e.g. {"res": 2, "child": 1, "intl": 0, "tour": 0}
    q: dict[str, int]
    # Set when the visitor came from an event's "Book" button.
    event_id: int | None = None
    name: str
    email: str
    phone: str = ""
    country: str = ""
    agree: bool = False

    @field_validator("name")
    @classmethod
    def name_long_enough(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Please enter your name.")
        return v

    @field_validator("email")
    @classmethod
    def email_looks_valid(cls, v: str) -> str:
        v = v.strip()
        # Same shape the prototype checked client-side; the server must not
        # trust that check ever ran. No whitespace and no control character
        # anywhere, rather than no space: a tab produces a second, empty
        # recipient and the whole message is refused, and a newline is what
        # header injection would need. Pydantic's EmailStr would be stricter
        # still, but it needs the email-validator package, which this
        # deployment does not have.
        if ("@" not in v or "." not in v.split("@")[-1]
                or any(c.isspace() or not c.isprintable() for c in v)):
            raise ValueError("Please enter a valid e-mail address.")
        return v

    @field_validator("q")
    @classmethod
    def quantities_sane(cls, v: dict[str, int]) -> dict[str, int]:
        if any(n < 0 for n in v.values()):
            raise ValueError("Quantities cannot be negative.")
        return v

    @field_validator("agree")
    @classmethod
    def must_agree(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Please accept to continue.")
        return v


class TicketOut(CamelModel):
    """What anyone holding the code may see.

    GET /api/bookings/{code} is public -- it is the link in the confirmation
    mail -- so it answers with the ticket and not with the visitor's record:
    no e-mail address, no phone number, no country. The name stays, because
    it is on the ticket the visitor is holding.
    """

    code: str
    date: str
    hour: int
    minute: int = 0
    q: dict[str, int] = {}
    visitors: int
    total_thebe: int
    name: str
    event_title: str = ""
    checked_in: bool = False


class BookingOut(CamelModel):
    # Filled in below the other fields; see booking_out() in routers/bookings.py.
    event_id: int | None = None
    event_title: str = ""
    code: str
    date: str
    hour: int
    minute: int = 0
    q: dict[str, int]
    visitors: int
    total_thebe: int
    name: str
    email: str
    phone: str = ""
    country: str = ""
    created: int
    checked_in: bool
    source: str


class SlotOut(CamelModel):
    hour: int
    minute: int = 0
    minutes: int = 60          # length of this slot
    taken: int
    capacity: int
    past: bool


class DayAvailability(CamelModel):
    date: str
    closed: bool
    holiday: str | None = None
    slots: list[SlotOut]
