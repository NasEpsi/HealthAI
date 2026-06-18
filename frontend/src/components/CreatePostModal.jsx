import { useRef, useState } from "react";
import { Image, Video, X } from "lucide-react";
import { uploadPostMedia } from "../services/cloudinary";

export default function CreatePostModal({ open, onClose, onSubmit }) {
  const [content, setContent] = useState("");
  const [media, setMedia] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);

  if (!open) return null;

  const handleFile = (file) => {
    if (!file) return;
    setMedia(file);
    setPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    setMedia(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !media) {
      setError("Ajoutez du texte ou un média.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      let mediaPayload = {};
      if (media) {
        const uploaded = await uploadPostMedia(media);
        mediaPayload = {
          media_type: uploaded.resource_type,
          media_url: uploaded.url,
          media_public_id: uploaded.public_id,
        };
      }
      await onSubmit({
        content: content.trim() || " ",
        ...mediaPayload,
      });
      setContent("");
      clearMedia();
      onClose();
    } catch (err) {
      setError(err.message || "Impossible de publier.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-card__header">
          <h2 className="title-font">Nouveau post</h2>
          <button type="button" className="modal-card__close" onClick={onClose} aria-label="Fermer">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <textarea
            className="textarea"
            placeholder="Quoi de neuf ?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
          />
          {preview && (
            <div className="create-post__preview">
              {media?.type?.startsWith("video/") ? (
                <video src={preview} controls className="create-post__preview-el" />
              ) : (
                <img src={preview} alt="" className="create-post__preview-el" />
              )}
              <button type="button" className="create-post__clear-media" onClick={clearMedia}>
                <X size={16} />
              </button>
            </div>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="create-post__toolbar">
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => fileRef.current?.click()}>
              <Image size={16} /> Image
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => {
                if (fileRef.current) {
                  fileRef.current.accept = "video/mp4,video/webm,video/quicktime";
                  fileRef.current.click();
                }
              }}
            >
              <Video size={16} /> Vidéo
            </button>
          </div>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn--primary btn--full" disabled={uploading}>
            {uploading ? "Publication…" : "Publier"}
          </button>
        </form>
      </div>
    </div>
  );
}
