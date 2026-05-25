import { useRef, useState } from "react";
import { Camera } from "lucide-react";
import { useApp } from "../context/AppContext";

const MEAL_TYPES = ["Petit-déj", "Déjeuner", "Diner", "Collation"];

const MOCK_ANALYSIS = [
  { name: "Poulet grillé", calories: 220, protein: 35, carbs: 0, fat: 8 },
  { name: "Riz complet", calories: 180, protein: 4, carbs: 38, fat: 2 },
  { name: "Brocoli vapeur", calories: 55, protein: 4, carbs: 8, fat: 1 },
];

export default function Scanner() {
  const [mealType, setMealType] = useState("Déjeuner");
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);
  const { addMeal } = useApp();

  const handleFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 8 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 8 Mo)");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
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
  };

  const saveMeal = () => {
    if (!result) return;
    addMeal({
      mealType: result.mealType,
      name: result.foods.map((f) => f.name).join(", "),
      calories: result.calories,
      protein: result.protein,
      carbs: result.carbs,
      fat: result.fat,
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
          <p className="dropzone__hint">JPG, PNG (max 8 Mo)</p>
        </div>

        {result && (
          <div className="scan-result">
            <p className="scan-result__title">Résultat de l&apos;analyse ({result.mealType})</p>
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
            <button type="button" className="btn btn--primary" onClick={saveMeal}>
              Enregistrer dans le journal
            </button>
          </div>
        )}
      </div>
    </>
  );
}
