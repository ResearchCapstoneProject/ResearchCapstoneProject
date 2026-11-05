"""Uploaded documents -- the sibling of services/images.py.

Same two rules as for photographs: the stored filename is generated rather
than taken from the client, because it ends up in a link on a public page,
and the format is decided by what the bytes actually are, not by the
Content-Type the browser sent. A PDF is identified by its %PDF- header; a
renamed .exe therefore does not get through.
"""
import uuid

from ..config import settings

PDF_MAGIC = b"%PDF-"


class BadFile(ValueError):
    """An upload the museum cannot use: wrong format, or too large."""


def store_pdf(raw: bytes) -> str:
    """Write a PDF to the upload directory and return its public URL."""
    if len(raw) > settings.max_pdf_bytes:
        mb = settings.max_pdf_bytes // (1024 * 1024)
        raise BadFile(f"The file is larger than the {mb} MB upload limit.")
    if raw[:5] != PDF_MAGIC:
        raise BadFile("That file is not a PDF.")

    name = f"{uuid.uuid4().hex}.pdf"
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (settings.upload_dir / name).write_bytes(raw)
    return f"/uploads/{name}"


def remove(url: str) -> None:
    """Delete a file this module stored. Bundled assets are never touched."""
    if not url or not url.startswith("/uploads/"):
        return
    try:
        (settings.upload_dir / url.rsplit("/", 1)[-1]).unlink(missing_ok=True)
    except OSError:
        pass        # the row is the source of truth; a stray file is harmless
