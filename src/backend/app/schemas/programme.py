from .common import CamelModel


class ExhibitionOut(CamelModel):
    key: str
    art: str
    kind: str
    dates: str
    title: str
    text: str


class EventOut(CamelModel):
    d: str        # 'YYYY-MM-DD', the key the prototype uses
    time: str
    kind: str
    title: str
    place: str
    # Who is leading it, the description under the title and the flyer. Empty
    # for an event that has none; the events page leaves those parts out.
    by: str = ""
    text: str = ""
    pdf: str = ""


class TourOut(CamelModel):
    id: str
    title: str
    mins: int
    start: str
    who: str
    sub: str = ""
    intro: str = ""
    stops: list[str] = []
