"""UT-11  Inventory numbers (FR-26, NFR-16).

FR-26 requires a number that is never reused, not even after an object has
been deleted. The allocation itself needs MySQL (LAST_INSERT_ID), so it is
tested in the integration suite; these are the parts that are portable.
"""
import pytest

from app.models import InventoryCounter, MuseumObject
from app.services import inventory


@pytest.mark.parametrize("code,seq,expected", [
    ("ETH", 142, "BNM-ETH-0142"),
    ("ARC", 1, "BNM-ARC-0001"),
    ("ETH", 9999, "BNM-ETH-9999"),
    ("ETH", 10000, "BNM-ETH-10000"),      # the format does not truncate
])
def test_an_inventory_number_is_formatted_as_the_requirement_states(
        code, seq, expected):
    assert inventory.format_inventory_no(code, seq) == expected


def test_the_number_is_zero_padded_to_four_digits():
    assert inventory.format_inventory_no("ETH", 7).endswith("-0007")


def test_a_department_code_is_looked_up_by_name(db):
    assert inventory.dept_code(db, "Ethnology") == "ETH"
    assert inventory.dept_code(db, "Archaeology") == "ARC"


def test_an_unknown_department_falls_back_to_a_neutral_code(db):
    assert inventory.dept_code(db, "Department of Mystery") == "OBJ"


def test_the_preview_does_not_consume_a_number(db):
    before = db.get(InventoryCounter, "ETH").next_seq
    assert inventory.preview(db, "Ethnology") == "BNM-ETH-0001"
    assert inventory.preview(db, "Ethnology") == "BNM-ETH-0001"
    assert db.get(InventoryCounter, "ETH").next_seq == before


def test_the_counter_is_lifted_above_the_highest_seeded_object(db):
    """Seeded objects arrive with their own numbers; the counter must follow."""
    for seq in (1, 2, 17):
        db.add(MuseumObject(id=f"BNM-ETH-{seq:04d}", dept_code="ETH", seq=seq,
                            title=f"Object {seq}", body="", is_seed=True))
    db.commit()
    inventory.sync_counters(db)
    db.commit()
    assert db.get(InventoryCounter, "ETH").next_seq == 18


def test_syncing_does_not_lower_a_counter_that_is_already_ahead(db):
    db.get(InventoryCounter, "ETH").next_seq = 500
    db.add(MuseumObject(id="BNM-ETH-0003", dept_code="ETH", seq=3,
                        title="Object 3", body="", is_seed=True))
    db.commit()
    inventory.sync_counters(db)
    db.commit()
    assert db.get(InventoryCounter, "ETH").next_seq == 500


def test_counters_are_kept_per_department(db):
    db.add(MuseumObject(id="BNM-ETH-0005", dept_code="ETH", seq=5,
                        title="E", body="", is_seed=True))
    db.add(MuseumObject(id="BNM-ARC-0099", dept_code="ARC", seq=99,
                        title="A", body="", is_seed=True))
    db.commit()
    inventory.sync_counters(db)
    db.commit()
    assert db.get(InventoryCounter, "ETH").next_seq == 6
    assert db.get(InventoryCounter, "ARC").next_seq == 100
