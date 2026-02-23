from pydantic import BaseModel, Field
from typing import Optional


class UserBase(BaseModel):
    age: int = Field(..., ge=10, le=100)
    gender: str
    height_m: Optional[float] = Field(None, ge=1.0, le=2.5)
    experience_level: Optional[str] = None


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    age: Optional[int] = Field(None, ge=10, le=100)
    gender: Optional[str] = None
    height_m: Optional[float] = Field(None, ge=1.0, le=2.5)
    experience_level: Optional[str] = None


class UserOut(UserBase):
    id_user: int

    class Config:
        from_attributes = True