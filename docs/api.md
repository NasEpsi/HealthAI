Template prêt à copier : DEPLOYMENT.md
# HealthAI — Déploiement local (moins de 30 minutes)

## Prérequis
- Docker + Docker Compose
- Node.js (pour le frontend)
- Power BI Desktop (Windows)

## 1. Configuration
Créer un fichier `.env` à la racine :

API_KEY=change_me
DATABASE_URL=postgresql+psycopg2://healthai:healthai_pass@db:5432/healthai
NUTRITION_CSV=/app/data/raw/daily_food_nutrition.csv
FITNESS_CSV=/app/data/raw/fitness_tracker.csv
EXPORT_DIR=/app/data/cleaned

POSTGRES_DB=healthai
POSTGRES_USER=healthai
POSTGRES_PASSWORD=healthai_pass
POSTGRES_PORT=5432

API_PORT=8000

## 2. Démarrage Backend + DB
```bash
docker compose up --build -d

API :

http://localhost:8000/health

http://localhost:8000/docs

3. Lancer ETL + exports

Placer les CSV dans data/raw/ puis :

docker compose exec api python -m healthai.etl.run_pipeline

Les exports sont disponibles dans data/cleaned/ et via :

GET http://localhost:8000/exports

POST http://localhost:8000/exports/run

4. Démarrage Admin React
cd frontend
npm install
npm run dev

UI :

http://localhost:5173

5. Power BI

Get data → PostgreSQL database

Server: localhost

Database: healthai

User: healthai / Password: healthai_pass

Importer les vues healthai.v_*