import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Camera, User, Moon, Sun, Monitor, CreditCard } from "lucide-react";
import { useApp } from "../context/AppContext";
import { uploadAvatar } from "../services/cloudinary";
import { isNative } from "../utils/platform";
import { tierLabel } from "../services/subscription";

const GOALS = [
  "Perte de poids",
  "Prise de masse",
  "Équilibre nutritionnel",
  "Performance sportive",
  "Maintien",
];

const THEME_OPTIONS = [
  { id: "light", label: "Clair", icon: Sun },
  { id: "dark", label: "Sombre", icon: Moon },
  { id: "system", label: "Système", icon: Monitor },
];

export default function Profile() {
  const { profile, avatar, updateProfile, setUserAvatar, updatePassword, showToast, themePreference, setThemePreference, userId, subscription } = useApp();

  const [form, setForm] = useState({ ...profile });
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const avatarRef = useRef(null);

  useEffect(() => {
    setForm({ ...profile });
  }, [profile]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await updateProfile(form);
      showToast("Profil enregistré !");
    } catch (err) {
      setError(err.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file) => {
    if (!file || !userId) return;
    try {
      const uploaded = await uploadAvatar(file, userId);
      await setUserAvatar(uploaded.url);
      showToast("Avatar mis à jour !");
    } catch (err) {
      setError(err.message || "Impossible de charger l'avatar.");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError("");
    if (passwordForm.next !== passwordForm.confirm) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    try {
      await updatePassword(passwordForm.current, passwordForm.next);
      setPasswordForm({ current: "", next: "", confirm: "" });
      showToast("Mot de passe modifié !");
    } catch (err) {
      setError(err.message || "Impossible de modifier le mot de passe.");
    }
  };

  const removeAvatar = async () => {
    await setUserAvatar(null);
    showToast("Avatar supprimé.");
  };

  return (
    <>
      <header className="page-header">
        <h1 className="page-header__title title-font">Mon profil</h1>
        <Link to="/abonnements" className="subscription-badge subscription-badge--link">
          <CreditCard size={16} aria-hidden />
          {tierLabel(subscription)}
        </Link>
      </header>

      <div className="card profile-card">
        <section className="profile-section">
          <h2 className="profile-section__title">Avatar</h2>
          <div className="avatar-block">
            <div className="avatar-preview">
              {avatar ? (
                <img src={avatar} alt="" className="avatar-preview__img" />
              ) : (
                <User size={40} className="avatar-preview__placeholder" />
              )}
            </div>
            <div className="avatar-actions">
              <input
                ref={avatarRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                hidden
                onChange={(e) => handleAvatar(e.target.files?.[0])}
              />
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => avatarRef.current?.click()}
              >
                <Camera size={16} />
                {isNative ? "Photo" : "Choisir une image"}
              </button>
              {avatar && (
                <button type="button" className="btn btn--secondary btn--sm" onClick={removeAvatar}>
                  Supprimer
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="profile-section__title">Apparence</h2>
          <div className="theme-options">
            {THEME_OPTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={`theme-option${themePreference === id ? " theme-option--active" : ""}`}
                onClick={() => setThemePreference(id)}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </section>

        <form onSubmit={handleSave}>
          <section className="profile-section">
            <h2 className="profile-section__title">Informations</h2>
            <div className="form-group">
              <label>Email</label>
              <input className="input" value={form.email || ""} disabled />
            </div>
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
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </button>
          </section>
        </form>

        <form onSubmit={handlePasswordChange}>
          <section className="profile-section">
            <h2 className="profile-section__title">Sécurité</h2>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <input
                type="password"
                className="input"
                value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                autoComplete="current-password"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.next}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Confirmer</label>
                <input
                  type="password"
                  className="input"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                  autoComplete="new-password"
                />
              </div>
            </div>
            <button type="submit" className="btn btn--secondary">
              Modifier le mot de passe
            </button>
          </section>
        </form>

        {error && <p className="form-error">{error}</p>}
      </div>
    </>
  );
}
