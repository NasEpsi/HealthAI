# HealthAI Coach

Application de coaching nutrition et sport avec fil social communautaire.

## Fonctionnalités sociales

- **Posts** : création, modification, suppression, fil paginé
- **Commentaires** : ajout, modification, suppression, réponses imbriquées
- **Likes** : like/unlike, compteur, historique personnel
- **Médias** : images et vidéos via **Cloudinary** (optimisation auto), avatars utilisateur

Page : `/fil` (menu **Fil**)

## Configuration Cloudinary

1. Créez un compte sur [cloudinary.com](https://cloudinary.com)
2. Dans le dashboard : **Settings → Upload → Upload presets**
3. Créez un preset **unsigned** (mode signing : Unsigned)
4. Renseignez les variables :

**Racine `.env`** (backend Docker) :
```
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_UPLOAD_PRESET=votre_preset
CLOUDINARY_API_KEY=...        # optionnel, pour supprimer les médias côté serveur
CLOUDINARY_API_SECRET=...     # optionnel
```

**`frontend/.env`** :
```
VITE_API_URL=http://localhost:8000
VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=votre_preset
```

Si seul le backend est configuré, le frontend récupère la config via `GET /media/cloudinary-config`.

## Démarrage

```bash
# Backend + base de données
docker compose up -d

# Frontend
cd frontend && npm install && npm run dev
```

Ouvrir http://localhost:5173 — le fil social nécessite un compte connecté et le backend sur le port 8000.
