import unittest
from unittest.mock import Mock, patch
import sys
sys.modules["healthai.db"] = Mock()
sys.modules["healthai.models.session_sport"] = Mock()
sys.modules["healthai.models.utilisateur"] = Mock()
import pandas as pd
from healthai.etl.fitness_ingest import (
    _to_num,
    _clean_str,
    _mean_or_none,
    _mode_or_none,
    run_fitness_ingest,
)

class DummyValidationResult:
    """Petit objet pour simuler le retour de validate_columns."""
    def __init__(self, ok, missing_columns=None):
        self.ok = ok
        self.missing_columns = missing_columns or []


class TestFitnessHelpers(unittest.TestCase):
    def test_to_num_converts_invalid_values_to_nan(self):
        series = pd.Series(["10", "abc", 5])
        result = _to_num(series)
        
        self.assertEqual(result.iloc[0], 10)
        self.assertTrue(pd.isna(result.iloc[1]))
        self.assertEqual(result.iloc[2], 5)

    def test_clean_str_normalizes_empty_and_null_like_values(self):
        series = pd.Series(["  beginner  ", "", "nan", "None", "NULL", "advanced"])
        result = _clean_str(series)

        self.assertEqual(result.iloc[0], "beginner")
        self.assertTrue(pd.isna(result.iloc[1]))
        self.assertTrue(pd.isna(result.iloc[2]))
        self.assertTrue(pd.isna(result.iloc[3]))
        self.assertTrue(pd.isna(result.iloc[4]))
        self.assertEqual(result.iloc[5], "advanced")

    def test_mean_or_none_returns_float_when_values_exist(self):
        df = pd.DataFrame({"Avg_BPM": [100, 120, 140]})
        result = _mean_or_none(df, "Avg_BPM")

        self.assertEqual(result, 120.0)

    def test_mean_or_none_returns_none_when_only_nan(self):
        df = pd.DataFrame({"Avg_BPM": [pd.NA, pd.NA]})
        df["Avg_BPM"] = pd.to_numeric(df["Avg_BPM"], errors="coerce")

        result = _mean_or_none(df, "Avg_BPM")

        self.assertIsNone(result)

    def test_mode_or_none_returns_most_frequent_value(self):
        df = pd.DataFrame({"Workout_Type": ["Cardio", "Cardio", "Yoga", None]})
        result = _mode_or_none(df, "Workout_Type")

        self.assertEqual(result, "Cardio")

    def test_mode_or_none_returns_none_if_column_missing(self):
        df = pd.DataFrame({"Other": [1, 2, 3]})
        result = _mode_or_none(df, "Workout_Type")

        self.assertIsNone(result)


class TestRunFitnessIngest(unittest.TestCase):
    @patch("healthai.etl.fitness_ingest.finish_run")
    @patch("healthai.etl.fitness_ingest.start_run")
    @patch("healthai.etl.fitness_ingest.validate_columns")
    @patch("healthai.etl.fitness_ingest.pd.read_csv")
    @patch("healthai.etl.fitness_ingest.SessionLocal")
    def test_run_fitness_ingest_fails_when_columns_are_missing(
        self,
        mock_session_local,
        mock_read_csv,
        mock_validate_columns,
        mock_start_run,
        mock_finish_run,
    ):
        # Mock de la session DB
        mock_db = Mock()
        mock_session_local.return_value = mock_db

        # Mock du run qualité
        mock_run = Mock()
        mock_start_run.return_value = mock_run

        # DataFrame volontairement incomplet
        mock_read_csv.return_value = pd.DataFrame({
            "Age": [25],
            "Gender": ["Male"],
        })

        # Validation KO
        mock_validate_columns.return_value = DummyValidationResult(
            ok=False,
            missing_columns=["Weight (kg)", "Height (m)"]
        )

        with self.assertRaises(ValueError):
            run_fitness_ingest()

        mock_db.rollback.assert_called_once()
        mock_finish_run.assert_called_once()

        # Vérifie que le status FAILED a bien été envoyé
        _, kwargs = mock_finish_run.call_args
        self.assertEqual(kwargs["status"], "FAILED")
        self.assertIn("Missing columns", kwargs["error_message"])

        mock_db.close.assert_called_once()


if __name__ == "__main__":
    unittest.main()