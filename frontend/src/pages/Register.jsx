import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import ProgressBar from "../components/ProgressBar";
import { useApp } from "../context/AppContext";

const GOALS = [
  "Perte de poids",
  "Prise de masse",
  "Équilibre nutritionnel",
  "Performance sportive",
  "Maintien",
];

const DIET_TAGS = [
  "Omnivore",
  "Végétarien",
  "Végan",
  "Sans gluten",
  "Halal",
  "Casher",
  "Pescétarien",
];

const initialForm = {
  name: "",
  email: "",
  password: "",
  age: 30,
  sex: "Femme",
  height: 170,
  weight: 65,
  activityLevel: "Modéré",
  goal: "Équilibre nutritionnel",
  allergies: "",
  dietTags: [],
  preferences: "",
  budget: 50,
  sportLevel: "Débutant",
  equipment: "Aucun équipement",
  sessionMinutes: 45,
  sessionsPerWeek: 3,
  injuries: "",
};

export default function Register() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const { completeOnboarding } = useApp();
  const navigate = useNavigate();

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      dietTags: f.dietTags.includes(tag)
        ? f.dietTags.filter((t) => t !== tag)
        : [...f.dietTags, tag],
    }));
  };

  const next = () => setStep((s) => Math.min(4, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const finish = async () => {
    try {
      await completeOnboarding(form);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <div className="auth-card__header">
          <Logo centered size="lg" />
        </div>
        <ProgressBar current={step} />

        {step === 1 && (
          <>
            <h2 className="onboarding-title">Vos données</h2>
            <div className="form-group">
              <label>Nom</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Votre prénom"
              />
            </div>

            <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="input"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              placeholder="email@exemple.com"
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              className="input"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              placeholder="********"
            />
          </div>
            <div className="form-group">
              <label>Âge</label>
              <input
                type="number"
                className="input"
                value={form.age}
                onChange={(e) => update("age", Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Sexe</label>
              <select
                className="select"
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
              >
                <option>Femme</option>
                <option>Homme</option>
                <option>Autre</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Taille (cm)</label>
                <input
                  type="number"
                  className="input"
                  value={form.height}
                  onChange={(e) => update("height", Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Poids (kg)</label>
                <input
                  type="number"
                  className="input"
                  value={form.weight}
                  onChange={(e) => update("weight", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Niveau d&apos;activité</label>
              <select
                className="select"
                value={form.activityLevel}
                onChange={(e) => update("activityLevel", e.target.value)}
              >
                <option>Sédentaire</option>
                <option>Léger</option>
                <option>Modéré</option>
                <option>Actif</option>
                <option>Très actif</option>
              </select>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="onboarding-title">Votre objectif</h2>
            <div className="goal-options">
              {GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`goal-option${form.goal === g ? " goal-option--selected" : ""}`}
                  onClick={() => update("goal", g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="onboarding-title">Nutrition</h2>
            <div className="form-group">
              <label>Allergies (séparées par virgules)</label>
              <input
                className="input"
                placeholder="arachides, lactose..."
                value={form.allergies}
                onChange={(e) => update("allergies", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Régime / préférences</label>
              <div className="tag-list">
                {DIET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`tag${form.dietTags.includes(tag) ? " tag--selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Préférences (texte libre)</label>
              <textarea
                className="textarea"
                placeholder="J'aime la cuisine méditerranéenne..."
                value={form.preferences}
                onChange={(e) => update("preferences", e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Budget courses / semaine (€)</label>
              <input
                type="number"
                className="input"
                value={form.budget}
                onChange={(e) => update("budget", Number(e.target.value))}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="onboarding-title">Sport</h2>
            <div className="form-group">
              <label>Niveau</label>
              <select
                className="select"
                value={form.sportLevel}
                onChange={(e) => update("sportLevel", e.target.value)}
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
              </select>
            </div>
            <div className="form-group">
              <label>Équipement</label>
              <select
                className="select"
                value={form.equipment}
                onChange={(e) => update("equipment", e.target.value)}
              >
                <option>Aucun équipement</option>
                <option>Élastiques</option>
                <option>Haltères</option>
                <option>Salle complète</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Min / séance</label>
                <input
                  type="number"
                  className="input"
                  value={form.sessionMinutes}
                  onChange={(e) => update("sessionMinutes", Number(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label>Séances / sem.</label>
                <input
                  type="number"
                  className="input"
                  value={form.sessionsPerWeek}
                  onChange={(e) => update("sessionsPerWeek", Number(e.target.value))}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Blessures / contre-indications</label>
              <textarea
                className="textarea"
                placeholder="Genou droit fragile..."
                value={form.injuries}
                onChange={(e) => update("injuries", e.target.value)}
              />
            </div>
          </>
        )}

        <div className="onboarding-nav">
          {step > 1 ? (
            <button type="button" className="btn btn--secondary" onClick={prev}>
              &lt; Précédent
            </button>
          ) : (
            <Link to="/login" className="btn btn--secondary">
              &lt; Connexion
            </Link>
          )}
          {step < 4 ? (
            <button type="button" className="btn btn--primary" onClick={next}>
              Suivant &gt;
            </button>
          ) : (
            <button type="button" className="btn btn--primary" onClick={finish}>
              Terminer
            </button>
          )}
        </div>

        {step === 1 && (
          <div className="auth-card__footer" style={{ marginTop: 16 }}>
            <span>
              Déjà un compte ?{" "}
              <Link to="/login" className="link-primary">
                Connectez-vous
              </Link>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
