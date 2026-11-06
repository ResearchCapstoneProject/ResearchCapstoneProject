from .common import CamelModel


class EventOut(CamelModel):
    # The id the "Book" button carries into the ticket flow.
    id: int
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

