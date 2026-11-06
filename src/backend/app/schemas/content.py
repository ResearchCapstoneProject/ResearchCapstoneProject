"""Events, publications and replaced pictures, as the staff area edits them."""
import re
from datetime import date

from pydantic import Field, field_validator

from .common import CamelModel


# --------------------------------------------------------------------- events

class EventAdminOut(CamelModel):
    """An event as the staff table shows it, including unpublished ones."""

    id: int
    d: str                 # 'YYYY-MM-DD', the key the frontend sorts on
    time: str
    kind: str
    title: str
    place: str
    by: str = ""
    text: str = ""
    pdf: str = ""
    published: bool = True


class EventWrite(CamelModel):
    d: date
    time: str = Field(default="", max_length=64)
    kind: str = Field(default="Event", max_length=64)
    title: str = Field(max_length=255)
    place: str = Field(default="", max_length=128)
    by: str = Field(default="", max_length=128)
    text: str = ""
    published: bool = True

    @field_validator("title")
    @classmethod
    def title_given(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Please enter a title for the event.")
        return v

    @field_validator("time", "kind", "place", "by")
    @classmethod
    def tidy(cls, v: str) -> str:
        return " ".join(v.split())


class EventPatch(EventWrite):
    """Same fields, all optional -- a PATCH may carry only `published`."""

    d: date | None = None
    title: str | None = Field(default=None, max_length=255)
    time: str | None = None
    kind: str | None = None
    place: str | None = None
    by: str | None = None
    text: str | None = None
    published: bool | None = None

    @field_validator("title")
    @classmethod
    def title_given(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Please enter a title for the event.")
        return v

    @field_validator("time", "kind", "place", "by")
    @classmethod
    def tidy(cls, v: str | None) -> str | None:
        return None if v is None else " ".join(v.split())


# --------------------------------------------------------------- publications

class PublicationOut(CamelModel):
    id: int
    type_key: str
    title: str
    date: str = ""
    thumb: str = ""
    pdf: str = ""
    href: str = ""
    published: bool = True
    sort_order: int = 0


class PublicationWrite(CamelModel):
    type_key: str = Field(max_length=32)
    title: str = Field(max_length=255)
    date: str = Field(default="", max_length=64)
    href: str = Field(default="", max_length=255)
    published: bool = True
    sort_order: int = Field(default=0, ge=0, le=999)

    @field_validator("title")
    @classmethod
    def title_given(cls, v: str) -> str:
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Please enter a title for the publication.")
        return v

    @field_validator("href")
    @classmethod
    def internal_link(cls, v: str) -> str:
        """Only a link inside the site, so the field cannot carry an advert.

        The publications page renders this as an <a href>, and the staff area
        is the one place a non-developer writes something that lands in
        markup -- so it is restricted to the site's own hash routes.
        """
        v = v.strip()
        if v and not v.startswith("#/"):
            raise ValueError("A link has to point inside the site, e.g. #/visit.")
        return v


class PublicationPatch(PublicationWrite):
    type_key: str | None = Field(default=None, max_length=32)
    title: str | None = Field(default=None, max_length=255)
    date: str | None = None
    href: str | None = None
    published: bool | None = None
    sort_order: int | None = Field(default=None, ge=0, le=999)

    @field_validator("title")
    @classmethod
    def title_given(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = " ".join(v.split())
        if len(v) < 2:
            raise ValueError("Please enter a title for the publication.")
        return v

    @field_validator("href")
    @classmethod
    def internal_link(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if v and not v.startswith("#/"):
            raise ValueError("A link has to point inside the site, e.g. #/visit.")
        return v


# ------------------------------------------------------------ picture swaps

class TextOverrideOut(CamelModel):
    key: str
    value: str
    updated: int       # epoch milliseconds


class TextOverrideWrite(CamelModel):
    key: str = Field(max_length=191)
    value: str = Field(max_length=20_000)

    @field_validator("key")
    @classmethod
    def key_shape(cls, v: str) -> str:
        """A path into the site's own content, e.g. 'pagecopy.events.lede'.

        The key is handed to every browser in GET /api/config and is used by
        core/text.js to walk into the content modules, so it is restricted to
        the shape those paths have -- not a free-text field.
        """
        v = v.strip()
        if not re.fullmatch(r"[a-z][a-z0-9-]*(\.[A-Za-z0-9_-]+){1,8}", v):
            raise ValueError("That is not a text of this website.")
        # core/text.js refuses these segments as well, and only ever replaces
        # a string that is already there -- but a key that walks into an
        # object's prototype has no business being stored in the first place.
        if {"__proto__", "constructor", "prototype"} & set(v.split(".")):
            raise ValueError("That is not a text of this website.")
        return v

    @field_validator("value")
    @classmethod
    def not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Please enter some text, or reset it to the original.")
        return v


class ImageOverrideOut(CamelModel):
    path: str          # the bundled path the site ships with
    url: str           # the uploaded replacement
    updated: int       # epoch milliseconds
