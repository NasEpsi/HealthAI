import { useState } from "react";
import { Sparkles, Dumbbell } from "lucide-react";

import { useApp } from "../context/AppContext";
import { generateWorkoutPlan } from "../api";
import UpgradePrompt from "../components/UpgradePrompt";

export default function Sport() {
  const { currentUser, profile, hasFeature, showToast } = useApp();
  const canUseAi = hasFeature("detailed_sport_plans");

  const [loading, setLoading] = useState(false);
  const [program, setProgram] = useState(null);
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
            : "general_health",

        level:
          profile?.sportLevel?.toLowerCase() ||
          "beginner",

        duration: 45,

        equipment: [],

        limitations: profile?.injuries
          ? [profile.injuries]
          : [],
      };

      const result = await generateWorkoutPlan(payload);

      setProgram(result.ai_result || result);
    } catch (err) {
      console.error(err);
      setError("Impossible de générer le programme.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">
            Mon programme sport
          </h1>

          <p className="page-header__subtitle">
            Généré par notre moteur IA
          </p>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          onClick={handleGenerate}
          disabled={loading || !canUseAi}
        >
          <Sparkles size={18} />
          {loading
            ? "Génération..."
            : "Générer le programme"}
        </button>
      </header>

      {!canUseAi && (
        <UpgradePrompt
          title="Programmes sportifs IA — Premium"
          message="Passez à Premium (9,99 €/mois) pour générer des programmes d'entraînement personnalisés."
        />
      )}

      {error && (
        <div
          className="card"
          style={{
            color: "crimson",
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      {!program ? (
        <div
          className="card card--empty"
          style={{
            flexDirection: "column",
          }}
        >
          <Dumbbell
            className="empty-state-icon"
            size={48}
          />

          Aucun programme généré.
        </div>
      ) : (
        <>
          <div className="card program-overview">
            <h2 className="program-overview__title title-font">
              Programme personnalisé
            </h2>

            <p className="program-overview__desc">
              Niveau : {program.level || "non défini"} · Durée :{" "}
              {program.duration} min
            </p>

            <p
              style={{
                marginTop: 12,
                color: "var(--text-secondary)",
              }}
            >
              Score IA : {program.score}
            </p>
          </div>

          <div className="sessions-grid">
            {(program.plan || []).map((exercise, idx) => (
              <div key={idx} className="card">
                {exercise.note ? (
                  <>
                    <h3 className="session-card__title">
                      Adaptation médicale
                    </h3>

                    <p>{exercise.note}</p>

                    <p
                      style={{
                        marginTop: 8,
                        color: "var(--text-secondary)",
                      }}
                    >
                      {exercise.limitations?.join(", ")}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="session-card__header">
                      <div>
                        <h3 className="session-card__title">
                          {exercise.exercise}
                        </h3>
                      </div>
                    </div>

                    <div className="exercise-item">
                      {exercise.duration && (
                        <div className="exercise-item__stats">
                          Durée : {exercise.duration} min
                        </div>
                      )}

                      {exercise.sets && (
                        <div className="exercise-item__stats">
                          Séries : {exercise.sets}
                        </div>
                      )}

                      {exercise.reps && (
                        <div className="exercise-item__stats">
                          Répétitions : {exercise.reps}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}