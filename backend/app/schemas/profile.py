from typing import Optional
from pydantic import BaseModel, ConfigDict


class ProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    phone_number: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    profile_picture: Optional[str] = None