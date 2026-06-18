import { useState } from "react";
import { Heart, MessageCircle, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import CommentSection from "./CommentSection";

function formatDate(iso) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PostCard({
  post,
  currentUserId,
  onLike,
  onUnlike,
  onUpdate,
  onDelete,
  onComment,
}) {
  const [showComments, setShowComments] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [menuOpen, setMenuOpen] = useState(false);
  const isOwner = post.user_id === currentUserId;

  const handleSaveEdit = async () => {
    await onUpdate(post.id, { content: editContent });
    setEditing(false);
    setMenuOpen(false);
  };

  return (
    <article className="card post-card">
      <header className="post-card__header">
        <div className="post-card__author">
          {post.user_avatar_url ? (
            <img src={post.user_avatar_url} alt="" className="post-card__avatar" />
          ) : (
            <div className="post-card__avatar post-card__avatar--placeholder" />
          )}
          <div>
            <p className="post-card__name">{post.user_name}</p>
            <p className="post-card__date">{formatDate(post.created_at)}</p>
          </div>
        </div>
        {isOwner && (
          <div className="post-card__menu-wrap">
            <button
              type="button"
              className="post-card__menu-btn"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label="Options"
            >
              <MoreHorizontal size={18} />
            </button>
            {menuOpen && (
              <div className="post-card__menu">
                <button type="button" onClick={() => { setEditing(true); setMenuOpen(false); }}>
                  <Pencil size={14} /> Modifier
                </button>
                <button type="button" className="danger" onClick={() => onDelete(post.id)}>
                  <Trash2 size={14} /> Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {editing ? (
        <div className="post-card__edit">
          <textarea
            className="textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div className="post-card__edit-actions">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing(false)}>
              Annuler
            </button>
            <button type="button" className="btn btn--primary btn--sm" onClick={handleSaveEdit}>
              Enregistrer
            </button>
          </div>
        </div>
      ) : (
        <p className="post-card__content">{post.content}</p>
      )}

      {post.media_url && (
        <div className="post-card__media">
          {post.media_type === "video" ? (
            <video src={post.media_url} controls className="post-card__media-el" />
          ) : (
            <img src={post.media_url} alt="" className="post-card__media-el" loading="lazy" />
          )}
        </div>
      )}

      <footer className="post-card__actions">
        <button
          type="button"
          className={`post-card__action${post.liked_by_me ? " post-card__action--active" : ""}`}
          onClick={() => (post.liked_by_me ? onUnlike(post.id) : onLike(post.id))}
        >
          <Heart size={18} fill={post.liked_by_me ? "currentColor" : "none"} />
          {post.like_count}
        </button>
        <button
          type="button"
          className="post-card__action"
          onClick={() => setShowComments((s) => !s)}
        >
          <MessageCircle size={18} />
          {post.comment_count}
        </button>
      </footer>

      {showComments && (
        <CommentSection
          postId={post.id}
          currentUserId={currentUserId}
          onComment={onComment}
        />
      )}
    </article>
  );
}
