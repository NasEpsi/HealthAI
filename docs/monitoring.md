# Monitoring et observabilite

## Vue d'ensemble

Le projet dispose d'un monitoring local base sur trois briques :

- Prometheus pour la collecte
- Grafana pour la visualisation
- cAdvisor pour les metriques conteneurs

## Prometheus

Le fichier de configuration est `monitoring/prometheus.yml`.

Jobs actifs :

- `healthai-api` vers `api:8000/metrics`
- `healthai-ai-service` vers `ai_service:8000/metrics`
- `cadvisor` vers `cadvisor:8080`

Prometheus permet de verifier rapidement la sante du scraping via :

- [http://localhost:9090/targets](http://localhost:9090/targets)

## Grafana

Grafana est expose sur :

- [http://localhost:3000](http://localhost:3000)

Usage attendu en demo :

- connecter Prometheus comme datasource
- afficher les metriques API
- afficher les metriques du microservice IA
- afficher les metriques systeme et conteneurs venant de cAdvisor

En premiere connexion, Grafana utilise generalement `admin` / `admin` si aucun mot de passe n'a ete change.

## cAdvisor

cAdvisor est expose sur :

- [http://localhost:8080](http://localhost:8080)

Il fournit notamment :

- CPU des conteneurs
- memoire des conteneurs
- reseau
- systeme de fichiers
- informations runtime Docker

## Metriques exposees

Backend principal :

- compteur de requetes via `/metrics`

Microservice IA :

- compteur `healthai_ai_requests_total`
- metriques standard Python process et GC via `/metrics`

Conteneurs Docker :

- metriques CPU, RAM, I/O et reseau via cAdvisor

## Dashboards

Le depot ne provisionne pas encore automatiquement de dashboard Grafana JSON.

En pratique pour la soutenance, le dashboard local peut presenter au minimum :

- nombre de requetes backend
- nombre de requetes microservice IA
- temps reel CPU/memoire des conteneurs `api`, `ai_service`, `db`
- etat des targets Prometheus

## URLs utiles

- Prometheus : [http://localhost:9090](http://localhost:9090)
- Prometheus targets : [http://localhost:9090/targets](http://localhost:9090/targets)
- Grafana : [http://localhost:3000](http://localhost:3000)
- cAdvisor : [http://localhost:8080](http://localhost:8080)
- Metrics backend : [http://localhost:8000/metrics](http://localhost:8000/metrics)
- Metrics IA : [http://localhost:8001/metrics](http://localhost:8001/metrics)
