from pydantic import BaseModel

# ----------- REQUEST SCHEMAS -----------

class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


# ----------- RESPONSE SCHEMAS -----------

class TokenResponse(BaseModel):
    token: str


class MessageResponse(BaseModel):
    msg: str


class ErrorResponse(BaseModel):
    error: str