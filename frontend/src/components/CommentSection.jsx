import { useEffect, useState } from "react";
import {
  fetchComments,
  createComment,
  updateComment,
  deleteComment,
} from "../services/social";
import { useApp } from "../context/AppContext";

function CommentItem({ comment, currentUserId, onRefresh, depth = 0 }) {
  const { profile, avatar } = useApp();
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [replyText, setReplyText] = useState("");
  const isOwner = comment.user_id === currentUserId;

  const submitReply = async () => {
    if (!replyText.trim()) return;
    await createComment(currentUserId, comment.post_id, {
      content: replyText.trim(),
      parent_id: comment.id,
      user_name: profile.name || "Utilisateur",
      user_avatar_url: avatar,
    });
    setReplyText("");
    setReplying(false);
    onRefresh();
  };

  const saveEdit = async () => {
    await updateComment(currentUserId, comment.id, text.trim());
    setEditing(false);
    onRefresh();
  };

  const remove = async () => {
    await deleteComment(currentUserId, comment.id);
    onRefresh();
  };

  return (
    <div className={`comment-item${depth > 0 ? " comment-item--reply" : ""}`}>
      <div className="comment-item__header">
        <span className="comment-item__author">{comment.user_name}</span>
        {isOwner && (
          <span className="comment-item__actions">
            <button type="button" onClick={() => setEditing((e) => !e)}>Modifier</button>
            <button type="button" onClick={remove}>Supprimer</button>
          </span>
        )}
      </div>
      {editing ? (
        <div className="comment-item__edit">
          <input className="input" value={text} onChange={(e) => setText(e.target.value)} />
          <button type="button" className="btn btn--primary btn--sm" onClick={saveEdit}>
            OK
          </button>
        </div>
      ) : (
        <p className="comment-item__text">{comment.content}</p>
      )}
      {depth < 2 && (
        <button type="button" className="comment-item__reply-btn" onClick={() => setReplying((r) => !r)}>
          Répondre
        </button>
      )}
      {replying && (
        <div className="comment-item__reply-form">
          <input
            className="input"
            placeholder="Votre réponse…"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
          />
          <button type="button" className="btn btn--primary btn--sm" onClick={submitReply}>
            Envoyer
          </button>
        </div>
      )}
      {comment.replies?.map((r) => (
        <CommentItem
          key={r.id}
          comment={r}
          currentUserId={currentUserId}
          onRefresh={onRefresh}
          depth={depth + 1}
        />
      ))}
    </div>
  );
}

export default function CommentSection({ postId, currentUserId, onComment }) {
  const { profile, avatar } = useApp();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchComments(postId);
      setComments(data);
      onComment?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submit = async () => {
    if (!newComment.trim()) return;
    await createComment(currentUserId, postId, {
      content: newComment.trim(),
      user_name: profile.name || "Utilisateur",
      user_avatar_url: avatar,
    });
    setNewComment("");
    await load();
  };

  return (
    <div className="comment-section">
      <div className="comment-section__form">
        <input
          className="input"
          placeholder="Ajouter un commentaire…"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button type="button" className="btn btn--primary btn--sm" onClick={submit}>
          Publier
        </button>
      </div>
      {loading ? (
        <p className="comment-section__empty">Chargement…</p>
      ) : comments.length === 0 ? (
        <p className="comment-section__empty">Aucun commentaire.</p>
      ) : (
        comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            currentUserId={currentUserId}
            onRefresh={load}
          />
        ))
      )}
    </div>
  );
}
