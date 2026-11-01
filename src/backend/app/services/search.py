"""Collection search.

Ships with LIKE, which reproduces the prototype's matches() exactly: split the
query on whitespace and require every word to appear somewhere in the record.

FULLTEXT is indexed and ready (ft_object), but is NOT the default, because it
would surprise people in a demo:
  - innodb_ft_min_token_size defaults to 3, so two-letter words find nothing.
    docker/mysql/conf.d/bnm.cnf sets it to 2, but only on the first boot,
    since it takes effect when the index is built.
  - the default stopword list silently drops common English words.
  - 'BNM-ETH-0142' tokenises to BNM / ETH / 0142, so searching a full
    inventory number in NATURAL LANGUAGE mode matches the whole department.
Flip it with SEARCH_MODE=fulltext once those are understood.
"""
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from ..config import settings
from ..models import Location, MuseumObject

SEARCHABLE = (
    MuseumObject.title,
    MuseumObject.origin,
    MuseumObject.material,
    MuseumObject.body,
    MuseumObject.id,
    MuseumObject.object_date,
)


def apply_query(stmt, q: str):
    q = (q or "").strip()
    if not q:
        return stmt
    if settings.search_mode == "fulltext" and not any(c in q for c in "-_"):
        terms = " ".join(f"+{w}*" for w in q.split())
        return stmt.where(
            MuseumObject.__table__.c.title.bool_op("MATCH")(terms)  # pragma: no cover
        )
    # Every whitespace-separated word must match somewhere -- AND, not OR.
    for word in q.split():
        like = f"%{word}%"
        stmt = stmt.where(
            or_(*[col.like(like) for col in SEARCHABLE], Location.label.like(like))
        )
    return stmt
