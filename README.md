# HealthAI Coach MSPR TPRE601

HealthAI Coach est une plateforme de coaching nutrition et sport composee de trois briques principales :

- un frontend React/Vite pour l'experience utilisateur web et mobile Capacitor
- une API FastAPI pour la logique metier, les profils, le fil social et l'acces PostgreSQL
- un microservice FastAPI dedie aux recommandations IA nutrition, sport et analyse de repas

Le projet est pense pour une demonstration locale simple avec Docker Compose pour les services backend et un lancement separe du frontend.

## Sommaire

- [Presentation du projet](#presentation-du-projet)
- [Architecture globale](#architecture-globale)
- [Stack technique](#stack-technique)
- [Guide d'installation](#guide-dinstallation)
- [Guide de deploiement](#guide-de-deploiement)
- [Monitoring](#monitoring)
- [URLs utiles](#urls-utiles)
- [Structure du projet](#structure-du-projet)
- [Reinitialisation](#reinitialisation)
- [Fonctionnalites sociales](#fonctionnalites-sociales)
- [Configuration Cloudinary](#configuration-cloudinary)
- [Guide de depannage](#guide-de-depannage)
- [Documentation complementaire](#documentation-complementaire)

## Presentation du projet

Le produit couvre les usages suivants :

- suivi utilisateur et profil sante
- journal alimentaire et recommandations nutritionnelles
- recommandations d'entrainement
- fil social avec posts, commentaires, likes et medias
- observabilite locale avec Prometheus, Grafana et cAdvisor

## Architecture globale

- `frontend/` : interface React/Vite et application mobile Capacitor
- `backend/` : API principale FastAPI, acces PostgreSQL, routes metier et sociales
- `ai-service/` : microservice IA FastAPI, recommandations et mode degrade
- `monitoring/` : configuration Prometheus
- `docs/` : documentation de deploiement, architecture, tests, CI/CD et monitoring

Un schema detaille est disponible dans [docs/architecture.md](docs/architecture.md).

## Stack technique

- Frontend : React 19, Vite, React Router, Capacitor
- Backend : Python 3.12, FastAPI, SQLAlchemy, PostgreSQL
- IA : FastAPI, moteur de recommandations rule-based, MongoDB
- Monitoring : Prometheus, Grafana, cAdvisor
- Conteneurisation : Docker Compose
- CI/CD : GitHub Actions

## Guide d'installation

### Prerequis

| Outil | Version minimale | Usage |
|-------|------------------|-------|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | recent | Backend, PostgreSQL, MongoDB, service IA |
| [Node.js](https://nodejs.org/) | 18+ | Frontend web / Capacitor |
| Git | - | Cloner le depot |

Optionnel : Android Studio / Xcode pour les builds mobiles. Voir `docs/MOBILE.md`.

### 1. Cloner le projet

```bash
git clone https://github.com/NasEpsi/HealthAI.git
cd HealthAI
```

### 2. Configurer l'environnement

Racine :

```powershell
Copy-Item .env.example .env
```

Frontend :

```powershell
Copy-Item frontend/.env.example frontend/.env
```

Variables principales du `.env` :

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `DATABASE_URL`
- `API_PORT`
- `API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_UPLOAD_PRESET`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `MONGO_URL`
- `MONGO_DB_NAME`

Variables frontend dans `frontend/.env` :

- `VITE_API_URL`
- `VITE_API_KEY`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

### 3. Demarrer le backend

```bash
docker compose up --build -d
```

Verifier :

- API : [http://localhost:8000/health](http://localhost:8000/health)
- Swagger backend : [http://localhost:8000/docs](http://localhost:8000/docs)
- API IA : [http://localhost:8001/health](http://localhost:8001/health)
- Swagger IA : [http://localhost:8001/docs](http://localhost:8001/docs)

### 4. Importer les donnees ETL

Les CSV sources sont dans `data/raw/`. Lancer le pipeline :

```bash
docker compose exec api python -m healthai.etl.run_pipeline
```

Les exports generes apparaissent dans `data/cleaned/`.

### 5. Demarrer le frontend

```bash
cd frontend
npm ci
npm run dev
```

Ouvrir [http://localhost:5173](http://localhost:5173).

### Services et ports

| Service | Conteneur | Port hote | Role |
|---------|-----------|-----------|------|
| `api` | `healthai_api` | 8000 | API FastAPI |
| `ai_service` | `healthai_ai` | 8001 | Recommandations IA + vision repas |
| `db` | `healthai_db` | 5432 | PostgreSQL |
| `mongo` | `healthai_mongo` | 27017 | Stockage recommandations IA |
| `pgadmin` | `healthai_pgadmin` | 5050 | Interface PostgreSQL |
| `prometheus` | `healthai_prometheus` | 9090 | Collecte des metriques |
| `cadvisor` | `healthai_cadvisor` | 8080 | Metriques Docker |
| `grafana` | `healthai_grafana` | 3000 | Visualisation monitoring |

## Guide de deploiement

### Deploiement local

```bash
docker compose up --build
```

Frontend dans un second terminal :

```bash
cd frontend
npm ci
npm run dev
```

Arret :

```bash
docker compose down
```

### Build frontend

```bash
cd frontend
npm ci
npm run build
npm run preview
```

### Application mobile Capacitor

```bash
cd frontend
npm run cap:sync
npm run cap:android
npm run cap:ios
```

Sur emulateur Android, utiliser `VITE_API_URL=http://10.0.2.2:8000`.  
Sur appareil physique, utiliser l'IP locale du PC.

Guide detaille : `docs/MOBILE.md`

## Monitoring

Le monitoring local repose sur :

- Prometheus pour le scraping des metriques
- Grafana pour la visualisation
- cAdvisor pour les metriques conteneurs Docker

Prometheus surveille actuellement :

- `api:8000/metrics`
- `ai_service:8000/metrics`
- `cadvisor:8080`

Documentation detaillee : [docs/monitoring.md](docs/monitoring.md).

## URLs utiles

- Frontend Vite : [http://localhost:5173](http://localhost:5173)
- API backend : [http://localhost:8000](http://localhost:8000)
- Swagger backend : [http://localhost:8000/docs](http://localhost:8000/docs)
- API IA : [http://localhost:8001](http://localhost:8001)
- Swagger IA : [http://localhost:8001/docs](http://localhost:8001/docs)
- URL cAdvisor : [http://localhost:8080](http://localhost:8080)
- URL Prometheus targets : [http://localhost:9090/targets](http://localhost:9090/targets)
- Prometheus UI : [http://localhost:9090](http://localhost:9090)
- URL Grafana : [http://localhost:3000](http://localhost:3000)
- pgAdmin : [http://localhost:5050](http://localhost:5050)

## Structure du projet

```text
HealthAI/
|-- ai-service/
|-- backend/
|-- data/
|-- docs/
|-- frontend/
|-- monitoring/
|-- scripts/
|-- docker-compose.yml
|-- .env.example
`-- README.md
```

## Reinitialisation

Un script manuel permet de remettre a zero la base de donnees, MongoDB et le stockage.

### Ce qui est reinitialise

| Cible | Action |
|-------|--------|
| PostgreSQL | Vide les tables du schema `healthai` |
| MongoDB | Supprime la base `healthai_ai` |
| Exports locaux | Efface `data/cleaned/` |
| Cloudinary | Purge le dossier `healthai/` si les cles sont configurees |

Les comptes utilisateurs stockes cote navigateur ne sont pas effaces automatiquement.

### Lancer le script

Windows :

```powershell
.\scripts\reset.ps1
```

Linux / macOS :

```bash
chmod +x scripts/reset.sh
./scripts/reset.sh
```

Le script demande de taper `RESET` pour confirmer.

### Options

| Option | PowerShell | Bash | Description |
|--------|------------|------|-------------|
| Sans invite | `-Confirm` | `--confirm` | Passe la confirmation interactive |
| Reimport ETL | `-Seed` | `--seed` | Relance le pipeline apres reset |
| Volumes Docker | `-FullVolumes` | `--full-volumes` | `docker compose down -v` puis redemarrage |
| Ignorer Cloudinary | `-SkipCloudinary` | `--skip-cloudinary` | Ne purge pas le stockage distant |

## Fonctionnalites sociales

- Posts : creation, modification, suppression, fil pagine
- Commentaires : ajout, modification, suppression, reponses imbriquees
- Likes : like/unlike, compteur, historique personnel
- Medias : images et videos via Cloudinary, avatars utilisateur
- Recherche : trouver un utilisateur par nom ou email

Page : `/fil`

## Configuration Cloudinary

1. Creer un compte sur [cloudinary.com](https://cloudinary.com)
2. Ouvrir `Settings -> Upload -> Upload presets`
3. Creer un preset `unsigned`
4. Renseigner les variables dans `.env` et `frontend/.env`

Si seul le backend est configure, le frontend recupere la config via `GET /media/cloudinary-config`.

Pour que le script de reinitialisation purge aussi Cloudinary, renseigner `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET`.

## Guide de depannage

### Apres un `git pull`, rien ne semble avoir change

```bash
git pull
docker compose up -d --build
docker compose restart api ai_service
```

Cote frontend, rafraichir la page ou relancer `npm run dev`.

### L'API ne demarre pas ou les tables sont absentes

```bash
docker compose exec db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;"
docker compose restart api
```

### `docker compose up` echoue

Verifier qu'aucun autre service n'utilise deja les ports 8000, 5432, 5173, 8080, 9090 ou 3000.

### Le fil social ne charge pas

1. Verifier [http://localhost:8000/health](http://localhost:8000/health)
2. Verifier `VITE_API_URL` dans `frontend/.env`
3. Sur un autre appareil du reseau, ajouter l'IP dans `CORS_ORIGINS`

### Les uploads d'images ou videos echouent

- verifier `CLOUDINARY_CLOUD_NAME` et `CLOUDINARY_UPLOAD_PRESET`
- le preset doit etre en mode `unsigned`
- redemarrer l'API apres modification du `.env`

### Le scanner de repas ne fonctionne pas

```bash
curl http://localhost:8001/health
docker compose ps ai_service
```

### Les donnees persistent apres un reset serveur

L'authentification est stockee cote client. Vider le stockage navigateur ou reinitialiser l'application mobile.

## Documentation complementaire

- [Architecture](docs/architecture.md)
- [Deploiement](docs/deployment.md)
- [Monitoring](docs/monitoring.md)
- [Tests](docs/tests.md)
- [CI/CD](docs/ci-cd.md)
- [Sprint report](docs/sprint-report.md)
- [Guide mobile](docs/MOBILE.md)
- [Documentation API](docs/api.md)
