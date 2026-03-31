"""Tests unitaires pour le module fitness_ingest."""

import sys
import unittest
from unittest.mock import MagicMock, patch

# Mock des dépendances externes AVANT import du module testé.
sys.modules["healthai.db"] = MagicMock()
sys.modules["healthai.models.session_sport"] = MagicMock()
sys.modules["healthai.models.utilisateur"] = MagicMock()

import pandas as pd  # pylint: disable=wrong-import-position

from healthai.etl.fitness_ingest import (  # pylint: disable=wrong-import-position
    _clean_str,
    _mean_or_none,
    _mode_or_none,
    _to_num,
    run_fitness_ingest,
)


class DummyValidationResult:
    """Objet minimal pour simuler le retour de validate_columns."""

    def __init__(self, ok, missing_columns=None):
        self.ok = ok
        self.missing_columns = missing_columns or []


class TestFitnessHelpers(unittest.TestCase):
    """Tests unitaires des fonctions utilitaires."""

    def test_to_num_converts_invalid_values_to_nan(self):
        """_to_num doit convertir les valeurs invalides en NaN."""
        series = pd.Series(["10", "abc", 5])
        result = _to_num(series)

        self.assertEqual(result.iloc[0], 10)
        self.assertTrue(pd.isna(result.iloc[1]))
        self.assertEqual(result.iloc[2], 5)

    def test_clean_str_normalizes_empty_and_null_like_values(self):
        """_clean_str doit nettoyer les chaînes et normaliser les valeurs vides."""
        series = pd.Series(["  beginner  ", "", "nan", "None", "NULL", "advanced"])
        result = _clean_str(series)

        self.assertEqual(result.iloc[0], "beginner")
        self.assertTrue(pd.isna(result.iloc[1]))
        self.assertTrue(pd.isna(result.iloc[2]))
        self.assertTrue(pd.isna(result.iloc[3]))
        self.assertTrue(pd.isna(result.iloc[4]))
        self.assertEqual(result.iloc[5], "advanced")

    def test_mean_or_none_returns_float_when_values_exist(self):
        """_mean_or_none doit renvoyer une moyenne quand des valeurs existent."""
        df = pd.DataFrame({"Avg_BPM": [100, 120, 140]})
        result = _mean_or_none(df, "Avg_BPM")
        self.assertEqual(result, 120.0)

    def test_mean_or_none_returns_none_when_only_nan(self):
        """_mean_or_none doit renvoyer None quand la colonne est vide."""
        df = pd.DataFrame({"Avg_BPM": [pd.NA, pd.NA]})
        df["Avg_BPM"] = pd.to_numeric(df["Avg_BPM"], errors="coerce")

        result = _mean_or_none(df, "Avg_BPM")
        self.assertIsNone(result)

    def test_mode_or_none_returns_most_frequent_value(self):
        """_mode_or_none doit renvoyer la valeur la plus fréquente."""
        df = pd.DataFrame({"Workout_Type": ["Cardio", "Cardio", "Yoga", None]})
        result = _mode_or_none(df, "Workout_Type")
        self.assertEqual(result, "Cardio")

    def test_mode_or_none_returns_none_if_column_missing(self):
        """_mode_or_none doit renvoyer None si la colonne est absente."""
        df = pd.DataFrame({"Other": [1, 2, 3]})
        result = _mode_or_none(df, "Workout_Type")
        self.assertIsNone(result)


class TestRunFitnessIngest(unittest.TestCase):
    """Tests unitaires de la fonction principale run_fitness_ingest."""

    @patch("healthai.etl.fitness_ingest.finish_run")
    @patch("healthai.etl.fitness_ingest.start_run")
    @patch("healthai.etl.fitness_ingest.validate_columns")
    @patch("healthai.etl.fitness_ingest.pd.read_csv")
    @patch("healthai.etl.fitness_ingest.SessionLocal")
    # pylint: disable=too-many-arguments
    def test_run_fitness_ingest_fails_when_columns_are_missing(
        self,
        mock_session_local,
        mock_read_csv,
        mock_validate_columns,
        mock_start_run,
        mock_finish_run,
    ):
        """La fonction doit échouer proprement si des colonnes sont absentes."""
        mock_db = MagicMock()
        mock_session_local.return_value = mock_db

        mock_run = MagicMock()
        mock_start_run.return_value = mock_run

        mock_read_csv.return_value = pd.DataFrame(
            {
                "Age": [25],
                "Gender": ["Male"],
            }
        )

        mock_validate_columns.return_value = DummyValidationResult(
            ok=False,
            missing_columns=["Weight (kg)", "Height (m)"],
        )

        with self.assertRaises(ValueError):
            run_fitness_ingest()

        mock_db.rollback.assert_called_once()
        mock_finish_run.assert_called_once()

        _, kwargs = mock_finish_run.call_args
        self.assertEqual(kwargs["status"], "FAILED")
        self.assertIn("Missing columns", kwargs["error_message"])
        mock_db.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()