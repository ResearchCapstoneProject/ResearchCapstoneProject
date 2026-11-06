"""Visitor groups and visit settings, as the staff area edits them."""
from pydantic import Field, field_validator

from .common import CamelModel


class TicketTypeAdminOut(CamelModel):
    key: str
    name: str
    desc: str = ""
    price_thebe: int
    addon: bool
    active: bool
    sort_order: int
    # A group that has been booked is deactivated rather than deleted, so the
    # price a visitor actually paid stays readable on the old booking.
    in_use: bool = False


class TicketTypeCreate(CamelModel):
    name: str
    desc: str = ""
    price_thebe: int = Field(default=0, ge=0, le=100_000_00)
    addon: bool = False
    active: bool = True
    sort_order: int = Field(default=0, ge=0, le=999)

    @field_validator("name")
    @classmethod
    def name_given(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Please enter a name for the group.")
        return v


class TicketTypeUpdate(CamelModel):
    name: str | None = None
    desc: str | None = None
    price_thebe: int | None = Field(default=None, ge=0, le=100_000_00)
    addon: bool | None = None
    active: bool | None = None
    sort_order: int | None = Field(default=None, ge=0, le=999)

    @field_validator("name")
    @classmethod
    def name_given(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Please enter a name for the group.")
        return v


class MailTest(CamelModel):
    to: str

    @field_validator("to")
    @classmethod
    def looks_like_an_address(cls, v: str) -> str:
        v = v.strip()
        # The same rule as a visitor's address in schemas/bookings.py, so
        # that nothing reaches the header builder which it would refuse.
        if ("@" not in v or "." not in v.split("@")[-1]
                or any(c.isspace() or not c.isprintable() for c in v)):
            raise ValueError("Please enter a valid e-mail address.")
        return v


class VisitSettingsOut(CamelModel):
    capacity_per_slot: int
    slot_minutes: int
    booking_window_days: int
    # Days after a visit before the booking is deleted. 0 keeps them, which
    # is the default until the museum decides.
    booking_retention_days: int
    # Whether a confirmation can be sent at all; set in the server's .env,
    # not from this page.
    email_enabled: bool = False
    tour_times: list[int]
    currency: str
    # The lengths the UI may offer; anything else would leave slots that do
    # not tile the opening hours.
    slot_lengths: list[int]


class VisitSettingsUpdate(CamelModel):
    capacity_per_slot: int | None = Field(default=None, ge=1, le=10_000)
    slot_minutes: int | None = None
    booking_window_days: int | None = Field(default=None, ge=1, le=365)
    booking_retention_days: int | None = Field(default=None, ge=0, le=3650)
    tour_times: list[int] | None = None

    @field_validator("tour_times")
    @classmethod
    def hours_valid(cls, v: list[int] | None) -> list[int] | None:
        if v is None:
            return v
        if any(h < 0 or h > 23 for h in v):
            raise ValueError("Guided tour times must be hours between 0 and 23.")
        return sorted(set(v))
