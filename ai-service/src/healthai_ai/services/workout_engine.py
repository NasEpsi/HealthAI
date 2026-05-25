def generate_workout_plan(data: dict) -> dict:
    goal = data.get("goal", "general_health")
    level = data.get("level", "beginner")
    duration = data.get("duration", 30)
    limitations = data.get("limitations", [])

    if goal == "weight_loss":
        plan = [
            {"exercise": "Échauffement mobilité", "duration": 5},
            {"exercise": "Cardio modéré", "duration": 15},
            {"exercise": "Circuit training poids du corps", "duration": 15},
            {"exercise": "Étirements", "duration": 5},
        ]
        score = 0.85

    elif goal == "muscle_gain":
        plan = [
            {"exercise": "Squats", "sets": 4, "reps": 10},
            {"exercise": "Pompes ou développé", "sets": 4, "reps": 8},
            {"exercise": "Rowing ou tirage", "sets": 4, "reps": 10},
            {"exercise": "Gainage", "sets": 3, "duration": 45},
        ]
        score = 0.88

    elif goal == "endurance":
        plan = [
            {"exercise": "Échauffement", "duration": 5},
            {"exercise": "Course ou vélo en endurance fondamentale", "duration": duration - 10},
            {"exercise": "Retour au calme", "duration": 5},
        ]
        score = 0.82

    else:
        plan = [
            {"exercise": "Marche active", "duration": 30},
            {"exercise": "Mobilité articulaire", "duration": 10},
        ]
        score = 0.75

    if limitations:
        plan.insert(0, {
            "note": "Programme adapté avec prudence en raison des limitations déclarées.",
            "limitations": limitations,
        })
        score -= 0.05

    return {
        "level": level,
        "duration": duration,
        "plan": plan,
        "score": round(score, 2),
    }