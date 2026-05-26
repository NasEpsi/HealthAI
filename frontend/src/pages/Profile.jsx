import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";

import {
  createProfile,
  getProfile,
  updateProfileApi,
} from "../api";

const GOALS = [
  "Perte de poids",
  "Prise de masse",
  "Équilibre nutritionnel",
  "Performance sportive",
  "Maintien",
];

export default function Profile() {
  const {
    profile,
    updateProfile,
    showToast,
    currentUser,
  } = useApp();

  const [form, setForm] = useState({
    name: "",
    age: 25,
    weight: 70,
    goal: "Maintien",
    targetCalories: 2200,
    allergies: "",
    injuries: "",
  });

  const [loading, setLoading] = useState(true);

  const userId = currentUser?.id_user;

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    async function loadProfile() {
      try {
        const data = await getProfile(userId);

        setForm({
          name: data.name || "",
          age: data.age || 25,
          weight: data.weight_kg || 70,
          goal: data.health_goal || "Maintien",
          targetCalories: data.daily_calorie_target || 2200,
          allergies: data.allergies || "",
          injuries: data.injuries || "",
        });
      } catch {
        console.log("Aucun profil trouvé");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [userId]);

  const update = (key, value) => {
    setForm((f) => ({
      ...f,
      [key]: value,
    }));
  };

  const handleSave = async (e) => {
    if (!userId) {
      showToast("Utilisateur non connecté");
      return;
    }
    e.preventDefault();

    const payload = {
      user_id: userId,
      age: form.age,
      sex: profile.sex || "male",
      weight_kg: form.weight,
      activity_level: "moderate",
      health_goal: form.goal,
      daily_calorie_target: form.targetCalories,
      allergies: form.allergies,
      dietary_preferences: "",
      injuries: form.injuries,
    };

    try {
      await updateProfileApi(userId, payload);

      updateProfile(form);

      showToast("Profil enregistré !");
    } catch {
      try {
        await createProfile(payload);

        updateProfile(form);

        showToast("Profil créé !");
      } catch {
        showToast("Erreur sauvegarde profil");
      }
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }
  if (!currentUser) {
  return <p>Utilisateur non connecté</p>;
}

  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title title-font">
          Mon profil
        </h1>
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
                onChange={(e) =>
                  update("age", Number(e.target.value))
                }
              />
            </div>

            <div className="form-group">
              <label>Poids (kg)</label>
              <input
                type="number"
                className="input"
                value={form.weight}
                onChange={(e) =>
                  update("weight", Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="form-group">
            <label>Objectif</label>

            <select
              className="select"
              value={form.goal}
              onChange={(e) =>
                update("goal", e.target.value)
              }
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
              onChange={(e) =>
                update(
                  "targetCalories",
                  Number(e.target.value)
                )
              }
            />
          </div>

          <div className="form-group">
            <label>Allergies</label>

            <input
              className="input"
              value={form.allergies}
              onChange={(e) =>
                update("allergies", e.target.value)
              }
              placeholder="arachides, lactose..."
            />
          </div>

          <div className="form-group">
            <label>Blessures / contre-indications</label>

            <textarea
              className="textarea"
              value={form.injuries}
              onChange={(e) =>
                update("injuries", e.target.value)
              }
              placeholder="Genou droit fragile..."
            />
          </div>

          <button
            type="submit"
            className="btn btn--primary"
          >
            Enregistrer
          </button>
        </form>
      </div>
    </>
  );
}