from pydantic import BaseModel, ConfigDict


def to_camel(s: str) -> str:
    head, *rest = s.split("_")
    return head + "".join(w.capitalize() for w in rest)


class CamelModel(BaseModel):
    """Serialises as camelCase.

    The frontend views were written against the prototype's own field names
    (onDisplay, added, dept, text), so matching them here means no view has to
    be touched when it starts reading from the API.
    """

    model_config = ConfigDict(
        alias_generator=to_camel, populate_by_name=True, from_attributes=True
    )
