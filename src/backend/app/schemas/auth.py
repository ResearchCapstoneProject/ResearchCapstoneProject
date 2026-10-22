from .common import CamelModel


class LoginIn(CamelModel):
    username: str
    password: str


class UserOut(CamelModel):
    id: int
    username: str
    display_name: str
    role: str
