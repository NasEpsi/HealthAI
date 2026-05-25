import { Sparkles, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function MealPlans() {
  const { mealPlan, generateMealPlan, deleteMealPlan } = useApp();

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Plans de repas</h1>
          <p className="page-header__subtitle">
            Personnalisés selon votre profil et budget
          </p>
          {mealPlan && <span className="plan-badge">{mealPlan.title}</span>}
        </div>
        <button type="button" className="btn btn--primary" onClick={generateMealPlan}>
          <Sparkles size={18} />
          Générer un plan
        </button>
      </header>

      {!mealPlan ? (
        <div className="card card--empty">
          Aucun plan généré. Cliquez sur « Générer un plan » pour démarrer.
        </div>
      ) : (
        <>
          <div className="plan-header">
            <h2 className="plan-header__title title-font">{mealPlan.title}</h2>
            <button
              type="button"
              className="program-overview__delete"
              onClick={deleteMealPlan}
              aria-label="Supprimer le plan"
            >
              <Trash2 size={20} />
            </button>
          </div>
          <div className="plan-grid">
            {mealPlan.days.map(({ day, meals }) => (
              <div key={day} className="day-card">
                <h3 className="day-card__name title-font">{day}</h3>
                {meals.map((meal) => (
                  <div key={`${day}-${meal.type}`} className="meal-item">
                    <div className="meal-item__type">{meal.type}</div>
                    <div className="meal-item__name">{meal.name}</div>
                    <div className="meal-item__kcal">{meal.kcal} kcal</div>
                    <div className="meal-item__desc">{meal.desc}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}
