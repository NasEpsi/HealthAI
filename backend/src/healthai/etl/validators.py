from __future__ import annotations
from dataclasses import dataclass

@dataclass(frozen=True)
class ValidationResult:
    ok: bool
    missing_columns: list[str]

def validate_columns(actual_cols: list[str], required_cols: list[str]) -> ValidationResult:
    actual = {c.strip() for c in actual_cols}
    missing = [c for c in required_cols if c not in actual]
    return ValidationResult(ok=(len(missing) == 0), missing_columns=missing)