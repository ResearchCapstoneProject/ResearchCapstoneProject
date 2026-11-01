"""Hashing for scan analytics.

Scan events are counted per object, not per person. Storing a raw IP would
make the table personal data for no analytical gain, so it is hashed with a
secret and a daily-rotating salt: repeat visits within a day can be
de-duplicated, and the value is useless afterwards.
"""
import hashlib
from datetime import date

from ..config import settings


def daily_hash(value: str | None) -> str | None:
    if not value:
        return None
    salt = f"{settings.session_secret}:{date.today().isoformat()}"
    return hashlib.sha256(f"{salt}:{value}".encode()).hexdigest()
