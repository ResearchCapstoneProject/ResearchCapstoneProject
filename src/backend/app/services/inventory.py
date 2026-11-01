"""Inventory-number allocation.

The prototype computed the next number as MAX(seq) + 1 over the objects in
localStorage. That has two problems worth stating plainly, because a museum
registrar will care about both:

  1. It races. Two curators saving at the same moment get the same number.
  2. It recycles. Delete BNM-ETH-0143 and the next object created becomes
     BNM-ETH-0143 again -- a different object wearing a retired number, which
     is exactly the thing an accession register exists to prevent.

A counter row fixes both. The UPDATE below takes an InnoDB row lock and sets
the session's LAST_INSERT_ID as a side effect, so allocation is atomic and
monotonic without an extra SELECT.
"""
from sqlalchemy import text
from sqlalchemy.orm import Session

from ..models import Department, InventoryCounter, MuseumObject


def dept_code(db: Session, dept_name: str) -> str:
    row = db.query(Department).filter(Department.name == dept_name).one_or_none()
    return row.code if row else "OBJ"


def format_inventory_no(code: str, seq: int) -> str:
    return f"BNM-{code}-{seq:04d}"


def allocate(db: Session, code: str) -> int:
    """Reserve and return the next sequence number for a department.

    Must run inside the same transaction as the INSERT that uses it.
    """
    db.execute(
        text(
            "UPDATE inventory_counter "
            "SET next_seq = LAST_INSERT_ID(next_seq + 1) "
            "WHERE dept_code = :code"
        ),
        {"code": code},
    )
    allocated = db.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()
    # LAST_INSERT_ID(expr) returns the value it was *set* to, i.e. the next
    # free number, so the one we just reserved is one below it.
    return int(allocated) - 1


def preview(db: Session, dept_name: str) -> str:
    """Non-reserving preview for the form. Does not consume a number."""
    code = dept_code(db, dept_name)
    row = db.get(InventoryCounter, code)
    return format_inventory_no(code, row.next_seq if row else 1)


def sync_counters(db: Session) -> None:
    """Lift every counter above the highest seeded seq for its department."""
    rows = (
        db.query(MuseumObject.dept_code, MuseumObject.seq)
        .order_by(MuseumObject.dept_code, MuseumObject.seq.desc())
        .all()
    )
    highest: dict[str, int] = {}
    for code, seq in rows:
        highest[code] = max(highest.get(code, 0), seq)
    for code, top in highest.items():
        counter = db.get(InventoryCounter, code)
        if counter and counter.next_seq <= top:
            counter.next_seq = top + 1
