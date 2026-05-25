import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useApp } from "../context/AppContext";

function formatDate(d) {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

export default function Journal() {
  const { meals } = useApp();
  const [daysFilter, setDaysFilter] = useState(7);
  const [typeFilter, setTypeFilter] = useState("Tous");

  const chartData = useMemo(() => {
    const data = [];
    for (let i = daysFilter - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);
      const kcal = meals
        .filter((m) => {
          const md = new Date(m.date);
          return md >= dayStart && md <= dayEnd;
        })
        .reduce((s, m) => s + (m.calories || 0), 0);
      data.push({ date: formatDate(d), calories: kcal });
    }
    return data;
  }, [meals, daysFilter]);

  const filteredMeals = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysFilter);
    return meals.filter((m) => {
      const md = new Date(m.date);
      if (md < cutoff) return false;
      if (typeFilter !== "Tous" && m.mealType !== typeFilter) return false;
      return true;
    });
  }, [meals, daysFilter, typeFilter]);

  return (
    <>
      <header className="page-header">
        <div>
          <h1 className="page-header__title title-font">Journal nutritionnel</h1>
          <p className="page-header__subtitle">Vos repas et tendances</p>
        </div>
        <div className="journal-filters">
          <select
            className="filter-select"
            value={daysFilter}
            onChange={(e) => setDaysFilter(Number(e.target.value))}
          >
            <option value={7}>7 jours</option>
            <option value={14}>14 jours</option>
            <option value={30}>30 jours</option>
          </select>
          <select
            className="filter-select"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>Tous</option>
            <option>Petit-déj</option>
            <option>Déjeuner</option>
            <option>Diner</option>
            <option>Collation</option>
          </select>
        </div>
      </header>

      <div className="card chart-card">
        <h2 className="chart-card__title title-font">Calories par jour</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="#E5E7EB" />
            <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6B7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6B7280" }} />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: "1px solid #E5E7EB",
                fontFamily: "Ubuntu",
              }}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#5BA5DF"
              strokeWidth={2}
              dot={{ fill: "#5BA5DF", r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <h2 className="meals-section__title title-font">
        Repas ({filteredMeals.length})
      </h2>
      {filteredMeals.length === 0 ? (
        <div className="card card--empty">
          Aucun repas pour cette période.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filteredMeals.map((m) => (
            <div key={m.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                <div>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {m.mealType} · {new Date(m.date).toLocaleDateString("fr-FR")}
                  </span>
                  <p style={{ fontWeight: 700, marginTop: 4 }}>{m.name}</p>
                </div>
                <span style={{ fontWeight: 600, color: "var(--primary-blue)" }}>
                  {m.calories} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
