"""UT-06 to UT-08  The appearance kit (FR-30, NFR-05).

contrast_on_white() is what stops the museum from choosing a colour that
cannot be read as text, so the WCAG arithmetic is pinned against values
computed by hand from the formula in WCAG 2.2.
"""
import pytest

from app.services import theme
from app.services.availability import setting

# Hex -> contrast ratio against white. The same table is asserted by the
# frontend suite (tests/frontend/theme.test.mjs) against the independent
# JavaScript implementation in js/core/theme.js, which is how the two are
# shown to agree.
RATIOS = {
    "#ffffff": 1.0,
    "#000000": 21.0,
    "#767676": 4.54,      # the classic AA-on-white boundary grey
    "#595959": 7.0,
    "#009be4": 3.08,      # the logo blue: large text and borders only
    "#0072ab": 5.26,      # links and buttons: AA for body text
    "#e28e2c": 2.58,      # the logo orange: never used raw as text
}


@pytest.mark.parametrize("hex_colour,expected", RATIOS.items())
def test_the_contrast_ratio_matches_the_wcag_formula(hex_colour, expected):
    assert theme.contrast_on_white(hex_colour) == pytest.approx(expected, abs=0.01)


def test_white_on_white_is_one_and_black_on_white_is_twentyone():
    assert theme.contrast_on_white("#FFFFFF") == 1.0
    assert theme.contrast_on_white("#000000") == 21.0


def test_the_shipped_action_colour_passes_aa_for_body_text():
    """The claim in css/base/tokens.css, checked rather than trusted."""
    assert theme.contrast_on_white(theme.DEFAULTS["action"]) >= 4.5


def test_the_shipped_accent_colour_does_not_pass_aa_on_its_own():
    """Which is exactly why --ochre-ink is derived instead of used raw."""
    assert theme.contrast_on_white(theme.DEFAULTS["accent"]) < 4.5


def test_the_ratio_does_not_depend_on_the_case_of_the_hex():
    assert theme.contrast_on_white("#0072AB") == theme.contrast_on_white("#0072ab")


@pytest.mark.parametrize("bad", ["", None, "blue", "#fff", "#12345", "0072AB",
                                 "#0072ABCD", "#GGGGGG"])
def test_an_unusable_colour_gives_zero_rather_than_raising(bad):
    assert theme.contrast_on_white(bad) == 0.0


# ------------------------------------------------------------------ font stacks

def test_each_catalogue_font_resolves_to_a_stack():
    for font in theme.FONTS:
        if font["key"] != "custom":
            assert theme.stack_for(font["key"], "") == font["stack"]


def test_an_unknown_font_key_falls_back_to_the_default_face():
    assert "Archivo" in theme.stack_for("comic-sans", "")


def test_custom_without_an_uploaded_family_falls_back():
    """A half-finished kit must not leave the site on the browser default."""
    assert "Archivo" in theme.stack_for("custom", "   ")


def test_custom_with_an_uploaded_family_is_put_first():
    stack = theme.stack_for("custom", "Museum Sans")
    assert stack.startswith('"Museum Sans"')
    assert "Archivo" in stack      # still a fallback behind it


# ----------------------------------------------------------------- uploaded font

def test_only_a_real_woff2_is_accepted(db):
    with pytest.raises(theme.BadAsset, match="not a .woff2"):
        theme.set_font(db, b"\x00\x01\x02\x03 this is a TrueType file", "X")


def test_a_woff2_over_the_limit_is_refused(db):
    from app.config import settings as app_settings
    raw = b"wOF2" + b"\x00" * app_settings.max_upload_bytes
    with pytest.raises(theme.BadAsset, match="larger than the upload limit"):
        theme.set_font(db, raw, "X")


def test_an_accepted_woff2_is_stored_under_a_generated_name(db):
    url, previous = theme.set_font(db, b"wOF2" + b"\x00" * 100, "Museum Sans")
    db.commit()
    assert url.startswith("/uploads/") and url.endswith(".woff2")
    assert previous == ""
    assert theme.get(db)["custom_font_name"] == "Museum Sans"


def test_the_family_name_is_trimmed_and_capped(db):
    theme.set_font(db, b"wOF2" + b"\x00" * 10, "   A   very    long " + "x" * 90)
    db.commit()
    assert len(theme.get(db)["custom_font_name"]) <= 60


# --------------------------------------------------------------- read and write

def test_an_unset_field_reads_as_its_default(db):
    assert theme.get(db)["brand"] == theme.DEFAULTS["brand"]


def test_a_stored_field_overrides_the_default(db):
    theme.put(db, {"brand": "#123456"})
    db.commit()
    assert theme.get(db)["brand"] == "#123456"
    assert setting(db, "theme.brand", "") == "#123456"


def test_an_unknown_field_is_refused(db):
    with pytest.raises(KeyError):
        theme.put(db, {"background_music": "on"})


def test_reset_brings_the_defaults_back(db):
    theme.put(db, {"brand": "#123456", "site_name": "Something else"})
    db.commit()
    theme.reset(db, ["brand"])
    db.commit()
    assert theme.get(db)["brand"] == theme.DEFAULTS["brand"]
    assert theme.get(db)["site_name"] == "Something else"


def test_resetting_the_font_also_deselects_it(db):
    """A face that is gone cannot stay chosen for the headings."""
    theme.set_font(db, b"wOF2" + b"\x00" * 10, "Museum Sans")
    theme.put(db, {"heading_font": "custom"})
    db.commit()
    orphaned = theme.reset(db, ["custom_font_url", "custom_font_name"])
    db.commit()
    assert theme.get(db)["heading_font"] == theme.DEFAULTS["heading_font"]
    assert len(orphaned) == 1


def test_resolved_adds_the_two_font_stacks(db):
    out = theme.resolved(db)
    assert "heading_stack" in out and "body_stack" in out
