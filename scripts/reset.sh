#!/usr/bin/env bash
# Réinitialisation manuelle HealthAI — base de données, MongoDB et stockage.
# Usage : ./scripts/reset.sh [--confirm] [--full-volumes] [--seed] [--skip-cloudinary]

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIRM=false
FULL_VOLUMES=false
SEED=false
SKIP_CLOUDINARY=false

for arg in "$@"; do
  case "$arg" in
    --confirm) CONFIRM=true ;;
    --full-volumes) FULL_VOLUMES=true ;;
    --seed) SEED=true ;;
    --skip-cloudinary) SKIP_CLOUDINARY=true ;;
    -h|--help)
      echo "Usage: $0 [--confirm] [--full-volumes] [--seed] [--skip-cloudinary]"
      exit 0
      ;;
    *)
      echo "Option inconnue : $arg" >&2
      exit 1
      ;;
  esac
done

step() { echo ""; echo "==> $1"; }

if [ "$CONFIRM" != true ]; then
  echo ""
  echo "ATTENTION — Cette opération va :"
  echo "  - Vider toutes les tables PostgreSQL (schéma healthai)"
  echo "  - Supprimer la base MongoDB healthai_ai"
  echo "  - Effacer les exports locaux (data/cleaned/)"
  if [ "$SKIP_CLOUDINARY" != true ]; then
    echo "  - Purger les médias Cloudinary (dossier healthai/) si configuré"
  fi
  if [ "$FULL_VOLUMES" = true ]; then
    echo "  - Supprimer les volumes Docker (réinitialisation complète)"
  fi
  echo ""
  read -r -p "Tapez RESET pour confirmer : " answer
  if [ "$answer" != "RESET" ]; then
    echo "Annulé."
    exit 0
  fi
fi

step "Vérification de Docker Compose"
docker compose version >/dev/null

if [ "$FULL_VOLUMES" = true ]; then
  step "Arrêt et suppression des volumes Docker"
  docker compose down -v
  step "Redémarrage des services"
  docker compose up -d --build
  echo "Attente du démarrage (15 s)…"
  sleep 15
  step "Création du schéma PostgreSQL"
  docker compose exec -T db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;"
else
  step "Démarrage des services nécessaires (db, mongo, api)"
  docker compose up -d db mongo api
  echo "Attente du démarrage (8 s)…"
  sleep 8
  docker compose exec -T db psql -U healthai -d healthai -c "CREATE SCHEMA IF NOT EXISTS healthai;" 2>/dev/null || true
fi

step "Réinitialisation PostgreSQL"
docker compose exec -T api python -m healthai.scripts.reset --db --confirm

step "Réinitialisation MongoDB"
docker compose exec -T mongo mongosh --quiet --eval "db.getSiblingDB('healthai_ai').dropDatabase()"

step "Réinitialisation du stockage (exports + Cloudinary)"
STORAGE_ARGS=(python -m healthai.scripts.reset --storage --confirm)
if [ "$SKIP_CLOUDINARY" = true ]; then
  STORAGE_ARGS+=(--skip-cloudinary)
fi
docker compose exec -T api "${STORAGE_ARGS[@]}"

if [ -d "data/cleaned" ]; then
  step "Nettoyage des exports sur l'hôte (data/cleaned/)"
  rm -rf data/cleaned/*
fi

if [ "$SEED" = true ]; then
  step "Réimport des données ETL"
  docker compose exec -T api python -m healthai.etl.run_pipeline
fi

echo ""
echo "Réinitialisation terminée."
echo "Note : les comptes locaux (localStorage / app mobile) ne sont pas effacés."
