# Strategie de tests

## Objectif

La strategie de test actuelle vise a securiser les points les plus demonstrables pour la MSPR :

- la logique backend critique hors base
- le microservice IA et son mode degrade
- le lint frontend
- les verifications manuelles de la stack complete

## Tests backend

Jeu de tests present :

- `backend/src/tests/test_social.py`
- `backend/src/tests/test_fitness_ingest.py`

Commande cible :

```bash
PYTHONPATH=backend/src pytest backend/src/tests -q
```

Ces tests couvrent principalement :

- la construction de l'arbre de commentaires
- des helpers ETL et la gestion de colonnes manquantes

## Tests IA

Jeu de tests present :

- `ai-service/tests/test_api.py`
- `ai-service/tests/test_nutrition_engine.py`
- `ai-service/tests/test_workout_engine.py`

Commandes utiles :

```bash
docker compose exec -T ai_service pytest -q tests
```

ou en environnement Python local :

```bash
PYTHONPATH=ai-service/src pytest ai-service/tests -q
```

Ces tests couvrent :

- le healthcheck
- les endpoints nutrition, workout et vision
- le comportement quand MongoDB ou la journalisation sont indisponibles
- les moteurs de recommandation rule-based

## Verification frontend

Commande lint :

```bash
cd frontend
npm run lint
```

Cette etape securise la qualite minimale attendue dans la CI.

## Verifications manuelles

Apres `docker compose up --build` :

1. Verifier `http://localhost:8000/health`
2. Verifier `http://localhost:8001/health`
3. Verifier `http://localhost:9090/targets`
4. Verifier `http://localhost:3000`
5. Verifier `http://localhost:8080`
6. Ouvrir le frontend sur `http://localhost:5173`
7. Tester le fil social, le profil, une recommandation nutrition et une recommandation sport

## Limites actuelles

- pas encore de tests end-to-end complets frontend
- pas encore de tests de charge
- pas encore de rapport de couverture centralise
