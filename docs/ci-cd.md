# CI/CD minimale

## Fichier pipeline

Le pipeline GitHub Actions est defini dans :

- `.github/workflows/ci.yml`

## Fonctionnement du pipeline

Declencheurs :

- `push`
- `pull_request`

Objectif :

- verifier rapidement que le projet reste buildable et demonstrable
- detecter une regression sur le backend, le microservice IA, le frontend ou Docker Compose

## Etapes executees

1. checkout du depot
2. setup Python 3.12
3. installation des dependances Python utiles aux tests backend et IA
4. execution des tests backend
5. execution des tests IA
6. setup Node.js 20
7. installation frontend via `npm ci`
8. execution du lint frontend
9. verification `docker compose config`
10. build de l'image Docker backend
11. build de l'image Docker du microservice IA

## Utilisation

Le pipeline se lance automatiquement a chaque commit pousse sur GitHub ou a chaque pull request.

Pour reproduire les principales etapes en local :

```bash
cd frontend && npm ci && npm run lint
PYTHONPATH=backend/src pytest backend/src/tests -q
PYTHONPATH=ai-service/src pytest ai-service/tests -q
docker compose config
docker build -t healthai-backend ./backend
docker build -t healthai-ai ./ai-service
```

## Limites volontaires

- aucun deploiement cloud
- aucune publication d'image
- aucune strategie multi-environnement avancee

Le pipeline reste volontairement minimal pour la MSPR, mais il couvre deja les verifications les plus visibles en soutenance.
