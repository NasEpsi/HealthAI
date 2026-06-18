import { useState } from "react";
import { Check, Building2, Crown, Star, Zap } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PLANS, TIERS, tierLabel } from "../services/subscription";

const PLAN_ICONS = {
  [TIERS.FREEMIUM]: Star,
  [TIERS.PREMIUM]: Zap,
  [TIERS.PREMIUM_PLUS]: Crown,
  [TIERS.B2B]: Building2,
};

export default function Subscriptions() {
  const { subscription, setSubscription, showToast } = useApp();
  const [b2bForm, setB2bForm] = useState({ company: "", email: "", message: "" });
  const [showB2bForm, setShowB2bForm] = useState(false);

  const handleSelect = async (plan) => {
    if (plan.isB2B) {
      setShowB2bForm(true);
      return;
    }
    if (plan.id === subscription) return;
    await setSubscription(plan.id);
    showToast(`Abonnement ${plan.name} activé !`);
  };

  const handleB2bSubmit = (e) => {
    e.preventDefault();
    if (!b2bForm.company.trim() || !b2bForm.email.trim()) {
      showToast("Renseignez le nom de l'organisation et un email.");
      return;
    }
    showToast("Demande B2B enregistrée — notre équipe vous contactera sous 48 h.");
    setB2bForm({ company: "", email: "", message: "" });
    setShowB2bForm(false);
  };

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Abonnements</h1>
          <p className="page-header__subtitle">
            Choisissez l&apos;offre adaptée à vos objectifs santé et performance
          </p>
        </div>
        <span className="subscription-badge">
          Offre actuelle : <strong>{tierLabel(subscription)}</strong>
        </span>
      </header>

      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const Icon = PLAN_ICONS[plan.id];
          const isCurrent = subscription === plan.id;

          return (
            <article
              key={plan.id}
              className={`pricing-card${plan.highlight ? " pricing-card--featured" : ""}${
                isCurrent ? " pricing-card--current" : ""
              }${plan.isB2B ? " pricing-card--b2b" : ""}`}
            >
              {plan.highlight && <span className="pricing-card__ribbon">Populaire</span>}
              {isCurrent && <span className="pricing-card__ribbon pricing-card__ribbon--current">Actif</span>}

              <div className="pricing-card__header">
                <div className="pricing-card__icon-wrap">
                  <Icon size={22} aria-hidden />
                </div>
                <h2 className="pricing-card__name title-font">{plan.name}</h2>
                <p className="pricing-card__desc">{plan.description}</p>
              </div>

              <div className="pricing-card__price">
                <span className="pricing-card__amount">{plan.price}</span>
                {plan.priceDetail && (
                  <span className="pricing-card__period">{plan.priceDetail}</span>
                )}
              </div>

              <ul className="pricing-card__features">
                {plan.features.map((feature) => (
                  <li key={feature}>
                    <Check size={16} aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`btn btn--full ${
                  isCurrent ? "btn--secondary" : plan.highlight ? "btn--primary" : "btn--secondary"
                }`}
                disabled={isCurrent && !plan.isB2B}
                onClick={() => handleSelect(plan)}
              >
                {isCurrent
                  ? "Plan actuel"
                  : plan.id === TIERS.FREEMIUM && subscription !== TIERS.FREEMIUM
                    ? "Rétrograder"
                    : plan.cta}
              </button>
            </article>
          );
        })}
      </div>

      <section className="card subscription-compare">
        <h2 className="title-font subscription-compare__title">Comparatif des offres</h2>
        <div className="subscription-compare__table-wrap">
          <table className="subscription-compare__table">
            <thead>
              <tr>
                <th>Fonctionnalité</th>
                <th>Freemium</th>
                <th>Premium</th>
                <th>Premium+</th>
                <th>B2B</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Journal alimentaire", true, true, true, true],
                ["Suivi d'activité & IMC", true, true, true, true],
                ["Recommandations IA", false, true, true, true],
                ["Plans nutrition & sport détaillés", false, true, true, true],
                ["Objets connectés & biométrie", false, false, true, true],
                ["Consultations nutritionnistes", false, false, true, true],
                ["Marque blanche", false, false, false, true],
              ].map(([label, f, p, pp, b]) => (
                <tr key={label}>
                  <td>{label}</td>
                  {[f, p, pp, b].map((ok, i) => (
                    <td key={i}>{ok ? <Check size={16} className="check-yes" /> : "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showB2bForm && (
        <div className="modal-overlay" onClick={() => setShowB2bForm(false)} role="presentation">
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="title-font" style={{ marginBottom: 8 }}>
              Offre B2B — Marque blanche
            </h2>
            <p className="page-header__subtitle" style={{ marginBottom: 20 }}>
              Salles de sport, mutuelles, entreprises : décrivez votre besoin.
            </p>
            <form onSubmit={handleB2bSubmit} className="form-stack">
              <label className="form-label">
                Organisation
                <input
                  className="input"
                  value={b2bForm.company}
                  onChange={(e) => setB2bForm((f) => ({ ...f, company: e.target.value }))}
                  placeholder="Nom de la salle, mutuelle ou entreprise"
                  required
                />
              </label>
              <label className="form-label">
                Email professionnel
                <input
                  type="email"
                  className="input"
                  value={b2bForm.email}
                  onChange={(e) => setB2bForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="contact@organisation.fr"
                  required
                />
              </label>
              <label className="form-label">
                Message (optionnel)
                <textarea
                  className="textarea"
                  value={b2bForm.message}
                  onChange={(e) => setB2bForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Nombre d'utilisateurs, besoins spécifiques…"
                  rows={3}
                />
              </label>
              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button type="submit" className="btn btn--primary btn--full">
                  Envoyer la demande
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => setShowB2bForm(false)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
