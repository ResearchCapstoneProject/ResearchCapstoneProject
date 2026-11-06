"""UT-12  Collection search (FR-14).

FR-14 requires that *every* entered word occurs somewhere in the record --
AND, not OR. The test executes the query rather than inspecting the SQL.
"""
from sqlalchemy import select

from app.models import Location, MuseumObject
from app.services.search import apply_query

OBJECTS = [
    # id, title, origin, material, date, body, location
    ("BNM-ETH-0142", "Basket", "Etsha", "Mokola palm", "1975",
     "A coiled basket woven in the Okavango Delta.", 1),
    ("BNM-ETH-0302", "Leather apron", "Tsodilo", "Hide and beads", "1960",
     "A woman's apron of tanned hide.", 1),
    ("BNM-ARC-0007", "Stone blade", "Tsodilo", "Quartz", "Middle Stone Age",
     "A struck quartz blade.", 2),
]


def load(db):
    for oid, title, origin, material, odate, body, loc in OBJECTS:
        db.add(MuseumObject(
            id=oid, dept_code=oid.split("-")[1], seq=int(oid.split("-")[2]),
            title=title, origin=origin, material=material, object_date=odate,
            body=body, location_id=loc, status="published"))
    db.commit()


def found(db, q):
    stmt = apply_query(
        select(MuseumObject).outerjoin(Location,
                                       MuseumObject.location_id == Location.id),
        q)
    return sorted(o.id for o in db.execute(stmt).scalars().all())


def test_an_empty_query_returns_everything(db):
    load(db)
    assert len(found(db, "")) == 3
    assert len(found(db, "   ")) == 3
    assert len(found(db, None)) == 3


def test_a_single_word_matches_the_title(db):
    load(db)
    assert found(db, "basket") == ["BNM-ETH-0142"]


def test_the_search_is_case_insensitive(db):
    load(db)
    assert found(db, "BASKET") == ["BNM-ETH-0142"]


def test_a_word_matches_the_origin(db):
    load(db)
    assert found(db, "Tsodilo") == ["BNM-ARC-0007", "BNM-ETH-0302"]


def test_a_word_matches_the_material(db):
    load(db)
    assert found(db, "quartz") == ["BNM-ARC-0007"]


def test_a_word_matches_the_description(db):
    load(db)
    assert found(db, "Okavango") == ["BNM-ETH-0142"]


def test_a_word_matches_the_date(db):
    load(db)
    assert found(db, "1975") == ["BNM-ETH-0142"]


def test_a_full_inventory_number_matches(db):
    """And it must not tokenise into the whole department."""
    load(db)
    assert found(db, "BNM-ETH-0142") == ["BNM-ETH-0142"]


def test_a_partial_inventory_number_matches(db):
    load(db)
    assert found(db, "ETH") == ["BNM-ETH-0142", "BNM-ETH-0302"]


def test_a_word_matches_the_gallery_label(db):
    load(db)
    assert found(db, "Store") == ["BNM-ARC-0007"]


def test_every_word_has_to_match_and_not_merely_one_of_them(db):
    """The AND requirement of FR-14."""
    load(db)
    assert found(db, "apron Tsodilo") == ["BNM-ETH-0302"]
    assert found(db, "basket Tsodilo") == []      # OR would return two rows


def test_words_may_match_in_different_fields(db):
    load(db)
    assert found(db, "quartz blade Tsodilo") == ["BNM-ARC-0007"]


def test_a_word_that_matches_nothing_gives_no_result(db):
    load(db)
    assert found(db, "aeroplane") == []


def test_extra_whitespace_between_words_is_ignored(db):
    load(db)
    assert found(db, "  apron    Tsodilo  ") == ["BNM-ETH-0302"]
