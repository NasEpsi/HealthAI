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

    assert "summary" in result
    assert "actions" in result
    assert "score" in result
    assert result["score"] <= 0.7