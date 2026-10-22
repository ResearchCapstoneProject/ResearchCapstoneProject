from pydantic import Field, field_validator

from .common import CamelModel


class ImageOut(CamelModel):
    id: int
    url: str
    position: int


class ObjectOut(CamelModel):
    """Mirrors the shape the prototype's views already expect."""

    id: str
    art: str
    dept: str
    title: str
    origin: str = ""
    date: str = ""
    material: str = ""
    dims: str = ""
    location: str = ""
    text: str = ""
    status: str
    on_display: bool
    added: int          # ms since epoch, matching Date.UTC() in the prototype
    seed: bool
    images: list[ImageOut] = []


class FacetCount(CamelModel):
    key: str
    count: int


class ObjectList(CamelModel):
    items: list[ObjectOut]
    total: int
    facets: list[FacetCount] = []


class ObjectWrite(CamelModel):
    title: str
    dept: str | None = None
    origin: str = ""
    date: str = ""
    material: str = ""
    dims: str = ""
    location: str = ""
    text: str = ""
    status: str = "draft"
    art: str = "generic"

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Title is required.")
        return v

    @field_validator("status")
    @classmethod
    def known_status(cls, v: str) -> str:
        if v not in ("published", "draft"):
            raise ValueError("status must be 'published' or 'draft'")
        return v


class NextInventoryNo(CamelModel):
    dept: str
    # Provisional: shown in the form, but the authoritative number is allocated
    # by the counter at save time.
    preview: str
