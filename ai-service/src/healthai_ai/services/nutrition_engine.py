def generate_nutrition_recommendation(data: dict) -> dict:
    calories = data.get("calories", 2200)
    proteins = data.get("proteins", 0)
    goal = data.get("goal", "maintain")

    result = {
        "summary": "Recommandation nutritionnelle générée.",
        "actions": [],
        "score": 0.8,
        "meal_plan": []
    }

    if goal == "weight_loss":
        result["summary"] = "Plan adapté à un objectif de perte de poids."
        result["actions"] = [
            "Réduire légèrement les portions.",
            "Ajouter davantage de légumes.",
            "Limiter les aliments très gras ou sucrés."
        ]
        result["score"] = 0.75
        result["meal_plan"] = [
            {
                "meal": "Petit-déjeuner",
                "items": ["Fromage blanc", "Flocons d’avoine", "Fruit frais"],
                "calories": 400
            },
            {
                "meal": "Déjeuner",
                "items": ["Poulet grillé", "Riz complet", "Brocoli"],
                "calories": 650
            },
            {
                "meal": "Dîner",
                "items": ["Poisson", "Légumes vapeur", "Patate douce"],
                "calories": 550
            }
        ]

    elif goal == "muscle_gain":
        result["summary"] = "Plan adapté à un objectif de prise de masse."
        result["actions"] = [
            "Augmenter l’apport protéique.",
            "Ajouter des glucides complexes.",
            "Prévoir une collation post-entraînement."
        ]
        result["score"] = 0.85
        result["meal_plan"] = [
            {
                "meal": "Petit-déjeuner",
                "items": ["Œufs", "Pain complet", "Banane"],
                "calories": 600
            },
            {
                "meal": "Déjeuner",
                "items": ["Riz", "Poulet", "Avocat", "Légumes"],
                "calories": 850
            },
            {
                "meal": "Collation",
                "items": ["Yaourt grec", "Amandes", "Fruit"],
                "calories": 350
            },
            {
                "meal": "Dîner",
                "items": ["Pâtes complètes", "Saumon", "Légumes"],
                "calories": 750
            }
        ]

    else:
        result["summary"] = "Plan équilibré pour un objectif de maintien."
        result["actions"] = [
            "Maintenir un bon équilibre entre protéines, glucides et lipides.",
            "Varier les sources alimentaires."
        ]
        result["score"] = 0.8
        result["meal_plan"] = [
            {
                "meal": "Petit-déjeuner",
                "items": ["Pain complet", "Œuf", "Fruit"],
                "calories": 450
            },
            {
                "meal": "Déjeuner",
                "items": ["Riz", "Poulet", "Légumes"],
                "calories": 700
            },
            {
                "meal": "Dîner",
                "items": ["Soupe", "Poisson", "Légumes"],
                "calories": 550
            }
        ]

    return result