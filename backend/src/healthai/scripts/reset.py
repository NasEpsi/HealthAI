"""Réinitialisation manuelle : base PostgreSQL et stockage local / Cloudinary."""

from __future__ import annotations

import argparse
import os
import shutil
import sys
from pathlib import Path

from sqlalchemy import text

from healthai.db import Base, engine

# Enregistre toutes les tables dans Base.metadata
from healthai.models.aliment import Aliment  # noqa: F401
from healthai.models.meal_analysis import MealAnalysis  # noqa: F401
from healthai.models.nutrition_log import NutritionLog  # noqa: F401
from healthai.models.nutrition_recommendation import NutritionRecommendation  # noqa: F401
from healthai.models.qualite_run import QualiteDonneesRun  # noqa: F401
from healthai.models.recommendation_history import RecommendationHistory  # noqa: F401
from healthai.models.session_sport import SessionSport  # noqa: F401
from healthai.models.social import Comment, Post, PostLike, SocialUser  # noqa: F401
from healthai.models.user_profile import UserProfile  # noqa: F401
from healthai.models.utilisateur import Utilisateur  # noqa: F401
from healthai.models.workout_recommendation import WorkoutRecommendation  # noqa: F401
from healthai.services.cloudinary_service import (
    CLOUDINARY_API_KEY,
    CLOUDINARY_API_SECRET,
    init_cloudinary,
)


def reset_database() -> None:
    with engine.begin() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS healthai"))
        tables = list(Base.metadata.sorted_tables)
        if not tables:
            print("Aucune table à vider.")
            return
        names = ", ".join(f'"{table.name}"' for table in reversed(tables))
        conn.execute(text(f"TRUNCATE TABLE {names} RESTART IDENTITY CASCADE"))
    print(f"PostgreSQL : {len(tables)} table(s) vidée(s).")


def reset_local_exports() -> None:
    export_dir = Path(os.getenv("EXPORT_DIR", "/app/data/cleaned")).resolve()
    if not export_dir.exists():
        export_dir.mkdir(parents=True, exist_ok=True)
        print(f"Exports locaux : dossier créé ({export_dir}).")
        return

    removed = 0
    for item in export_dir.iterdir():
        if item.is_dir():
            shutil.rmtree(item)
        else:
            item.unlink()
        removed += 1
    print(f"Exports locaux : {removed} élément(s) supprimé(s) dans {export_dir}.")


def reset_cloudinary() -> None:
    if not CLOUDINARY_API_KEY or not CLOUDINARY_API_SECRET:
        print(
            "Cloudinary : CLOUDINARY_API_KEY et CLOUDINARY_API_SECRET requis "
            "pour purger le stockage distant — étape ignorée."
        )
        return

    import cloudinary.api

    init_cloudinary()
    prefix = "healthai/"
    for resource_type in ("image", "video"):
        try:
            result = cloudinary.api.delete_resources_by_prefix(
                prefix,
                resource_type=resource_type,
                invalidate=True,
            )
            deleted = result.get("deleted", {})
            print(f"Cloudinary ({resource_type}) : {len(deleted)} ressource(s) supprimée(s).")
        except Exception as exc:
            print(f"Cloudinary ({resource_type}) : erreur — {exc}")


def reset_storage(*, skip_cloudinary: bool = False) -> None:
    reset_local_exports()
    if skip_cloudinary:
        print("Cloudinary : ignoré (--skip-cloudinary).")
    else:
        reset_cloudinary()


def seed_database() -> None:
    from healthai.etl.run_pipeline import main as run_pipeline

    print("Réimport des données ETL…")
    run_pipeline()
    print("ETL terminé.")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Réinitialise la base PostgreSQL et/ou le stockage HealthAI."
    )
    parser.add_argument("--db", action="store_true", help="Vider toutes les tables PostgreSQL.")
    parser.add_argument(
        "--storage",
        action="store_true",
        help="Supprimer les exports locaux et purger Cloudinary (si configuré).",
    )
    parser.add_argument("--all", action="store_true", help="Équivalent à --db --storage.")
    parser.add_argument(
        "--seed",
        action="store_true",
        help="Relancer l'ETL après la réinitialisation de la base.",
    )
    parser.add_argument(
        "--skip-cloudinary",
        action="store_true",
        help="Ne pas purger Cloudinary (exports locaux uniquement).",
    )
    parser.add_argument(
        "--confirm",
        action="store_true",
        help="Confirme l'exécution (obligatoire).",
    )
    return parser.parse_args(argv)


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)

    if not args.confirm:
        print("Erreur : ajoutez --confirm pour exécuter ce script.", file=sys.stderr)
        return 1

    do_db = args.db or args.all
    do_storage = args.storage or args.all

    if not do_db and not do_storage and not args.seed:
        print("Erreur : précisez --db, --storage, --all et/ou --seed.", file=sys.stderr)
        return 1

    if do_db:
        reset_database()
    if do_storage:
        reset_storage(skip_cloudinary=args.skip_cloudinary)
    if args.seed:
        if not do_db:
            print("Attention : --seed sans --db réimporte dans des données existantes.")
        seed_database()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
