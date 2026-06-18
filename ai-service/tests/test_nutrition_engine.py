from healthai_ai.services.nutrition_engine import generate_nutrition_recommendation


def test_nutrition_weight_loss_high_calories():
    data = {
        "user_id": 1,
        "goal": "weight_loss",
        "calories": 1200,
        "proteins": 15,
        "carbs": 90,
        "fats": 40,
    }

    result = generate_nutrition_recommendation(data)

    assert "perte de poids" in result["summary"].lower()
    assert len(result["actions"]) == 3
    assert len(result["meal_plan"]) == 3
    assert result["score"] == 0.75
