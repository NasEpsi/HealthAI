from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


class PostCreate(BaseModel):
    content: str = Field(min_length=1, max_length=5000)
    media_type: Optional[Literal["image", "video"]] = None
    media_url: Optional[str] = None
    media_public_id: Optional[str] = None
    user_name: str
    user_avatar_url: Optional[str] = None


class PostUpdate(BaseModel):
    content: Optional[str] = Field(default=None, min_length=1, max_length=5000)
    media_type: Optional[Literal["image", "video"]] = None
    media_url: Optional[str] = None
    media_public_id: Optional[str] = None


class PostRead(BaseModel):
    id: int
    user_id: str
    user_name: str
    user_avatar_url: Optional[str]
    content: str
    media_type: Optional[str]
    media_url: Optional[str]
    media_public_id: Optional[str]
    like_count: int = 0
    comment_count: int = 0
    liked_by_me: bool = False
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class PostFeedResponse(BaseModel):
    items: list[PostRead]
    page: int
    limit: int
    total: int
    has_more: bool


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)
    parent_id: Optional[int] = None
    user_name: str
    user_avatar_url: Optional[str] = None


class CommentUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentRead(BaseModel):
    id: int
    post_id: int
    user_id: str
    user_name: str
    user_avatar_url: Optional[str]
    parent_id: Optional[int]
    content: str
    created_at: datetime
    updated_at: datetime
    replies: list["CommentRead"] = []

    model_config = {"from_attributes": True}


class LikeRead(BaseModel):
    id: int
    post_id: int
    user_id: str
    user_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class CloudinaryConfigRead(BaseModel):
    cloud_name: str
    upload_preset: str


class LikeAction(BaseModel):
    user_name: str


CommentRead.model_rebuild()
