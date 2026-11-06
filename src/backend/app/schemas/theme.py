"""The look of the site, as the staff area edits it."""
from pydantic import Field, field_validator

from ..services.theme import FONT_KEYS, HEX
from .common import CamelModel


class FontOption(CamelModel):
    key: str
    name: str
    stack: str = ""
    note: str = ""


class ThemeOut(CamelModel):
    """What every page load needs; part of GET /api/config."""

    site_name: str
    site_tagline: str
    brand: str
    action: str
    accent: str
    heading_font: str
    body_font: str
    # Resolved server-side so the browser does not need the font catalogue.
    heading_stack: str
    body_stack: str
    logo_url: str
    hero_url: str
    custom_font_name: str
    custom_font_url: str
    footer_department: str
    footer_address: str
    footer_contact: str
    footer_note: str
    footer_note_2: str


class ThemeAdminOut(CamelModel):
    """Everything the appearance page needs to render itself."""

    theme: ThemeOut
    defaults: ThemeOut
    fonts: list[FontOption]
    # WCAG contrast against white per colour, so the page can warn before a
    # colour is saved that nobody can read.
    contrast: dict[str, float]


class ThemeUpdate(CamelModel):
    site_name: str | None = Field(default=None, max_length=120)
    site_tagline: str | None = Field(default=None, max_length=160)
    brand: str | None = None
    action: str | None = None
    accent: str | None = None
    heading_font: str | None = None
    body_font: str | None = None
    footer_department: str | None = Field(default=None, max_length=160)
    footer_address: str | None = Field(default=None, max_length=200)
    footer_contact: str | None = Field(default=None, max_length=200)
    footer_note: str | None = Field(default=None, max_length=200)
    footer_note_2: str | None = Field(default=None, max_length=200)

    @field_validator("brand", "action", "accent")
    @classmethod
    def hex_colour(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not HEX.match(v):
            raise ValueError(
                "Please give the colour as six hex digits, for example #009BE4.")
        return v.lower()

    @field_validator("heading_font", "body_font")
    @classmethod
    def known_font(cls, v: str | None) -> str | None:
        if v is None:
            return v
        if v not in FONT_KEYS:
            raise ValueError("Unknown font: " + ", ".join(sorted(FONT_KEYS)) + ".")
        return v

    @field_validator("site_name", "site_tagline", "footer_department",
                     "footer_contact", "footer_note", "footer_note_2")
    @classmethod
    def trimmed(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if not v:
            raise ValueError("Please enter some text, or reset it to the default.")
        return v

    @field_validator("footer_address")
    @classmethod
    def address_lines(cls, v: str | None) -> str | None:
        """The address keeps its line breaks; only trailing blanks go."""
        if v is None:
            return v
        v = "\n".join(line.strip() for line in v.splitlines() if line.strip())
        if not v:
            raise ValueError("Please enter an address, or reset it to the default.")
        return v
