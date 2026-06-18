# HealthAI Coach

Application de coaching nutrition et sport avec fil social communautaire.

## Sommaire

- [Guide d'installation](#guide-dinstallation)
- [Guide de déploiement](#guide-de-déploiement)
- [Réinitialisation](#réinitialisation)
- [Fonctionnalités sociales](#fonctionnalités-sociales)
- [Configuration Cloudinary](#configuration-cloudinary)
- [Guide de dépannage](#guide-de-dépannage)

---

## Guide d'installation

### Prérequis

| Outil | Version minimale | Usage |
|-------|------------------|-------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | récent | Backend, PostgreSQL, MongoDB, service IA |
| [Node.js](https://nodejs.org/) | 18+ | Frontend web / Capacitor |
| Git | — | Cloner le dépôt |

Optionnel : Android Studio / Xcode pour les builds mobiles (voir `docs/MOBILE.md`).

### 1. Cloner le projet

```bash
git clone https://github.com/NasEpsi/HealthAI.git
cd HealthAI
```

### 2. Configurer l'environnement

**Racine** — créer un fichier `.env` :

```env
POSTGRES_DB=healthai
POSTGRES_USER=healthai
POSTGRES_PASSWORD=healthai_pass
POSTGRES_PORT=5432

API_PORT=8000
API_KEY=healthai
DATABASE_URL=postgresql+psycopg2://healthai:healthai_pass@db:5432/healthai

NUTRITION_CSV=/app/data/raw/daily_food_nutrition.csv
FITNESS_CSV=/app/data/raw/fitness_tracker.csv
EXPORT_DIR=/app/data/cleaned

CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_UPLOAD_PRESET=votre_preset
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

**Frontend** — copier le modèle et l'adapter :

```bash
cp frontend/.env.example frontend/.env
```

### 3. Démarrer le backend

```bash
docker compose up --build -d
```

Vérifier que l'API répond : http://localhost:8000/health  
Documentation Swagger : http://localhost:8000/docs

### 4. Importer les données (ETL)

Les CSV sources sont dans `data/raw/`. Lancer le pipeline :

```bash
docker compose exec api python -m healthai.etl.run_pipeline
```

Les exports générés apparaissent dans `data/cleaned/`.

### 5. Démarrer le frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrir http://localhost:5173

### Services et ports

| Service | Conteneur | Port hôte | Rôle |
|---------|-----------|-----------|------|
| `api` | `healthai_api` | 8000 | API FastAPI |
| `ai_service` | `healthai_ai` | 8001 | Recommandations IA + vision repas |
| `db` | `healthai_db` | 5432 | PostgreSQL |
| `mongo` | `healthai_mongo` | 27017 | Stockage recommandations IA |
| `pgadmin` | `healthai_pgadmin` | 5050 | Interface PostgreSQL (admin@nas.com / admin) |

---

## Guide de déploiement

### Déploiement local (développement)

```bash
# Backend + bases de données
docker compose up --build -d

# Frontend en mode dev (hot-reload)
cd frontend && npm install && npm run dev
```

### Build frontend (production web)

```bash
cd frontend
npm install
npm run build        # sortie dans frontend/dist/
npm run preview      # prévisualisation locale
```

Servir le dossier `frontend/dist/` avec nginx, Apache ou un hébergeur statique. Configurer `VITE_API_URL` au moment du build pour pointer vers l'API en production.

### Déploiement Docker (backend)

Le `docker-compose.yml` à la racine lance l'ensemble du stack. En production :

1. Modifier les mots de passe PostgreSQL et `API_KEY` dans `.env`
2. Restreindre les ports exposés (ne pas publier PostgreSQL/MongoDB publiquement)
3. Ajouter un reverse proxy (nginx, Traefik) avec HTTPS devant l'API
4. Configurer `CORS_ORIGINS` dans `.env` avec l'URL du frontend :

```env
CORS_ORIGINS=https://votre-domaine.com
```

### Application mobile (Capacitor)

```bash
cd frontend
npm run cap:sync          # build + synchronisation native
npm run cap:android       # ouvre Android Studio
npm run cap:ios           # ouvre Xcode (macOS)
```

Sur émulateur Android, utiliser `VITE_API_URL=http://10.0.2.2:8000` dans `frontend/.env`.  
Sur appareil physique, utiliser l'IP locale du PC (`http://192.168.x.x:8000`).

Guide détaillé : `docs/MOBILE.md`

### Variables d'environnement

| Variable | Où | Description |
|----------|-----|-------------|
| `DATABASE_URL` | racine `.env` | Connexion PostgreSQL |
| `API_KEY` | racine `.env` | Clé pour les routes protégées (`x-api-key`) |
| `CLOUDINARY_*` | racine `.env` | Upload et purge des médias sociaux |
| `VITE_API_URL` | `frontend/.env` | URL de l'API vue par le navigateur |
| `VITE_CLOUDINARY_*` | `frontend/.env` | Upload direct depuis le frontend |
| `CORS_ORIGINS` | racine `.env` | Origines supplémentaires autorisées |

---

## Réinitialisation

Un script manuel permet de remettre à zéro la base de données, MongoDB et le stockage.

### Ce qui est réinitialisé

| Cible | Action |
|-------|--------|
| **PostgreSQL** | Vide toutes les tables du schéma `healthai` |
| **MongoDB** | Supprime la base `healthai_ai` (recommandations IA) |
| **Exports locaux** | Efface `data/cleaned/` |
| **Cloudinary** | Purge le dossier `healthai/` (nécessite `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET`) |

Les comptes utilisateurs **côté navigateur** (localStorage) ne sont pas effacés automatiquement.

### Lancer le script

**Windows (PowerShell) :**

```powershell
.\scripts\reset.ps1
```

**Linux / macOS :**

```bash
chmod +x scripts/reset.sh
./scripts/reset.sh
```

Le script demande de taper `RESET` pour confirmer.

### Options

| Option | PowerShell | Bash | Description |
|--------|------------|------|-------------|
| Sans invite | `-Confirm` | `--confirm` | Passe la confirmation interactive |
| Réimport ETL | `-Seed` | `--seed` | Relance le pipeline après reset |
| Volumes Docker | `-FullVolumes` | `--full-volumes` | `docker compose down -v` puis redémarrage |
| Ignorer Cloudinary | `-SkipCloudinary` | `--skip-cloudinary` | Ne purge pas le stockage distant |

Exemples :

```powershell
.\scripts\reset.ps1 -Confirm -Seed
.\scripts\reset.ps1 -Confirm -FullVolumes -Seed
```

```bash
./scripts/reset.sh --confirm --seed
```

### Commandes manuelles (avancé)

```bash
# Base PostgreSQL uniquement
docker compose exec api python -m healthai.scripts.reset --db --confirm

# Stockage uniquement
docker compose exec api python -m healthai.scripts.reset --storage --confirm

# MongoDB uniquement
docker compose exec mongo mongosh --eval "db.getSiblingDB('healthai_ai').dropDatabase()"
```

---

## Fonctionnalités sociales

- **Posts** : création, modification, suppression, fil paginé
- **Commentaires** : ajout, modification, suppression, réponses imbriquées
- **Likes** : like/unlike, compteur, historique personnel
- **Médias** : images et vidéos via **Cloudinary**, avatars utilisateur
- **Recherche** : trouver un utilisateur par nom ou email

Page : `/fil` (menu **Fil**)

---

## Configuration Cloudinary

1. Créez un compte sur [cloudinary.com](https://cloudinary.com)
2. Dashboard → **Settings → Upload → Upload presets**
3. Créez un preset **unsigned** (mode signing : Unsigned)
4. Renseignez les variables dans `.env` (racine) et `frontend/.env`

Si seul le backend est configuré, le frontend récupère la config via `GET /media/cloudinary-config`.

Pour que le script de réinitialisation purge aussi Cloudinary, renseignez `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`.

---

## Guide de dépannage

### Après un `git pull`, rien ne semble avoir changé

Les correctifs backend nécessitent un redémarrage des conteneurs :

```bash
git pull
docker compose up -d --build
docker compose restart api ai_service
```

Côté frontend : rafraîchir la page (`Ctrl+Shift+R`) ou relancer `npm run dev`.

L'API tourne avec `--reload` en développement : les changements Python dans `backend/src/` sont pris en compte automatiquement après un court délai.

### L'API ne démarre pas ou les tables sont absentes

PostgreSQL utilise le schéma `healthai`. S'il n'existe pas encore :

```bash
docker compose exec db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;"
docker compose restart api
```

### `docker compose up` échoue (port déjà utilisé)

Un autre service utilise le port 8000, 5432 ou 5173. Modifier `API_PORT` ou `POSTGRES_PORT` dans `.env`, ou arrêter le processus conflictuel.

### Le fil social ne charge pas / erreurs réseau

1. Vérifier que l'API tourne : http://localhost:8000/health
2. Vérifier `VITE_API_URL` dans `frontend/.env` (doit correspondre à l'URL accessible depuis le navigateur)
3. Sur mobile ou autre appareil du réseau, ajouter l'IP dans `CORS_ORIGINS` :

```env
CORS_ORIGINS=http://192.168.1.10:5173
```

### Les uploads d'images/vidéos échouent

- Vérifier `CLOUDINARY_CLOUD_NAME` et `CLOUDINARY_UPLOAD_PRESET` dans `.env` et `frontend/.env`
- Le preset doit être en mode **unsigned**
- Redémarrer l'API après modification du `.env` : `docker compose restart api`

### Le scanner de repas (vision IA) ne fonctionne pas

Le frontend appelle directement le service IA sur le port **8001**. Vérifier :

```bash
curl http://localhost:8001/health
docker compose ps ai_service
```

### Les exports ETL échouent partiellement

Certains fichiers KPI dépendent de vues SQL (`v_*`) non définies dans le dépôt. L'ingestion des CSV et les endpoints `/kpis` restent utilisables. Relancer :

```bash
docker compose exec api python -m healthai.etl.run_all
```

### Les données persistent après un reset de la base

L'authentification est stockée **côté client** (`localStorage` ou Capacitor Preferences). Après un reset serveur :

- Navigateur : vider le stockage du site ou se déconnecter / recréer un compte
- Mobile : désinstaller l'app ou effacer les données de l'application

### pgAdmin : connexion à PostgreSQL

- URL : http://localhost:5050
- Identifiants pgAdmin : `admin@nas.com` / `admin`
- Serveur PostgreSQL : hôte `db`, port `5432`, user `healthai`, mot de passe `healthai_pass`, base `healthai`

### Logs utiles

```bash
docker compose logs api --tail 50
docker compose logs ai_service --tail 50
docker compose logs db --tail 20
```

---

## Documentation complémentaire

| Fichier | Contenu |
|---------|---------|
| `frontend/README.md` | Routes, auth client, design system |
| `docs/MOBILE.md` | Build Android / iOS |
| `docs/architecture.md` | Architecture V2 |
| `docs/api.md` | Endpoints et intégration Power BI |
| `docs/model_donnee.md` | Modèle de données |
