"""IT-15  Inventory-number allocation on MySQL (FR-26, NFR-16).

allocate() relies on ``UPDATE ... SET next_seq = LAST_INSERT_ID(next_seq + 1)``,
which has no SQLite equivalent, so these run only against MySQL 8. FR-26
requires a number that is never reused -- not even after an object has been
deleted -- which is the property an accession register exists to guarantee.
"""
import pytest

from app.db import SessionLocal
from app.models import InventoryCounter, MuseumObject
from app.services import inventory

pytestmark = pytest.mark.mysql


def allocate_and_store(db, dept="Ethnology", title="Object"):
    code = inventory.dept_code(db, dept)
    seq = inventory.allocate(db, code)
    oid = inventory.format_inventory_no(code, seq)
    db.add(MuseumObject(id=oid, dept_code=code, seq=seq, title=title, body=""))
    db.commit()
    return oid


def test_the_first_number_of_a_department_is_one(db):
    assert allocate_and_store(db) == "BNM-ETH-0001"


def test_numbers_are_handed_out_in_order(db):
    assert [allocate_and_store(db) for _ in range(5)] == [
        "BNM-ETH-0001", "BNM-ETH-0002", "BNM-ETH-0003",
        "BNM-ETH-0004", "BNM-ETH-0005",
    ]


def test_the_counter_moves_on_with_every_allocation(db):
    allocate_and_store(db)
    assert db.get(InventoryCounter, "ETH").next_seq == 2


def test_a_deleted_number_is_never_handed_out_again(db):
    """The whole point of FR-26."""
    first = allocate_and_store(db)
    second = allocate_and_store(db)
    db.delete(db.get(MuseumObject, second))
    db.commit()

    third = allocate_and_store(db)
    assert third == "BNM-ETH-0003"
    assert third not in (first, second)


def test_deleting_every_object_does_not_reset_the_register(db):
    for _ in range(3):
        allocate_and_store(db)
    for obj in db.query(MuseumObject).all():
        db.delete(obj)
    db.commit()
    assert db.query(MuseumObject).count() == 0
    assert allocate_and_store(db) == "BNM-ETH-0004"


def test_departments_keep_separate_sequences(db):
    assert allocate_and_store(db, "Ethnology") == "BNM-ETH-0001"
    assert allocate_and_store(db, "Archaeology") == "BNM-ARC-0001"
    assert allocate_and_store(db, "Ethnology") == "BNM-ETH-0002"


def test_two_curators_saving_at_once_never_get_the_same_number(db):
    """The race the prototype's MAX(seq)+1 lost.

    Ten threads, each in its own transaction, allocate and insert. The unique
    primary key on museum_object would reject a duplicate, so ten rows with
    ten distinct numbers is the proof.
    """
    import concurrent.futures

    def worker(n):
        with SessionLocal() as session:
            code = inventory.dept_code(session, "Ethnology")
            seq = inventory.allocate(session, code)
            oid = inventory.format_inventory_no(code, seq)
            session.add(MuseumObject(id=oid, dept_code=code, seq=seq,
                                     title=f"Object {n}", body=""))
            session.commit()
            return oid

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as pool:
        numbers = list(pool.map(worker, range(10)))

    assert len(set(numbers)) == 10
    assert sorted(numbers) == [f"BNM-ETH-{i:04d}" for i in range(1, 11)]
    assert db.query(MuseumObject).count() == 10


def test_the_preview_shown_in_the_form_matches_the_next_allocation(db):
    preview = inventory.preview(db, "Ethnology")
    assert allocate_and_store(db) == preview
