"""Sending e-mail, and the e-ticket in particular.

Three decisions worth knowing before changing anything here.

**It is off until someone configures it.** `MAIL_MODE=off` is the default, and
`GET /api/config` passes that on, so the ticket page promises an e-mail only
where one can actually be sent. The museum's mail account is not something a
developer can invent.

**A failed message never fails a booking.** The visitor has a slot, a code and
a ticket on screen; a mail server that is slow or down must not turn that into
an error. Sending happens after the response, in a background task, and every
exception is caught and logged here.

**The log never contains a visitor's address.** The API log is not covered by
the retention period that deletes bookings, and `docker compose logs` is
readable by anyone who can reach the server, so a message is logged by its
booking code -- see `_log_label`.

**There is an outbox mode.** With `MAIL_MODE=outbox` a message is written to a
file instead of being sent. That is how the tests check what visitors would
receive, and how you look at the wording without a mail account. Keep that
directory out of `UPLOAD_DIR`: uploads are served at `/uploads`, so an outbox
underneath it would publish every visitor's confirmation.
"""
import smtplib
import uuid
from datetime import datetime
from email.message import EmailMessage
from email.utils import formataddr, parseaddr

from ..config import settings


def enabled() -> bool:
    if settings.mail_mode == "outbox":
        return True
    return settings.mail_mode == "smtp" and bool(settings.smtp_host)


def _build(to: str, subject: str, text: str) -> EmailMessage:
    msg = EmailMessage()
    name, addr = parseaddr(settings.mail_from)
    msg["From"] = formataddr((name, addr)) if addr else settings.mail_from
    msg["To"] = to
    msg["Subject"] = subject
    if settings.mail_reply_to:
        msg["Reply-To"] = settings.mail_reply_to
    msg.set_content(text)
    return msg


def _log_label(to: str, ref: str) -> str:
    """How this message is named in the log: a booking code, or a domain.

    Never the address itself. Callers pass `ref` where they have something
    better; the domain alone is enough to tell a refused provider from a
    typo, and it identifies nobody.
    """
    if ref:
        return ref
    domain = to.rsplit("@", 1)[-1] if "@" in (to or "") else "?"
    return f"<address>@{domain}"


def send(to: str, subject: str, text: str, *, ref: str = "") -> bool:
    """Send one message. Returns whether it went; never raises."""
    if not enabled():
        return False
    if "@" not in (to or ""):
        print("[mail] not an address")
        return False

    label = _log_label(to, ref)
    try:
        # Inside the try on purpose: building the message can fail too. An
        # address with a newline in it is refused by the e-mail library
        # (which is what stops header injection), and this function promises
        # never to raise.
        msg = _build(to, subject, text)
        if settings.mail_mode == "outbox":
            settings.mail_outbox_dir.mkdir(parents=True, exist_ok=True)
            stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
            path = settings.mail_outbox_dir / f"{stamp}-{uuid.uuid4().hex[:8]}.eml"
            path.write_bytes(bytes(msg))
            print(f"[mail] {label}: written to {path}")
            return True

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port,
                          timeout=settings.smtp_timeout) as smtp:
            if settings.smtp_starttls:
                smtp.starttls()
            if settings.smtp_user:
                smtp.login(settings.smtp_user, settings.smtp_password)
            smtp.send_message(msg)
        print(f"[mail] {label}: sent")
        return True
    except Exception as exc:                                  # noqa: BLE001
        # Deliberately broad: a booking is already made and must not fail
        # because of DNS, a refused connection, a rejected login, a server
        # that simply does not answer, or an address the e-mail library will
        # not put in a header.
        print(f"[mail] {label}: not sent -- {exc!r}")
        return False


# ------------------------------------------------------------- the e-ticket

def ticket_text(*, code: str, name: str, date_label: str, time_label: str,
                visitors: int, lines: str, total_label: str, event_title: str,
                ticket_url: str) -> str:
    """The confirmation, as plain text.

    Plain text on purpose: it arrives readable in every client, it cannot
    break, and the one thing the visitor needs -- the code -- is in it even
    if images are blocked. The QR code lives on the ticket page the link
    opens, which is the same page they saw when booking.
    """
    parts = [
        f"Dumela {name},",
        "",
        "your visit to the Botswana National Museum is booked.",
        "",
        f"  Booking code   {code}",
        f"  Date           {date_label}",
        f"  Entry          {time_label}",
        f"  Visitors       {visitors}",
    ]
    if lines:
        parts.append(f"  Tickets        {lines}")
    if event_title:
        parts.append(f"  Event          {event_title}")
    parts += [
        f"  To pay         {total_label}",
        "",
        "Show the code at the front desk, or open your ticket with its QR code:",
        f"  {ticket_url}",
        "",
        "Please arrive within your entry slot; you can stay until closing time.",
        "Admission is paid at the front desk, never online.",
        "",
        "Re a leboga – we look forward to seeing you.",
        "Botswana National Museum · Department of National Museum and Monuments",
        "331 Independence Avenue, Gaborone",
    ]
    return "\n".join(parts)
