"""Tests unitaires du module social (sans base de données)."""

from datetime import datetime, timezone
from types import SimpleNamespace

from unittest.mock import MagicMock

from healthai.api.routers.posts import _build_comment_tree


def _mock_db():
    db = MagicMock()
    db.query.return_value.filter.return_value.first.return_value = None
    return db


def _comment(id, post_id, user_id, content, parent_id=None):
    return SimpleNamespace(
        id=id,
        post_id=post_id,
        user_id=user_id,
        user_name=f"user-{user_id}",
        user_avatar_url=None,
        parent_id=parent_id,
        content=content,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )


def test_build_comment_tree_nested():
    comments = [
        _comment(1, 10, "a", "root 1"),
        _comment(2, 10, "b", "root 2"),
        _comment(3, 10, "a", "reply 1", parent_id=1),
        _comment(4, 10, "c", "reply 2", parent_id=3),
    ]
    tree = _build_comment_tree(comments, _mock_db())

    assert len(tree) == 2
    assert tree[0].id == 1
    assert len(tree[0].replies) == 1
    assert tree[0].replies[0].id == 3
    assert len(tree[0].replies[0].replies) == 1
    assert tree[0].replies[0].replies[0].id == 4


def test_build_comment_tree_orphan_becomes_root():
    comments = [_comment(5, 10, "x", "orphan", parent_id=999)]
    tree = _build_comment_tree(comments, _mock_db())
    assert len(tree) == 1
    assert tree[0].id == 5
