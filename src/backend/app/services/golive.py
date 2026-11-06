"""Going live: the one action that takes the demonstration out of the site.

Everything in the database is one of three things, and the difference is what
this module is about:

  - the museum's own records -- the 60 objects of the *Art and Crafts of
    Botswana* catalogue (every one of them carries its catalogue page), the
    events from the museum's own material, the publications, the texts,
    uploaded pictures, visitor groups, staff accounts. None of it is touched
    here. Ever.
  - records the project invented so the site could be shown before the museum
    had entered anything: the sample bookings (`source='demo'`), the
    generated scan history (`source='seed'`) and what the staff area's
    simulate button produced (`source='staff_demo'`), plus the prototype's
    exhibitions and themed tours, which no page has rendered since Explore
    replaced them. Those are deleted.
  - real traffic: bookings visitors made and `source='qr'` scans. Kept, which
    is the difference between this and "Reset demo data" -- that one deletes
    exactly the real rows and keeps the invented ones, because it exists to
    restore the demonstration.

Besides the rows there are the notes in the interface that say "this is a
demonstration": the draft banner on the imprint and privacy pages, the
sample-content line in the footer, the wording in the staff area. They hang
off one setting, `demo_mode`, so going live switches them all off at once and
an admin can switch them back on for a presentation.
"""
from sqlalchemy import delete
from sqlalchemy.orm import Session

from ..models import Booking, BookingLine, Exhibition, ScanEvent, Tour, TourStop
from .availability import put_setting, setting
from .theme import DEFAULTS as THEME_DEFAULTS
from .theme import get as theme_get
from .theme import put as theme_put

DEMO_BOOKING_SOURCES = ("demo",)
DEMO_SCAN_SOURCES = ("seed", "staff_demo")


def demo_mode(db: Session) -> bool:
    return setting(db, "demo_mode", "1") not in ("0", "false", "False", "")


def set_demo_mode(db: Session, on: bool) -> None:
    """Caller commits."""
    put_setting(db, "demo_mode", "1" if on else "0")


def go_live(db: Session) -> dict:
    """Delete the invented records and switch the demo notes off."""
    # The ticket lines go first, by hand. MySQL would cascade and SQLite only
    # does with foreign keys switched on, so a delete that leaves this to the
    # database leaves orphaned rows on half the installations.
    demo_ids = [row[0] for row in db.query(Booking.id)
                .filter(Booking.source.in_(DEMO_BOOKING_SOURCES)).all()]
    if demo_ids:
        db.execute(delete(BookingLine).where(BookingLine.booking_id.in_(demo_ids)))
    bookings = db.execute(
        delete(Booking).where(Booking.source.in_(DEMO_BOOKING_SOURCES))).rowcount
    scans = db.execute(
        delete(ScanEvent).where(ScanEvent.source.in_(DEMO_SCAN_SOURCES))).rowcount

    # The stops go first: MySQL would cascade, SQLite only with foreign keys
    # switched on, and a deletion that depends on the database is not one to
    # rely on. Tours and exhibitions are the prototype's own invention; the
    # heritage trails that replaced them live in the frontend's content.
    tour_ids = [row[0] for row in db.query(Tour.id).all()]
    if tour_ids:
        db.execute(delete(TourStop).where(TourStop.tour_id.in_(tour_ids)))
    tours = db.execute(delete(Tour)).rowcount
    exhibitions = db.execute(delete(Exhibition)).rowcount

    set_demo_mode(db, False)

    # The footer's second line says the prices and inventory numbers are
    # sample content, which stops being true here. A line the museum has
    # rewritten itself is left exactly as it is.
    if theme_get(db)["footer_note_2"] == THEME_DEFAULTS["footer_note_2"]:
        theme_put(db, {"footer_note_2": ""})

    db.commit()
    return {"bookings": bookings, "scans": scans, "tours": tours,
            "exhibitions": exhibitions}
