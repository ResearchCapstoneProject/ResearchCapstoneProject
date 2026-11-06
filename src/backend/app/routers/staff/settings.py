"""Visitor groups, prices and the shape of a time slot.

Everything the museum asked to be able to change without a developer lives
here: admission groups and what they cost, how many places a slot holds, and
how long a slot is.
"""
import re

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ...db import get_db
from ...deps import require_role
from ...errors import bad_request, conflict, not_found
from ...models import BookingLine, StaffUser, TicketType
from ...schemas.settings import (
    MailTest, TicketTypeAdminOut, TicketTypeCreate, TicketTypeUpdate,
    VisitSettingsOut, VisitSettingsUpdate,
)
from ...config import settings as app_settings
from ...services import audit, availability, golive, mail, retention

router = APIRouter(tags=["staff:settings"])


def _out(t: TicketType, in_use: bool = False) -> TicketTypeAdminOut:
    return TicketTypeAdminOut(
        key=t.ticket_key, name=t.name, desc=t.description,
        price_thebe=t.price_thebe, addon=t.is_addon, active=t.is_active,
        sort_order=t.sort_order, in_use=in_use,
    )


def _used_keys(db: Session) -> set[str]:
    return {r[0] for r in db.query(BookingLine.ticket_key).distinct().all()}


def _key_from_name(db: Session, name: str) -> str:
    """A short, stable key derived from the name: 'Senior citizens' -> 'senior'.

    The key ends up in booking rows and never changes afterwards, so it is
    generated once here rather than being typed by museum staff.
    """
    base = re.sub(r"[^a-z0-9]+", "", name.lower())[:12] or "group"
    key, n = base, 1
    while db.get(TicketType, key) is not None:
        suffix = str(n)
        key = base[: 16 - len(suffix)] + suffix
        n += 1
    return key


# ------------------------------------------------------------ visitor groups

@router.get("/ticket-types", response_model=list[TicketTypeAdminOut])
def list_ticket_types(db: Session = Depends(get_db)) -> list[TicketTypeAdminOut]:
    used = _used_keys(db)
    rows = db.query(TicketType).order_by(TicketType.sort_order,
                                         TicketType.name).all()
    return [_out(t, t.ticket_key in used) for t in rows]


@router.post("/ticket-types", response_model=TicketTypeAdminOut, status_code=201)
def create_ticket_type(payload: TicketTypeCreate,
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("admin"))
                       ) -> TicketTypeAdminOut:
    if db.query(TicketType).filter(TicketType.name == payload.name).first():
        raise conflict("duplicate_name", "A group with that name already exists.")

    t = TicketType(
        ticket_key=_key_from_name(db, payload.name), name=payload.name,
        description=payload.desc, price_thebe=payload.price_thebe,
        is_addon=payload.addon, is_active=payload.active,
        sort_order=payload.sort_order,
    )
    db.add(t)
    audit.record(db, user_id=user.id, action="create", entity="ticket_type",
                 entity_id=t.ticket_key,
                 detail={"name": t.name, "priceThebe": t.price_thebe})
    db.commit()
    db.refresh(t)
    return _out(t)


@router.patch("/ticket-types/{key}", response_model=TicketTypeAdminOut)
def update_ticket_type(key: str, payload: TicketTypeUpdate,
                       db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("admin"))
                       ) -> TicketTypeAdminOut:
    t = db.get(TicketType, key)
    if t is None:
        raise not_found("No visitor group with that key.")

    changed = payload.model_dump(exclude_unset=True)
    for field, value in changed.items():
        setattr(t, {"desc": "description", "addon": "is_addon",
                    "active": "is_active"}.get(field, field), value)

    audit.record(db, user_id=user.id, action="update", entity="ticket_type",
                 entity_id=key, detail=changed)
    db.commit()
    db.refresh(t)
    return _out(t, key in _used_keys(db))


@router.delete("/ticket-types/{key}", response_model=TicketTypeAdminOut)
def remove_ticket_type(key: str, db: Session = Depends(get_db),
                       user: StaffUser = Depends(require_role("admin"))
                       ) -> TicketTypeAdminOut:
    """Deactivate, or delete outright when the group was never booked."""
    t = db.get(TicketType, key)
    if t is None:
        raise not_found("No visitor group with that key.")

    active_left = (db.query(TicketType)
                   .filter(TicketType.is_active.is_(True),
                           TicketType.is_addon.is_(False),
                           TicketType.ticket_key != key).count())
    if t.is_active and not t.is_addon and active_left == 0:
        raise bad_request(
            "last_group",
            "This is the only admission group left. Add another one first, "
            "otherwise visitors cannot book at all.")

    if key in _used_keys(db):
        t.is_active = False
        audit.record(db, user_id=user.id, action="deactivate",
                     entity="ticket_type", entity_id=key)
        db.commit()
        db.refresh(t)
        return _out(t, True)

    out = _out(t)
    db.delete(t)
    audit.record(db, user_id=user.id, action="delete", entity="ticket_type",
                 entity_id=key)
    db.commit()
    return out


# ----------------------------------------------------------- visit settings

@router.post("/mail-test")
def mail_test(payload: MailTest, db: Session = Depends(get_db),
              user: StaffUser = Depends(require_role("admin"))) -> dict:
    """Send one message, so the museum can see whether its mail account works.

    Reports what happened rather than raising: "nothing was sent" is the
    answer the person at the screen needs, and the reason is in the API log.
    """
    sent = mail.send(
        payload.to,
        "Test message from the museum website",
        "This is a test message from the Botswana National Museum website.\n\n"
        "If you are reading it, the website can send e-mail: visitors will\n"
        "receive their booking confirmation, with their code and a link to\n"
        "their ticket.\n",
        ref="mail-test",
    )
    audit.record(db, user_id=user.id, action="mail-test", entity="setting",
                 entity_id="mail", detail={"sent": sent})
    db.commit()
    return {"sent": sent, "mode": app_settings.mail_mode,
            "enabled": mail.enabled()}


@router.post("/go-live")
def go_live(db: Session = Depends(get_db),
            user: StaffUser = Depends(require_role("admin"))) -> dict:
    """Take the demonstration out of the site. See services/golive.py for
    what is deleted and -- more importantly -- what is not."""
    out = golive.go_live(db)
    audit.record(db, user_id=user.id, action="go-live", entity="setting",
                 entity_id="demo_mode", detail=out)
    db.commit()
    return out


@router.get("/settings", response_model=VisitSettingsOut)
def get_settings(db: Session = Depends(get_db)) -> VisitSettingsOut:
    return VisitSettingsOut(
        capacity_per_slot=availability.capacity(db),
        slot_minutes=availability.slot_minutes(db),
        booking_window_days=availability.window_days(db),
        booking_retention_days=retention.retention_days(db),
        demo_mode=golive.demo_mode(db),
        email_enabled=mail.enabled(),
        tour_times=availability.tour_times(db),
        currency=availability.setting(db, "currency", "BWP"),
        slot_lengths=list(availability.SLOT_LENGTHS),
    )


@router.patch("/settings", response_model=VisitSettingsOut)
def update_settings(payload: VisitSettingsUpdate,
                    db: Session = Depends(get_db),
                    user: StaffUser = Depends(require_role("admin"))
                    ) -> VisitSettingsOut:
    changed = payload.model_dump(exclude_unset=True)
    if "demo_mode" in changed:
        golive.set_demo_mode(db, bool(changed["demo_mode"]))

    if payload.slot_minutes is not None \
            and payload.slot_minutes not in availability.SLOT_LENGTHS:
        raise bad_request(
            "slot_length",
            "Slot length must be one of: "
            + ", ".join(f"{m} minutes" for m in availability.SLOT_LENGTHS) + ".")

    keys = {
        "capacity_per_slot": "capacity_per_hour",   # historical key name
        "slot_minutes": "slot_minutes",
        "booking_window_days": "booking_window_days",
        "booking_retention_days": "booking_retention_days",
    }
    for field, setting_key in keys.items():
        if field in changed:
            availability.put_setting(db, setting_key, str(changed[field]))
    if "tour_times" in changed:
        availability.put_setting(
            db, "tour_times", ",".join(str(h) for h in changed["tour_times"]))

    audit.record(db, user_id=user.id, action="update", entity="setting",
                 entity_id="visits", detail=changed)
    db.commit()
    return get_settings(db)
