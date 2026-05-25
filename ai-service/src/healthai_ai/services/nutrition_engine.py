def generate_nutrition_recommendation(data):
    calories = data.get("calories", 0)
    goal = data.get("goal", "maintain")
    proteins = data.get("proteins", 0)

    result = {
        "summary": "",
        "actions": [],
        "score": 0.8
    }

    if goal == "weight_loss":
        if calories > 800:
            result["summary"] = "Apport calorique trop élevé pour une perte de poids."
            result["actions"].append("Réduire les portions")
            result["actions"].append("Augmenter les fibres")
            result["score"] = 0.6
        else:
            result["summary"] = "Bon équilibre pour perte de poids"
            result["score"] = 0.9

    elif goal == "muscle_gain":
        if proteins < 20:
            result["summary"] = "Apport protéique insuffisant"
            result["actions"].append("Ajouter source de protéines")
            result["score"] = 0.7
        else:
            result["summary"] = "Apport adapté pour prise de masse"
            result["score"] = 0.9

    else:
        result["summary"] = "Maintien d’un équilibre alimentaire"
        result["score"] = 0.8

    return result