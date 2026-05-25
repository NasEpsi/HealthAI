def generate_workout_plan(data):
    goal = data.get("goal")
    level = data.get("level", "beginner")
    duration = data.get("duration", 30)

    base_plan = []

    if goal == "weight_loss":
        base_plan = [
            {"exercise": "Cardio", "duration": 20},
            {"exercise": "Circuit training", "duration": 15},
        ]

    elif goal == "muscle_gain":
        base_plan = [
            {"exercise": "Squats", "sets": 4, "reps": 10},
            {"exercise": "Bench press", "sets": 4, "reps": 8},
        ]

    else:
        base_plan = [
            {"exercise": "Marche", "duration": 30}
        ]

    return {
        "level": level,
        "duration": duration,
        "plan": base_plan,
        "score": 0.85
    }