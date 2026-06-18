from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from healthai.api.deps_auth import get_current_user_id
from healthai.api.schemas.social import (
    CommentCreate,
    CommentRead,
    CommentUpdate,
    LikeRead,
    LikeAction,
    PostCreate,
    PostFeedResponse,
    PostRead,
    PostUpdate,
)
from healthai.db import get_db
from healthai.models.social import Comment, Post, PostLike
from healthai.services.cloudinary_service import delete_media

router = APIRouter(prefix="/posts", tags=["posts"])


def _serialize_post(post: Post, db: Session, current_user_id: str | None = None) -> PostRead:
    like_count = db.query(func.count(PostLike.id)).filter(PostLike.post_id == post.id).scalar() or 0
    comment_count = db.query(func.count(Comment.id)).filter(Comment.post_id == post.id).scalar() or 0
    liked_by_me = False
    if current_user_id:
        liked_by_me = (
            db.query(PostLike)
            .filter(PostLike.post_id == post.id, PostLike.user_id == current_user_id)
            .first()
            is not None
        )
    return PostRead(
        id=post.id,
        user_id=post.user_id,
        user_name=post.user_name,
        user_avatar_url=post.user_avatar_url,
        content=post.content,
        media_type=post.media_type,
        media_url=post.media_url,
        media_public_id=post.media_public_id,
        like_count=like_count,
        comment_count=comment_count,
        liked_by_me=liked_by_me,
        created_at=post.created_at,
        updated_at=post.updated_at,
    )


def _build_comment_tree(comments: list[Comment]) -> list[CommentRead]:
    by_id: dict[int, CommentRead] = {}
    roots: list[CommentRead] = []

    for c in comments:
        by_id[c.id] = CommentRead(
            id=c.id,
            post_id=c.post_id,
            user_id=c.user_id,
            user_name=c.user_name,
            user_avatar_url=c.user_avatar_url,
            parent_id=c.parent_id,
            content=c.content,
            created_at=c.created_at,
            updated_at=c.updated_at,
            replies=[],
        )

    for c in comments:
        node = by_id[c.id]
        if c.parent_id and c.parent_id in by_id:
            by_id[c.parent_id].replies.append(node)
        else:
            roots.append(node)

    return roots


@router.get("", response_model=PostFeedResponse)
def list_posts(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    offset = (page - 1) * limit
    total = db.query(func.count(Post.id)).scalar() or 0
    posts = (
        db.query(Post)
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return PostFeedResponse(
        items=[_serialize_post(p, db, user_id) for p in posts],
        page=page,
        limit=limit,
        total=total,
        has_more=offset + len(posts) < total,
    )


@router.post("", response_model=PostRead, status_code=201)
def create_post(
    payload: PostCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = Post(
        user_id=user_id,
        user_name=payload.user_name,
        user_avatar_url=payload.user_avatar_url,
        content=payload.content.strip(),
        media_type=payload.media_type,
        media_url=payload.media_url,
        media_public_id=payload.media_public_id,
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return _serialize_post(post, db, user_id)


@router.get("/{post_id}", response_model=PostRead)
def get_post(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")
    return _serialize_post(post, db, user_id)


@router.put("/{post_id}", response_model=PostRead)
def update_post(
    post_id: int,
    payload: PostUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Modification non autorisée.")

    data = payload.model_dump(exclude_unset=True)
    if "content" in data and data["content"]:
        data["content"] = data["content"].strip()

    old_public_id = post.media_public_id
    for key, value in data.items():
        setattr(post, key, value)

    if "media_public_id" in data and old_public_id and old_public_id != post.media_public_id:
        delete_media(old_public_id, post.media_type)

    db.commit()
    db.refresh(post)
    return _serialize_post(post, db, user_id)


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")
    if post.user_id != user_id:
        raise HTTPException(status_code=403, detail="Suppression non autorisée.")

    if post.media_public_id:
        delete_media(post.media_public_id, post.media_type)

    db.delete(post)
    db.commit()


@router.post("/{post_id}/like", response_model=PostRead)
def like_post(
    post_id: int,
    payload: LikeAction,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")

    existing = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.user_id == user_id)
        .first()
    )
    if not existing:
        db.add(PostLike(post_id=post_id, user_id=user_id, user_name=payload.user_name))
        db.commit()

    db.refresh(post)
    return _serialize_post(post, db, user_id)


@router.delete("/{post_id}/like", response_model=PostRead)
def unlike_post(
    post_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")

    like = (
        db.query(PostLike)
        .filter(PostLike.post_id == post_id, PostLike.user_id == user_id)
        .first()
    )
    if like:
        db.delete(like)
        db.commit()

    db.refresh(post)
    return _serialize_post(post, db, user_id)


@router.get("/{post_id}/comments", response_model=list[CommentRead])
def list_comments(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")

    comments = (
        db.query(Comment)
        .filter(Comment.post_id == post_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    return _build_comment_tree(comments)


@router.post("/{post_id}/comments", response_model=CommentRead, status_code=201)
def create_comment(
    post_id: int,
    payload: CommentCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post introuvable.")

    if payload.parent_id:
        parent = db.query(Comment).filter(Comment.id == payload.parent_id, Comment.post_id == post_id).first()
        if not parent:
            raise HTTPException(status_code=400, detail="Commentaire parent introuvable.")

    comment = Comment(
        post_id=post_id,
        user_id=user_id,
        user_name=payload.user_name,
        user_avatar_url=payload.user_avatar_url,
        parent_id=payload.parent_id,
        content=payload.content.strip(),
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentRead.model_validate(comment)


@router.put("/comments/{comment_id}", response_model=CommentRead)
def update_comment(
    comment_id: int,
    payload: CommentUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Commentaire introuvable.")
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Modification non autorisée.")

    comment.content = payload.content.strip()
    db.commit()
    db.refresh(comment)
    return CommentRead.model_validate(comment)


@router.delete("/comments/{comment_id}", status_code=204)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Commentaire introuvable.")
    if comment.user_id != user_id:
        raise HTTPException(status_code=403, detail="Suppression non autorisée.")

    db.delete(comment)
    db.commit()


@router.get("/users/{target_user_id}/likes", response_model=list[LikeRead])
def list_user_likes(
    target_user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id),
):
    if target_user_id != user_id:
        raise HTTPException(status_code=403, detail="Accès non autorisé.")

    offset = (page - 1) * limit
    likes = (
        db.query(PostLike)
        .filter(PostLike.user_id == target_user_id)
        .order_by(PostLike.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    return [LikeRead.model_validate(like) for like in likes]
