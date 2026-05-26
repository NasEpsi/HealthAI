import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useApp } from "../context/AppContext";
import { analyzeMealImage, saveMealAnalysis } from "../api";

const MEAL_TYPES = ["Petit-déj", "Déjeuner", "Diner", "Collation"];

export default function Scanner() {
  const [mealType, setMealType] = useState("Déjeuner");
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const { addMeal, currentUser } = useApp();

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 8 Mo)");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setAnalyzing(true);
    setResult(null);
    setError("");

    try {
      const userId = currentUser?.id_user;
      if (!userId) {
        setError("Utilisateur non connecté.");
        setAnalyzing(false);
        return;
      }
      const goal =
        currentUser?.health_goal ||
        "maintain";

      const analysis = await analyzeMealImage(file, userId, goal);

      const formattedResult = {
        mealType,
        foods: analysis.detected_foods.map((food) => ({
          name: food.label,
          calories: food.calories,
          protein: food.proteins,
          carbs: food.carbs,
          fat: food.fats,
        })),
        calories: analysis.totals.calories,
        protein: analysis.totals.proteins,
        carbs: analysis.totals.carbs,
        fat: analysis.totals.fats,
        advice: analysis.advice,
        score: analysis.score,
      };

      setResult(formattedResult);
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible d'analyser l'image pour le moment.");
    } finally {
      setAnalyzing(false);
    }
  };

  const saveMeal = async () => {
    if (!result) return;

    const userId = currentUser?.id_user;

    if (!userId) {
      setError("Utilisateur non connecté.");
      return;
    }

    addMeal({
      mealType: result.mealType,
      name: result.foods.map((f) => f.name).join(", "),
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    });

    await saveMealAnalysis({
      user_id: userId,
      image_url: preview,
      detected_foods_json: result.foods,
      estimated_calories: result.calories,
      estimated_proteins: result.protein,
      estimated_carbs: result.carbs,
      estimated_fats: result.fat,
      analysis_status: "success",
      analysis_source: "healthai_ai_service",
      raw_ai_response: result,
    });

    setPreview(null);
    setResult(null);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Scanner un repas</h1>
          <p className="page-header__subtitle">
            Photographiez votre assiette, l&apos;IA analyse les nutriments.
          </p>
        </div>
      </header>

      <div className="card">
        <div className="meal-tabs">
          {MEAL_TYPES.map((t) => (
            <button
              key={t}
              type="button"
              className={`meal-tab${mealType === t ? " meal-tab--active" : ""}`}
              onClick={() => setMealType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className="dropzone"
          role="button"
          tabIndex={0}
          onClick={() => fileRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileRef.current?.click()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Aperçu repas"
              style={{ maxHeight: 200, borderRadius: 8, marginBottom: 16 }}
            />
          ) : (
            <Camera className="dropzone__icon" size={48} />
          )}

          <p className="dropzone__title">
            {analyzing ? "Analyse en cours..." : "Prendre / Téléverser une photo"}
          </p>
          <p className="dropzone__hint">JPG, PNG, WEBP (max 8 Mo)</p>
        </div>

        {error && (
          <p style={{ color: "crimson", marginTop: 16 }}>
            {error}
          </p>
        )}

        {result && (
          <div className="scan-result">
            <p className="scan-result__title">
              Résultat de l&apos;analyse ({result.mealType})
            </p>

            <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
              {result.foods.map((f) => (
                <li key={f.name} style={{ marginBottom: 4, color: "var(--text-secondary)" }}>
                  {f.name} — {f.calories} kcal
                </li>
              ))}
            </ul>

            <p style={{ fontWeight: 600, marginBottom: 12 }}>
              Total : {result.calories} kcal · P {result.protein}g · G {result.carbs}g · L{" "}
              {result.fat}g
            </p>

            {result.advice && (
              <p style={{ marginBottom: 16, color: "var(--text-secondary)" }}>
                {result.advice}
              </p>
            )}

            <button type="button" className="btn btn--primary" onClick={saveMeal}>
              Enregistrer dans le journal
            </button>
          </div>
        )}
      </div>
    </>
  );
}