"""UT-10  Hashing for scan analytics (NFR-11).

NFR-11 says the system keeps no raw IP addresses. The hash has to be stable
within a day, so repeat scans can be de-duplicated, and useless afterwards.
"""
from freezegun import freeze_time

from app.services.privacy import daily_hash

IP = "41.221.0.42"


def test_nothing_hashes_to_nothing():
    assert daily_hash(None) is None
    assert daily_hash("") is None


def test_the_raw_value_never_appears_in_the_hash():
    out = daily_hash(IP)
    assert IP not in out
    assert "41.221" not in out


def test_the_hash_is_a_sha256_digest():
    assert len(daily_hash(IP)) == 64
    assert all(c in "0123456789abcdef" for c in daily_hash(IP))


@freeze_time("2026-11-07")
def test_the_same_address_hashes_the_same_way_within_a_day():
    """So two scans of one label by one visitor can be recognised."""
    assert daily_hash(IP) == daily_hash(IP)


@freeze_time("2026-11-07")
def test_different_addresses_hash_differently():
    assert daily_hash(IP) != daily_hash("41.221.0.43")


def test_the_salt_rotates_daily_so_yesterday_cannot_be_linked_to_today():
    with freeze_time("2026-11-07"):
        today = daily_hash(IP)
    with freeze_time("2026-11-08"):
        tomorrow = daily_hash(IP)
    assert today != tomorrow


def test_a_user_agent_is_hashed_the_same_way():
    ua = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
    assert ua not in daily_hash(ua)
