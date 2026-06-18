# Deploiement local

## Prerequis

- Docker Desktop installe et demarre
- Docker Compose v2 disponible via `docker compose`
- Node.js 20+ et npm pour le frontend
- Ports libres : `3000`, `5050`, `5432`, `8000`, `8001`, `8080`, `9090`

## Docker Compose

Le fichier `docker-compose.yml` demarre :

- `db`
- `api`
- `ai_service`
- `mongo`
- `pgadmin`
- `prometheus`
- `cadvisor`
- `grafana`

Le frontend reste volontairement hors Compose pour garder un cycle de developpement simple avec Vite.

## Commandes de lancement

1. Creer le fichier `.env` a partir du modele :

```powershell
Copy-Item .env.example .env
```

2. Lancer la stack :

```bash
docker compose up --build
```

3. Dans un second terminal, lancer le frontend :

```bash
cd frontend
npm ci
npm run dev
```

## Commandes d'arret

Arret standard :

```bash
docker compose down
```

Arret avec suppression des volumes locaux :

```bash
docker compose down -v
```

Utiliser cette seconde commande uniquement si vous acceptez de reinitialiser les donnees locales PostgreSQL, MongoDB et Grafana.

## Verifications post-deploiement

Verifier l'etat des conteneurs :

```bash
docker compose ps
```

Verifier les endpoints de sante :

```bash
curl http://localhost:8000/health
curl http://localhost:8001/health
```

Verifier le monitoring :

```bash
curl http://localhost:9090/targets
curl http://localhost:8080
curl http://localhost:3000
```

Verifier le frontend :

- ouvrir [http://localhost:5173](http://localhost:5173)
- se connecter
- verifier le fil social, le profil et les ecrans de recommandations

## En cas de probleme

- `docker compose logs -f api`
- `docker compose logs -f ai_service`
- `docker compose logs -f prometheus`
- `docker compose logs -f grafana`
