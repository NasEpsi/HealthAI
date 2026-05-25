import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

const GOALS = [
  "Perte de poids",
  "Prise de masse",
  "Équilibre nutritionnel",
  "Performance sportive",
  "Maintien",
];

export default function Profile() {
  const { profile, updateProfile, showToast } = useApp();
  const [form, setForm] = useState({ ...profile });

  useEffect(() => {
    setForm({ ...profile });
  }, [profile]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    showToast("Profil enregistré !");
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title title-font">Mon profil</h1>
      </header>

      <div className="card profile-card">
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Nom</label>
            <input
              className="input"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
          <div className="form-row">
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
            <label>Objectif</label>
            <select
              className="select"
              value={form.goal}
              onChange={(e) => update("goal", e.target.value)}
            >
              {GOALS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Calories cible / jour</label>
            <input
              type="number"
              className="input"
              value={form.targetCalories}
              onChange={(e) => update("targetCalories", Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Allergies</label>
            <input
              className="input"
              value={form.allergies}
              onChange={(e) => update("allergies", e.target.value)}
              placeholder="arachides, lactose..."
            />
          </div>
          <div className="form-group">
            <label>Blessures / contre-indications</label>
            <textarea
              className="textarea"
              value={form.injuries}
              onChange={(e) => update("injuries", e.target.value)}
              placeholder="Genou droit fragile..."
            />
          </div>
          <button type="submit" className="btn btn--primary">
            Enregistrer
          </button>
        </form>
      </div>
    </>
  );
}
