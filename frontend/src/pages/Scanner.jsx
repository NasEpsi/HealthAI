import { useRef, useState } from "react";
import { Camera as CameraIcon } from "lucide-react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { useApp } from "../context/AppContext";
import { analyzeMealImage, saveMealAnalysis } from "../api";
import { isNative } from "../utils/platform";
import UpgradePrompt from "../components/UpgradePrompt";

const MEAL_TYPES = ["Petit-déj", "Déjeuner", "Diner", "Collation"];

const MOCK_ANALYSIS = [
  { name: "Poulet grillé", calories: 220, protein: 35, carbs: 0, fat: 8 },
  { name: "Riz complet", calories: 180, protein: 4, carbs: 38, fat: 2 },
  { name: "Brocoli vapeur", calories: 55, protein: 4, carbs: 8, fat: 1 },
];

function runMockAnalysis(setAnalyzing, setResult, mealType) {
  setAnalyzing(true);
  setResult(null);
  setTimeout(() => {
    const total = MOCK_ANALYSIS.reduce(
      (acc, f) => ({
        calories: acc.calories + f.calories,
        protein: acc.protein + f.protein,
        carbs: acc.carbs + f.carbs,
        fat: acc.fat + f.fat,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    setResult({ foods: MOCK_ANALYSIS, ...total, mealType });
    setAnalyzing(false);
  }, 1500);
}

export default function Scanner() {
  const [mealType, setMealType] = useState("Déjeuner");
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const { addMeal, profile, hasFeature, showToast } = useApp();
  const canScan = hasFeature("meal_scanner");

  const backendUserId = profile?.id_user;

  const analyzeFile = async (file) => {
    setAnalyzing(true);
    setResult(null);
    setError("");

    if (!backendUserId) {
      runMockAnalysis(setAnalyzing, setResult, mealType);
      return;
    }

    try {
      const goal = profile?.goal || "maintain";
      const analysis = await analyzeMealImage(file, backendUserId, goal);

      setResult({
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
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "Impossible d'analyser l'image pour le moment.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleFile = async (file) => {
    if (!canScan) {
      showToast("Le scanner IA nécessite l'abonnement Premium.");
      return;
    }
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > 8 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 8 Mo)");
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    await analyzeFile(file);
  };

  const openPicker = async () => {
    if (isNative) {
      try {
        const photo = await Camera.getPhoto({
          quality: 85,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source: CameraSource.Prompt,
        });
        if (photo.dataUrl) {
          setPreview(photo.dataUrl);
          runMockAnalysis(setAnalyzing, setResult, mealType);
        }
      } catch {
        /* annulé par l'utilisateur */
      }
      return;
    }
    fileRef.current?.click();
  };

  const saveMeal = async () => {
    if (!result) return;

    addMeal({
      mealType: result.mealType,
      name: result.foods.map((f) => f.name).join(", "),
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
    });

    if (backendUserId) {
      try {
        await saveMealAnalysis({
          user_id: backendUserId,
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
      } catch (err) {
        console.error(err);
      }
    }

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

      {!canScan && (
        <UpgradePrompt
          title="Scanner de repas IA — Premium"
          message="Analysez vos assiettes par photo avec l'intelligence artificielle en passant à Premium (9,99 €/mois)."
        />
      )}

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
          capture="environment"
          hidden
          onChange={(e) => handleFile(e.target.files?.[0])}
        />

        <div
          className="dropzone"
          role="button"
          tabIndex={0}
          onClick={openPicker}
          onKeyDown={(e) => e.key === "Enter" && openPicker()}
        >
          {preview ? (
            <img
              src={preview}
              alt="Aperçu repas"
              style={{ maxHeight: 200, borderRadius: 8, marginBottom: 16 }}
            />
          ) : (
            <CameraIcon className="dropzone__icon" size={48} />
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
