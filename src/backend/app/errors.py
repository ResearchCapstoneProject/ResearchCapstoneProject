from fastapi import HTTPException, status


def bad_request(code: str, message: str, **extra):
    return HTTPException(status.HTTP_400_BAD_REQUEST,
                         detail={"code": code, "message": message, **extra})


def not_found(message: str = "Not found"):
    return HTTPException(status.HTTP_404_NOT_FOUND,
                         detail={"code": "not_found", "message": message})


def conflict(code: str, message: str, **extra):
    return HTTPException(status.HTTP_409_CONFLICT,
                         detail={"code": code, "message": message, **extra})


def unauthorised(message: str = "Sign in to continue."):
    return HTTPException(status.HTTP_401_UNAUTHORIZED,
                         detail={"code": "unauthorised", "message": message})


def forbidden(message: str = "You do not have access to this."):
    return HTTPException(status.HTTP_403_FORBIDDEN,
                         detail={"code": "forbidden", "message": message})
