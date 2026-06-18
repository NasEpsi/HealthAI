const MAX_AVATAR_BYTES = 400_000;
const MAX_DIMENSION = 256;

export function resizeImageToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file?.type?.startsWith("image/")) {
      reject(new Error("Format d'image non supporté."));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        let quality = 0.85;
        let dataUrl = canvas.toDataURL("image/jpeg", quality);
        while (dataUrl.length > MAX_AVATAR_BYTES * 1.37 && quality > 0.4) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        if (dataUrl.length > MAX_AVATAR_BYTES * 1.37) {
          reject(new Error("Image trop volumineuse. Choisissez une photo plus petite."));
          return;
        }
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error("Impossible de lire l'image."));
      img.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Impossible de lire le fichier."));
    reader.readAsDataURL(file);
  });
}
