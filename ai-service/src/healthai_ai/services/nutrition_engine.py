def generate_nutrition_recommendation(data: dict) -> dict:
    calories = data.get("calories", 0)
    proteins = data.get("proteins", 0)
    goal = data.get("goal", "maintain")

    result = {
        "summary": "Recommandation nutritionnelle générée.",
        "actions": [],
        "score": 0.8,
    }

    if goal == "weight_loss":
        if calories > 800:
            result["summary"] = "Le repas semble assez calorique pour un objectif de perte de poids."
            result["actions"] = [
                "Réduire légèrement les portions.",
                "Ajouter davantage de légumes.",
                "Limiter les aliments très gras ou sucrés.",
            ]
            result["score"] = 0.65
        else:
            result["summary"] = "Le repas semble cohérent avec un objectif de perte de poids."
            result["actions"] = [
                "Maintenir un bon apport en protéines.",
                "Veiller à conserver suffisamment de fibres.",
            ]
            result["score"] = 0.9

    elif goal == "muscle_gain":
        if proteins < 20:
            result["summary"] = "L’apport protéique semble faible pour une prise de masse."
            result["actions"] = [
                "Ajouter une source de protéines.",
                "Prévoir une collation post-entraînement.",
            ]
            result["score"] = 0.7
        else:
            result["summary"] = "Le repas semble adapté à un objectif de prise de masse."
            result["actions"] = [
                "Conserver un apport régulier en protéines.",
                "Associer glucides complexes et récupération.",
            ]
            result["score"] = 0.9

    else:
        result["summary"] = "Le repas semble adapté à un objectif de maintien."
        result["actions"] = [
            "Conserver un équilibre entre protéines, glucides et lipides.",
        ]
        result["score"] = 0.8

    return result