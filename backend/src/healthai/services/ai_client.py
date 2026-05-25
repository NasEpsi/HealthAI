import requests

AI_URL = "http://ai_service:8000"


def safe_post(url, payload):
    try:
        response = requests.post(url, json=payload, timeout=3)
        response.raise_for_status()
        return response.json()
    except Exception:
        return None


def get_nutrition_recommendation(data):
    result = safe_post(f"{AI_URL}/ai/nutrition/recommend", data)

    if result is None:
        return {
            "summary": "Service IA indisponible",
            "actions": [],
            "score": 0
        }

    return result


def get_workout_recommendation(data):
    result = safe_post(f"{AI_URL}/ai/workout/recommend", data)

    if result is None:
        return {
            "plan": [],
            "score": 0
        }

    return result