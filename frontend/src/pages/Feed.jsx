import { useCallback, useEffect, useState } from "react";
import { Plus, History } from "lucide-react";
import { useApp } from "../context/AppContext";
import PostCard from "../components/PostCard";
import CreatePostModal from "../components/CreatePostModal";
import {
  fetchFeed,
  createPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  fetchUserLikes,
} from "../services/social";

export default function Feed() {
  const { userId, profile, avatar, showToast } = useApp();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [likesHistory, setLikesHistory] = useState([]);
  const [error, setError] = useState("");

  const authorPayload = {
    user_name: profile.name || "Utilisateur",
    user_avatar_url: avatar,
  };

  const loadFeed = useCallback(
    async (pageNum = 1, append = false) => {
      if (!userId) return;
      setLoading(true);
      setError("");
      try {
        const data = await fetchFeed(userId, pageNum);
        setPosts((prev) => (append ? [...prev, ...data.items] : data.items));
        setHasMore(data.has_more);
        setPage(pageNum);
      } catch (err) {
        setError(err.message || "Impossible de charger le fil.");
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadFeed(1);
  }, [loadFeed]);

  const handleCreate = async (data) => {
    const post = await createPost(userId, { ...data, ...authorPayload });
    setPosts((prev) => [post, ...prev]);
    showToast("Post publié !");
  };

  const handleUpdate = async (postId, data) => {
    const updated = await updatePost(userId, postId, data);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
    showToast("Post modifié.");
  };

  const handleDelete = async (postId) => {
    await deletePost(userId, postId);
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast("Post supprimé.");
  };

  const handleLike = async (postId) => {
    const updated = await likePost(userId, postId, authorPayload.user_name);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const handleUnlike = async (postId) => {
    const updated = await unlikePost(userId, postId);
    setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
  };

  const loadHistory = async () => {
    const likes = await fetchUserLikes(userId);
    setLikesHistory(likes);
    setShowHistory(true);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Fil d&apos;actualité</h1>
          <p className="page-header__subtitle">Partagez vos progrès avec la communauté</p>
        </div>
        <div className="page-header__actions">
          <button type="button" className="btn btn--secondary" onClick={loadHistory}>
            <History size={18} />
            Mes likes
          </button>
          <button type="button" className="btn btn--primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            Nouveau post
          </button>
        </div>
      </header>

      {error && (
        <div className="card card--empty" style={{ marginBottom: 16 }}>
          {error}
          <br />
          <small>Vérifiez que le backend et Cloudinary sont configurés.</small>
        </div>
      )}

      {loading && posts.length === 0 ? (
        <div className="card card--empty">Chargement du fil…</div>
      ) : posts.length === 0 && !error ? (
        <div className="card card--empty">
          Aucun post. Soyez le premier à publier !
        </div>
      ) : (
        <div className="feed-list">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              currentUserId={userId}
              onLike={handleLike}
              onUnlike={handleUnlike}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onComment={() => loadFeed(page)}
            />
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            type="button"
            className="btn btn--secondary"
            disabled={loading}
            onClick={() => loadFeed(page + 1, true)}
          >
            {loading ? "Chargement…" : "Voir plus"}
          </button>
        </div>
      )}

      <CreatePostModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)} role="presentation">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="title-font" style={{ marginBottom: 16 }}>
              Historique de mes likes
            </h2>
            {likesHistory.length === 0 ? (
              <p className="comment-section__empty">Aucun like pour le moment.</p>
            ) : (
              <ul className="likes-history">
                {likesHistory.map((like) => (
                  <li key={like.id}>
                    Post #{like.post_id} — {new Date(like.created_at).toLocaleString("fr-FR")}
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              className="btn btn--secondary btn--full"
              style={{ marginTop: 16 }}
              onClick={() => setShowHistory(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
