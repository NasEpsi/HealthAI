import { createElement, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Flame, Beef, Wheat, Droplet, Camera, BookOpen, UtensilsCrossed, Dumbbell } from "lucide-react";
import { useApp } from "../context/AppContext";
import { getDashboardSummary } from "../api";

function CalorieRing({ current, target }) {
  const pct = target > 0 ? Math.min(100, (current / target) * 100) : 0;
  const r = 58;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="calorie-ring">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="10" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke="#5BA5DF"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="calorie-ring__center">
        <span className="calorie-ring__value">{current}</span>
        <span className="calorie-ring__target">/ {target}</span>
      </div>
    </div>
  );
}

const quickLinks = [
  { to: "/scanner", icon: Camera, title: "Scanner un repas", desc: "Analyse IA instantanée" },
  { to: "/journal", icon: BookOpen, title: "Mon journal", desc: "Historique nutritionnel" },
  { to: "/plans-repas", icon: UtensilsCrossed, title: "Plan de repas", desc: "Personnalisé IA" },
  { to: "/sport", icon: Dumbbell, title: "Programme sport", desc: "Générer un plan" },
];

export default function Home() {
  const { profile, daily: contextDaily, macroTargets, avatar, profile: userProfile } = useApp();
  const [daily, setDaily] = useState(contextDaily);
  const navigate = useNavigate();

  useEffect(() => {
    setDaily(contextDaily);
  }, [contextDaily]);

  useEffect(() => {
    const backendUserId = userProfile?.id_user;
    if (!backendUserId) return;

    async function loadDashboard() {
      try {
        const data = await getDashboardSummary(backendUserId);
        if (data?.daily) setDaily(data.daily);
      } catch (err) {
        console.error(err);
      }
    }

    loadDashboard();
  }, [userProfile?.id_user]);

  const remaining = Math.max(0, profile.targetCalories - daily.calories);

  const macroPct = (current, target) =>
    target > 0 ? Math.min(100, (current / target) * 100) : 0;

  return (
    <>
      <header style={{ marginBottom: 28 }}>
        <div className="greeting__row">
          {avatar && (
            <img src={avatar} alt="" className="greeting__avatar" />
          )}
          <div>
            <p className="greeting__label">Bonjour</p>
            <h1 className="greeting__name title-font">
              {profile.name || "Utilisateur"}
            </h1>
          </div>
        </div>
      </header>

      <div className="card today-card">
        <h2 className="today-card__title title-font">Aujourd&apos;hui</h2>
        <div className="today-card__body">
          <CalorieRing current={daily.calories} target={profile.targetCalories} />
          <div className="calorie-info">
            <div className="calorie-info__remaining">
              <Flame size={22} color="#5BA5DF" />
              {remaining} kcal restantes
            </div>
            <p className="calorie-info__goal">
              Objectif : {profile.goal?.replace(" nutritionnel", "") || "Équilibre"}
            </p>
          </div>
        </div>
        <div className="macros">
          {[
            { label: "Protéines", icon: Beef, current: daily.protein, target: macroTargets.protein },
            { label: "Glucides", icon: Wheat, current: daily.carbs, target: macroTargets.carbs },
            { label: "Lipides", icon: Droplet, current: daily.fat, target: macroTargets.fat },
          ].map(({ label, icon, current, target }) => (
            <div key={label} className="macro-item">
              <div className="macro-item__header">
                {createElement(icon, { size: 16, color: "#5BA5DF" })}
                {label}
              </div>
              <div className="macro-item__value">
                {current}g / {target}g
              </div>
              <div className="macro-bar">
                <div
                  className="macro-bar__fill"
                  style={{ width: `${macroPct(current, target)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="quick-actions">
        {quickLinks.map(({ to, icon, title, desc }) => (
          <button
            key={to}
            type="button"
            className="quick-action"
            onClick={() => navigate(to)}
          >
            {createElement(icon, { className: "quick-action__icon", size: 28 })}
            <div className="quick-action__title">{title}</div>
            <div className="quick-action__desc">{desc}</div>
          </button>
        ))}
      </div>
    </>
  );
}
