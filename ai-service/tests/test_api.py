from io import BytesIO
from unittest.mock import patch

from fastapi.testclient import TestClient
from healthai_ai.main import app


client = TestClient(app)


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ai ok"}


@patch("healthai_ai.routers.nutrition.safe_insert_one", return_value=False)
def test_nutrition_recommendation_returns_200_when_mongo_is_unavailable(_safe_insert):
    response = client.post(
        "/ai/nutrition/recommend",
        json={"user_id": 1, "goal": "weight_loss", "calories": 1200},
    )

    assert response.status_code == 200
    assert "summary" in response.json()


@patch("healthai_ai.routers.workout.safe_insert_one", return_value=False)
def test_workout_recommendation_returns_200_when_mongo_is_unavailable(_safe_insert):
    response = client.post(
        "/ai/workout/recommend",
        json={"user_id": 1, "goal": "muscle_gain", "level": "beginner", "duration": 45},
    )

    assert response.status_code == 200
    assert "plan" in response.json()


@patch("healthai_ai.routers.vision.safe_insert_one", return_value=False)
def test_vision_analysis_returns_200_when_mongo_is_unavailable(_safe_insert):
    response = client.post(
        "/ai/vision/meal/analyze",
        files={"file": ("chicken_rice.jpg", BytesIO(b"fake-image"), "image/jpeg")},
        data={"user_id": "1", "goal": "maintain"},
    )

    assert response.status_code == 200
    assert response.json()["filename"] == "chicken_rice.jpg"
