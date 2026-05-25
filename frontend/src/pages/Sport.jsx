import { Sparkles, Trash2, Dumbbell } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Sport() {
  const { sportProgram, generateSportProgram, deleteSportProgram } = useApp();

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Mon programme sport</h1>
          <p className="page-header__subtitle">Généré par notre moteur adaptatif</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={generateSportProgram}>
          <Sparkles size={18} />
          Générer / mettre à jour
        </button>
      </header>

      {!sportProgram ? (
        <div className="card card--empty" style={{ flexDirection: "column" }}>
          <Dumbbell className="empty-state-icon" size={48} />
          Aucun programme. Lancez la génération pour démarrer.
        </div>
      ) : (
        <>
          <div className="card program-overview">
            <button
              type="button"
              className="program-overview__delete"
              onClick={deleteSportProgram}
              aria-label="Supprimer le programme"
            >
              <Trash2 size={20} />
            </button>
            <h2 className="program-overview__title title-font">{sportProgram.title}</h2>
            <p className="program-overview__desc">{sportProgram.description}</p>
          </div>

          <div className="sessions-grid">
            {sportProgram.sessions.map((session, idx) => (
              <div key={idx} className="card">
                <div className="session-card__header">
                  <div>
                    <h3 className="session-card__title">{session.title}</h3>
                    <p className="session-card__subtitle">{session.subtitle}</p>
                  </div>
                  <button type="button" className="btn btn--primary btn--sm">
                    Logger
                  </button>
                </div>
                {session.exercises.map((ex, i) => (
                  <div key={i} className="exercise-item">
                    <div className="exercise-item__name">{ex.name}</div>
                    <div className="exercise-item__stats">{ex.stats}</div>
                    {ex.note && <div className="exercise-item__note">*{ex.note}*</div>}
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
