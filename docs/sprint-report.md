# Sprint report

## Objectifs realises

- documentation technique du projet unifiee dans `README.md` et `docs/`
- clarification du deploiement local Docker Compose + frontend Vite
- formalisation du monitoring Prometheus, Grafana et cAdvisor
- ajout d'une CI GitHub Actions minimale
- correction du microservice IA pour supprimer les erreurs HTTP 500 sur les endpoints principaux

## Difficultes rencontrees

- documentation eparse et incomplete pour la soutenance
- absence de pipeline CI demonstrable
- erreurs 500 sur le microservice IA malgre la presence d'un mode degrade
- erreurs de lint frontend bloquantes pour une CI simple

## Solutions apportees

- creation des documents de reference manquants
- ajout d'un workflow GitHub Actions centre sur tests, lint et builds Docker
- remplacement du middleware de metriques IA par une implementation Prometheus simple et compatible
- ajout d'une insertion Mongo tolerante aux erreurs
- alignement des tests IA avec le comportement reel du moteur
- correction des erreurs de lint frontend necessaires a la CI

## Perspectives

- provisionner un dashboard Grafana versionne dans le depot
- ajouter des tests E2E frontend
- documenter des scripts de sauvegarde et restauration
- renforcer la documentation multi-environnement et hors ligne
- enrichir la couverture de tests backend metier
