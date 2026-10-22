"""Uploaded object photographs.

Two rules here matter beyond "resize the picture":

  - the stored filename is generated, never taken from the client, because it
    ends up inside an <img src> on a public page;
  - the extension comes from what Pillow actually decodes, not from the
    client's Content-Type, which is trivially spoofed.
"""
import hashlib
import uuid
from pathlib import Path

from PIL import Image, UnidentifiedImageError

from ..config import settings

ALLOWED = {"JPEG": ("image/jpeg", ".jpg"), "PNG": ("image/png", ".png"),
           "WEBP": ("image/webp", ".webp")}


class BadImage(ValueError):
    pass


def store(raw: bytes) -> dict:
    if len(raw) > settings.max_upload_bytes:
        raise BadImage("The file is larger than the upload limit.")

    import io as _io

    try:
        img = Image.open(_io.BytesIO(raw))
        img.load()
    except (UnidentifiedImageError, OSError) as exc:
        raise BadImage("That file is not a readable image.") from exc

    if img.format not in ALLOWED:
        raise BadImage(f"Unsupported image format: {img.format}.")
    mime, ext = ALLOWED[img.format]

    if img.mode not in ("RGB", "L"):
        img = img.convert("RGB")

    edge = settings.image_max_edge
    if max(img.size) > edge:
        img.thumbnail((edge, edge), Image.LANCZOS)

    name = f"{uuid.uuid4().hex}{ext}"
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    path: Path = settings.upload_dir / name
    save_kwargs = {"quality": 85, "optimize": True} if img.format == "JPEG" else {}
    img.save(path, format=img.format, **save_kwargs)

    return {
        "filename": name,
        "mime": mime,
        "width": img.width,
        "height": img.height,
        "bytes": path.stat().st_size,
    }


def url_for(filename: str) -> str:
    return f"/uploads/{filename}"


def remove(filename: str) -> None:
    try:
        (settings.upload_dir / filename).unlink(missing_ok=True)
    except OSError:
        pass  # the database row is the source of truth; a stray file is harmless
