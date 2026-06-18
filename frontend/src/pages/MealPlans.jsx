import { useState } from "react";
import { Sparkles, Utensils } from "lucide-react";
import { useApp } from "../context/AppContext";
import { generateNutritionPlan } from "../api";
import UpgradePrompt from "../components/UpgradePrompt";

export default function MealPlans() {
  const { currentUser, profile, hasFeature, showToast } = useApp();
  const canUseAi = hasFeature("detailed_meal_plans");

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!canUseAi) {
      showToast("Cette fonctionnalité nécessite l'abonnement Premium.");
      return;
    }
    try {
      setLoading(true);
      setError("");

      const userId = currentUser?.id_user;

      if (!userId) {
        setError("Utilisateur non connecté.");
        return;
      }

      const payload = {
        user_id: userId,
        goal:
          profile?.goal === "Prise de masse"
            ? "muscle_gain"
            : profile?.goal === "Perte de poids"
            ? "weight_loss"
            : "maintain",
        calories: profile?.targetCalories || 2200,
        proteins: 80,
        carbs: 220,
        fats: 70,
        detected_foods: [],
      };

      const result = await generateNutritionPlan(payload);
      setRecommendation(result.ai_result || result);
    } catch (err) {
      console.error(err);
      setError("Impossible de générer le plan alimentaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Plan alimentaire</h1>
          <p className="page-header__subtitle">
            Généré automatiquement selon votre profil
          </p>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          onClick={handleGenerate}
          disabled={loading || !canUseAi}
        >
          <Sparkles size={18} />
          {loading ? "Génération..." : "Générer un plan"}
        </button>
      </header>

      {!canUseAi && (
        <UpgradePrompt
          title="Plans nutritionnels IA — Premium"
          message="Passez à Premium (9,99 €/mois) pour générer des plans alimentaires personnalisés par intelligence artificielle."
        />
      )}

      {error && (
        <div className="card" style={{ color: "crimson", marginBottom: 16 }}>
          {error}
        </div>
      )}

      {!recommendation ? (
        <div className="card card--empty" style={{ flexDirection: "column" }}>
          <Utensils className="empty-state-icon" size={48} />
          Aucun plan alimentaire généré.
        </div>
      ) : (
        <div className="card">
          <h2 className="title-font">Recommandation nutritionnelle</h2>

          <p style={{ marginTop: 16, marginBottom: 16, lineHeight: 1.6 }}>
            {recommendation.summary}
          </p>

          <p>
            <strong>Score IA :</strong> {recommendation.score}
          </p>

          <h3 style={{ marginTop: 24, marginBottom: 12 }}>Conseils :</h3>

          <ul style={{ paddingLeft: 20 }}>
            {(recommendation.actions || []).map((action, idx) => (
              <li key={idx} style={{ marginBottom: 8 }}>
                {action}
              </li>
            ))}
          </ul>

          <h3 style={{ marginTop: 24, marginBottom: 12 }}>
            Plan de repas proposé :
          </h3>

          <div className="sessions-grid">
            {(recommendation.meal_plan || []).map((meal, idx) => (
              <div key={idx} className="card">
                <h3>{meal.meal}</h3>

                <ul style={{ paddingLeft: 20, marginTop: 12 }}>
                  {(meal.items || []).map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <p style={{ marginTop: 12 }}>
                  Environ {meal.calories} kcal
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}