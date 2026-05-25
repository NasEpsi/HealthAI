from healthai_ai.services.workout_engine import generate_workout_plan


def test_workout_muscle_gain():
    data = {
        "user_id": 1,
        "goal": "muscle_gain",
        "level": "beginner",
        "duration": 45,
        "equipment": ["haltères"],
        "limitations": [],
    }

    result = generate_workout_plan(data)

    assert result["level"] == "beginner"
    assert result["duration"] == 45
    assert "plan" in result
    assert len(result["plan"]) > 0
    assert result["score"] > 0