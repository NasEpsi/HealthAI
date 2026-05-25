# Architecture HealthAI Coach V2

Le projet HealthAI Coach V2 s’inscrit dans la continuité du projet précédent. La première version avait permis de mettre en place un backend FastAPI, une base PostgreSQL, un pipeline ETL, une interface React et des exports analytiques.

La V2 ajoute une couche d’intelligence artificielle dédiée aux recommandations nutritionnelles et sportives.

## Composants

- Frontend React : interface utilisateur
- Backend FastAPI principal : API métier et orchestration
- PostgreSQL : stockage relationnel
- Micro-service IA FastAPI : recommandations nutrition/sport
- MongoDB : stockage NoSQL des recommandations générées
- ETL : ingestion et contrôle qualité des données

## Flux général

Frontend → Backend principal → Micro-service IA → MongoDB  
Backend principal → PostgreSQL

## Justification

Cette architecture sépare la logique métier de la logique IA. Le moteur de recommandation peut évoluer indépendamment du backend principal.