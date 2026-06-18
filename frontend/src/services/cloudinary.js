import { API_URL } from "../config";

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "";

let cachedConfig = null;

async function getConfig() {
  if (CLOUD_NAME && UPLOAD_PRESET) {
    return { cloud_name: CLOUD_NAME, upload_preset: UPLOAD_PRESET };
  }
  if (cachedConfig) return cachedConfig;
  const res = await fetch(`${API_URL}/media/cloudinary-config`);
  if (!res.ok) {
    throw new Error("Cloudinary non configuré. Ajoutez vos clés dans .env");
  }
  cachedConfig = await res.json();
  return cachedConfig;
}

function isVideo(file) {
  return file.type.startsWith("video/");
}

/**
 * Upload image ou vidéo vers Cloudinary (optimisation auto).
 * @returns {{ url: string, public_id: string, resource_type: 'image'|'video' }}
 */
export async function uploadToCloudinary(file, folder = "healthai") {
  const { cloud_name, upload_preset } = await getConfig();
  const resourceType = isVideo(file) ? "video" : "image";
  const subfolder = isVideo(file) ? `${folder}/videos` : `${folder}/images`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", upload_preset);
  formData.append("folder", subfolder);

  if (resourceType === "image") {
    formData.append("quality", "auto");
    formData.append("fetch_format", "auto");
  }

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || "Échec de l'upload Cloudinary");
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
    resource_type: resourceType,
  };
}

export async function uploadAvatar(file, userId) {
  return uploadToCloudinary(file, `healthai/avatars/${userId}`);
}

export async function uploadPostMedia(file) {
  return uploadToCloudinary(file, "healthai/posts");
}
