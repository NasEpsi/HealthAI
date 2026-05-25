from pathlib import Path


FOOD_DATABASE = {
    "chicken": {"label": "poulet", "calories": 165, "proteins": 31, "carbs": 0, "fats": 3.6},
    "rice": {"label": "riz", "calories": 130, "proteins": 2.7, "carbs": 28, "fats": 0.3},
    "broccoli": {"label": "brocoli", "calories": 55, "proteins": 3.7, "carbs": 11, "fats": 0.6},
    "salad": {"label": "salade", "calories": 20, "proteins": 1.4, "carbs": 3, "fats": 0.2},
    "burger": {"label": "burger", "calories": 550, "proteins": 25, "carbs": 45, "fats": 30},
    "fries": {"label": "frites", "calories": 312, "proteins": 3.4, "carbs": 41, "fats": 15},
    "pasta": {"label": "pâtes", "calories": 158, "proteins": 5.8, "carbs": 31, "fats": 0.9},
    "egg": {"label": "œuf", "calories": 155, "proteins": 13, "carbs": 1.1, "fats": 11},
    "fish": {"label": "poisson", "calories": 206, "proteins": 22, "carbs": 0, "fats": 12},
    "apple": {"label": "pomme", "calories": 52, "proteins": 0.3, "carbs": 14, "fats": 0.2},
}


def detect_foods_from_image(filename: str) -> list[dict]:
    """
    MVP MSPR :
    Détection simulée basée sur le nom du fichier.
    L'architecture reste compatible avec une future API réelle
    type Google Vision, Hugging Face ou autre.
    """

    normalized_name = Path(filename).name.lower()

    detected = []

    for keyword, nutrition in FOOD_DATABASE.items():
        if keyword in normalized_name:
            detected.append({
                "code": keyword,
                **nutrition,
                "quantity_g": 100
            })

    if not detected:
        detected = [
            {
                "code": "default_meal",
                "label": "repas non identifié",
                "calories": 600,
                "proteins": 25,
                "carbs": 70,
                "fats": 20,
                "quantity_g": 100
            }
        ]

    return detected


def calculate_totals(detected_foods: list[dict]) -> dict:
    total_calories = sum(food["calories"] for food in detected_foods)
    total_proteins = sum(food["proteins"] for food in detected_foods)
    total_carbs = sum(food["carbs"] for food in detected_foods)
    total_fats = sum(food["fats"] for food in detected_foods)

    return {
        "calories": round(total_calories, 2),
        "proteins": round(total_proteins, 2),
        "carbs": round(total_carbs, 2),
        "fats": round(total_fats, 2),
    }