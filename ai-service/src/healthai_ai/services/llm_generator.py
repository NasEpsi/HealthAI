def generate_meal_advice(goal: str, detected_foods: list[dict], totals: dict) -> str:
    food_names = ", ".join(food["label"] for food in detected_foods)

    if goal == "weight_loss":
        return (
            f"Le repas contient : {food_names}. "
            f"Il représente environ {totals['calories']} kcal. "
            "Pour un objectif de perte de poids, il est conseillé de contrôler les portions, "
            "d'augmenter la part de légumes et de limiter les aliments trop gras."
        )

    if goal == "muscle_gain":
        return (
            f"Le repas contient : {food_names}. "
            f"Il apporte environ {totals['proteins']} g de protéines. "
            "Pour une prise de masse, il est recommandé de maintenir un bon apport protéique "
            "et d'ajouter une source de glucides complexes si besoin."
        )

    return (
        f"Le repas contient : {food_names}. "
        "Il semble globalement adapté à un objectif de maintien, à condition de conserver "
        "un bon équilibre entre protéines, glucides et lipides."
    )