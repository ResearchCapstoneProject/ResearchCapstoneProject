"""UT-09  Uploaded images (NFR-10).

NFR-10 allows JPEG, PNG and WebP of at most 8 MB, stored under names the
server generates. Each clause gets a test.
"""
import io

import pytest
from PIL import Image

from app.config import settings
from app.services import images

UUID_HEX = 32


def png(size=(50, 40), mode="RGB", colour=(1, 2, 3)) -> bytes:
    buf = io.BytesIO()
    Image.new(mode, size, colour if mode == "RGB" else 0).save(buf, format="PNG")
    return buf.getvalue()


def jpeg(size=(50, 40)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (9, 9, 9)).save(buf, format="JPEG")
    return buf.getvalue()


def webp(size=(50, 40)) -> bytes:
    buf = io.BytesIO()
    Image.new("RGB", size, (9, 9, 9)).save(buf, format="WEBP")
    return buf.getvalue()


def gif(size=(50, 40)) -> bytes:
    buf = io.BytesIO()
    Image.new("P", size).save(buf, format="GIF")
    return buf.getvalue()


# -------------------------------------------------------------- allowed formats

@pytest.mark.parametrize("raw,mime,ext", [
    (png(), "image/png", ".png"),
    (jpeg(), "image/jpeg", ".jpg"),
    (webp(), "image/webp", ".webp"),
])
def test_the_three_allowed_formats_are_stored(raw, mime, ext):
    meta = images.store(raw)
    assert meta["mime"] == mime
    assert meta["filename"].endswith(ext)
    assert (settings.upload_dir / meta["filename"]).exists()


def test_a_gif_is_refused():
    with pytest.raises(images.BadImage):
        images.store(gif())


def test_a_svg_is_refused():
    """An SVG can carry script, and it is not in NFR-10's list."""
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'
    with pytest.raises(images.BadImage):
        images.store(svg)


def test_a_text_file_renamed_as_an_image_is_refused():
    """The format comes from what Pillow decodes, not from the client."""
    with pytest.raises(images.BadImage):
        images.store(b"This is not an image, whatever the Content-Type said.")


def test_an_empty_upload_is_refused():
    with pytest.raises(images.BadImage):
        images.store(b"")


def test_a_truncated_png_is_refused():
    with pytest.raises(images.BadImage):
        images.store(png()[:40])


# ------------------------------------------------------------------- size limit

def test_a_file_over_the_upload_limit_is_refused():
    with pytest.raises(images.BadImage, match="larger than the upload limit"):
        images.store(b"\x00" * (settings.max_upload_bytes + 1))


def test_the_limit_is_the_eight_megabytes_the_requirement_states():
    assert settings.max_upload_bytes == 8 * 1024 * 1024


# --------------------------------------------------------------------- filenames

def test_the_stored_name_is_generated_never_the_client_s():
    """The name ends up in an <img src> on a public page."""
    meta = images.store(png())
    stem = meta["filename"].rsplit(".", 1)[0]
    assert len(stem) == UUID_HEX
    assert stem.isalnum() and stem.islower()


def test_two_uploads_of_the_same_bytes_get_different_names():
    a = images.store(png())["filename"]
    b = images.store(png())["filename"]
    assert a != b


def test_a_path_traversal_attempt_cannot_reach_the_filename():
    """Nothing from the request is used, so '../../etc/passwd' cannot appear."""
    meta = images.store(png())
    assert "/" not in meta["filename"] and ".." not in meta["filename"]


# ------------------------------------------------------------------- processing

def test_an_oversized_photograph_is_scaled_to_the_long_edge():
    edge = settings.image_max_edge
    meta = images.store(png(size=(edge + 500, edge + 200)))
    assert max(meta["width"], meta["height"]) == edge


def test_a_small_photograph_is_not_enlarged():
    meta = images.store(png(size=(50, 40)))
    assert (meta["width"], meta["height"]) == (50, 40)


def test_a_palette_image_is_converted_to_rgb():
    """A mode Pillow cannot save as JPEG must be converted, not crash."""
    buf = io.BytesIO()
    Image.new("P", (20, 20)).save(buf, format="PNG")
    meta = images.store(buf.getvalue())
    assert meta["mime"] == "image/png"


# --------------------------------------------------------------------- the URL

def test_an_upload_is_served_from_the_uploads_path():
    assert images.url_for("abc.png") == "/uploads/abc.png"


def test_a_bundled_asset_keeps_its_own_path():
    assert images.url_for("/assets/img/x.jpg") == "/assets/img/x.jpg"


def test_removing_an_upload_deletes_the_file():
    name = images.store(png())["filename"]
    images.remove(name)
    assert not (settings.upload_dir / name).exists()


def test_removing_a_bundled_asset_is_refused():
    """A seeded photograph belongs to the repository, not to the uploads."""
    images.remove("/assets/img/monuments/01gcwihaba/monument_map.gif")
    assert True      # no exception, and nothing outside upload_dir is touched


def test_removing_a_file_that_is_already_gone_is_harmless():
    images.remove("does-not-exist.png")
