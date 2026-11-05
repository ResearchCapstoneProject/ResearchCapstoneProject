"""The look of the site, as the staff area sets it.

The museum asked to be able to change the website like a kit -- colours,
fonts, the logo, the picture on the home page -- without a developer. All of
it lives in the existing `setting` table under a `theme.` prefix, so this
needed no schema change and no migration: a missing row means "the default",
and the defaults are the design the site shipped with.

Three decisions worth knowing:

  - A font is either one of the two faces the site already carries or a
    .woff2 the museum uploads. Nothing is pulled from a font CDN: the
    galleries have no reliable connection, and a visitor's browser should not
    have to reach a third party to read an exhibition label.
  - Only three colours are editable. Every tint, border and hover shade is
    derived from them in the browser (core/theme.js), so staff cannot end up
    with text sitting on a background of almost the same colour.
  - Uploaded images go through services/images.py, exactly like object
    photographs: the filename is generated, and the format comes from what
    Pillow decodes rather than from what the client claims.
"""
import re
import uuid

from sqlalchemy.orm import Session

from ..config import settings as app_settings
from ..models import Setting
from . import images
# The same upsert helpers the visit settings use; one implementation of
# "read a setting, write a setting" for the whole app.
from .availability import put_setting, setting

PREFIX = "theme."

DEFAULTS: dict[str, str] = {
    "site_name": "Botswana National Museum",
    "site_tagline": "National Museum and Monuments · Gaborone",
    "brand": "#009BE4",          # the logo blue
    "action": "#0072AB",         # links and buttons: darker, AA on white
    "accent": "#E28E2C",         # the logo orange
    "heading_font": "archivo",
    "body_font": "archivo",
    "logo_url": "",              # empty: the emblem drawn in art/objects.js
    "hero_url": "",              # empty: the bundled museum photograph
    "custom_font_name": "",
    "custom_font_url": "",
    # The footer. The address keeps its line breaks; everything else is one
    # line. The department line is separate from the tagline in the masthead
    # because the museum uses different wording in the two places.
    "footer_department": "Department of National Museum and Monuments",
    "footer_address": "331 Independence Avenue\nPrivate Bag 00114, Gaborone, Botswana",
    "footer_contact": "Tel +267 397 4616 / +267 361 0400 · Fax +267 390 2797",
    "footer_note": "© 2026 Botswana National Museum · texts and images belong to the museum",
    "footer_note_2": "Prices, bookings and inventory numbers are sample content",
}

# `stack` is what lands in CSS. The two bundled faces are declared in
# css/base/fonts.css; "custom" is resolved against the uploaded family name.
FONTS: list[dict[str, str]] = [
    {"key": "archivo", "name": "Archivo",
     "stack": '"Archivo", "Helvetica Neue", Arial, sans-serif',
     "note": "The museum's current face. Bundled with the site."},
    {"key": "source-serif", "name": "Source Serif 4",
     "stack": '"Source Serif 4", Georgia, "Times New Roman", serif',
     "note": "Bundled serif. Easier on long texts than on headings."},
    {"key": "system-sans", "name": "Device sans-serif",
     "stack": "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
     "note": "Whatever the visitor's phone uses. Downloads nothing at all."},
    {"key": "system-serif", "name": "Device serif",
     "stack": "Georgia, 'Times New Roman', serif",
     "note": "Also downloads nothing."},
    {"key": "custom", "name": "Uploaded font",
     "stack": "", "note": "The .woff2 file uploaded below."},
]
FONT_KEYS = {f["key"] for f in FONTS}

COLOUR_FIELDS = ("brand", "action", "accent")
TEXT_FIELDS = ("site_name", "site_tagline", "footer_department",
               "footer_address", "footer_contact", "footer_note",
               "footer_note_2")
FONT_FIELDS = ("heading_font", "body_font")
IMAGE_SLOTS = {"logo": "logo_url", "hero": "hero_url"}

HEX = re.compile(r"^#[0-9a-fA-F]{6}$")
WOFF2_MAGIC = b"wOF2"


class BadAsset(ValueError):
    """An upload the museum cannot use: wrong format, or too large."""


# ------------------------------------------------------------------- reading

def get(db: Session) -> dict[str, str]:
    """Every field, with defaults filled in for whatever is not stored."""
    return {k: setting(db, PREFIX + k, v) for k, v in DEFAULTS.items()}


def stack_for(key: str, custom_name: str) -> str:
    """The CSS font stack for a catalogue key.

    An unknown key, or "custom" with nothing uploaded, falls back to the
    default face rather than to the browser's -- a half-finished kit should
    not leave the site looking broken.
    """
    if key == "custom":
        family = custom_name.strip()
        if not family:
            key = DEFAULTS["heading_font"]
        else:
            return f'"{family}", "Archivo", "Helvetica Neue", Arial, sans-serif'
    for font in FONTS:
        if font["key"] == key and font["stack"]:
            return font["stack"]
    return '"Archivo", "Helvetica Neue", Arial, sans-serif'


def resolved(db: Session) -> dict[str, str]:
    """What the browser needs: the stored fields plus the two font stacks."""
    t = get(db)
    return {
        **t,
        "heading_stack": stack_for(t["heading_font"], t["custom_font_name"]),
        "body_stack": stack_for(t["body_font"], t["custom_font_name"]),
    }


def _channel(c: float) -> float:
    return c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4


def contrast_on_white(colour: str) -> float:
    """WCAG contrast ratio against white, for the hint in the staff area.

    The museum's own tokens file documents the ratios of the two shipped
    colours, so the kit says out loud when a new one would fall below 4.5:1
    and stop being readable as text.
    """
    if not HEX.match(colour or ""):
        return 0.0
    r, g, b = (int(colour[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lum = 0.2126 * _channel(r) + 0.7152 * _channel(g) + 0.0722 * _channel(b)
    return round((1.05) / (lum + 0.05), 2)


# ------------------------------------------------------------------- writing

def put(db: Session, changes: dict[str, object]) -> None:
    """Store changed fields. The caller commits."""
    for field, value in changes.items():
        if field not in DEFAULTS:
            raise KeyError(field)
        put_setting(db, PREFIX + field, str(value))


def drop_upload(url: str) -> None:
    """Delete a file this module uploaded. Never touches bundled assets."""
    if url and url.startswith("/uploads/"):
        images.remove(url.rsplit("/", 1)[-1])


def set_image(db: Session, slot: str, raw: bytes) -> tuple[str, str]:
    """Store a new logo or hero image; returns (new url, previous url).

    The previous file is not deleted here: the caller commits first and drops
    it afterwards, so a failed transaction cannot leave the site pointing at
    a file that no longer exists.
    """
    field = IMAGE_SLOTS[slot]
    previous = get(db)[field]
    meta = images.store(raw)                      # raises images.BadImage
    url = images.url_for(meta["filename"])
    put(db, {field: url})
    return url, previous


def set_font(db: Session, raw: bytes, family: str) -> tuple[str, str]:
    """Store an uploaded .woff2; returns (new url, previous url)."""
    if len(raw) > app_settings.max_upload_bytes:
        raise BadAsset("The font file is larger than the upload limit.")
    if raw[:4] != WOFF2_MAGIC:
        raise BadAsset(
            "That file is not a .woff2 web font. Convert the font first -- "
            "a .ttf or .otf would download several times as much data over a "
            "gallery connection.")

    family = " ".join(family.split())[:60] or "Museum font"
    name = f"{uuid.uuid4().hex}.woff2"
    app_settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (app_settings.upload_dir / name).write_bytes(raw)

    previous = get(db)["custom_font_url"]
    put(db, {"custom_font_url": f"/uploads/{name}", "custom_font_name": family})
    return f"/uploads/{name}", previous


def reset(db: Session, fields: list[str] | None = None) -> list[str]:
    """Drop stored fields so the defaults apply again.

    Returns the upload URLs that are now unreferenced, for the caller to
    delete after it commits.
    """
    fields = list(fields or DEFAULTS)
    current = get(db)
    orphaned = [current[f] for f in fields
                if f in ("logo_url", "hero_url", "custom_font_url")
                and current[f].startswith("/uploads/")]

    keys = [PREFIX + f for f in fields]
    # "fetch" so the rows go out of this session too; get() below has to see
    # the defaults, not the objects it loaded a moment ago.
    (db.query(Setting)
       .filter(Setting.setting_key.in_(keys))
       .delete(synchronize_session="fetch"))

    # A font that is gone cannot stay selected.
    if "custom_font_url" in fields:
        after = get(db)
        back = {f: DEFAULTS[f] for f in FONT_FIELDS if after[f] == "custom"}
        if back:
            put(db, back)
    return orphaned
