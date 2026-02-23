import { useEffect, useState } from "react";
import { apiGet, apiPost, apiPut, apiDelete } from "../api";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [userIdFilter, setUserIdFilter] = useState("");

  const [form, setForm] = useState({
    id_user: "",
    session_date: "",
    calories_burned: "",
    session_duration_hours: "",
    avg_bpm: "",
    workout_type: "",
  });

  const load = () => {
    const qs = new URLSearchParams();
    qs.set("limit", "200");
    if (userIdFilter) qs.set("user_id", userIdFilter);
    apiGet(`/sessions?${qs.toString()}`).then(setSessions);
  };

  useEffect(() => {
    load();
  }, []);

  const createSession = async () => {
    await apiPost("/sessions", {
      id_user: Number(form.id_user),
      session_date: form.session_date,
      calories_burned: form.calories_burned === "" ? null : Number(form.calories_burned),
      session_duration_hours: form.session_duration_hours === "" ? null : Number(form.session_duration_hours),
      avg_bpm: form.avg_bpm === "" ? null : Number(form.avg_bpm),
      workout_type: form.workout_type || null,
    });
    setForm({
      id_user: "",
      session_date: "",
      calories_burned: "",
      session_duration_hours: "",
      avg_bpm: "",
      workout_type: "",
    });
    load();
  };

  const deleteSession = async (id) => {
    await apiDelete(`/sessions/${id}`);
    load();
  };

  const updateSession = async (id, updated) => {
    await apiPut(`/sessions/${id}`, updated);
    setEditingId(null);
    load();
  };

  return (
    <div>
      <h1>Training sessions</h1>

      <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
        <input
          placeholder="Filter by user_id"
          value={userIdFilter}
          onChange={(e) => setUserIdFilter(e.target.value)}
        />
        <button onClick={load}>Apply</button>
      </div>

      <div style={{ marginBottom: 20, background: "white", padding: 12 }}>
        <h3>Create session</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="id_user *"
            value={form.id_user}
            onChange={(e) => setForm({ ...form, id_user: e.target.value })}
          />
          <input
            placeholder="session_date (YYYY-MM-DD) *"
            value={form.session_date}
            onChange={(e) => setForm({ ...form, session_date: e.target.value })}
          />
          <input
            placeholder="calories_burned"
            value={form.calories_burned}
            onChange={(e) => setForm({ ...form, calories_burned: e.target.value })}
          />
          <input
            placeholder="duration_hours"
            value={form.session_duration_hours}
            onChange={(e) =>
              setForm({ ...form, session_duration_hours: e.target.value })
            }
          />
          <input
            placeholder="avg_bpm"
            value={form.avg_bpm}
            onChange={(e) => setForm({ ...form, avg_bpm: e.target.value })}
          />
          <input
            placeholder="workout_type"
            value={form.workout_type}
            onChange={(e) => setForm({ ...form, workout_type: e.target.value })}
          />
          <button onClick={createSession}>Create</button>
        </div>
        <p style={{ marginTop: 8, fontSize: 12, color: "#555" }}>
          Note: (id_user, session_date) must be unique.
        </p>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>User</th>
            <th>Date</th>
            <th>Calories</th>
            <th>Duration</th>
            <th>Avg BPM</th>
            <th>Workout</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <SessionRow
              key={s.id_session}
              session={s}
              isEditing={editingId === s.id_session}
              onEdit={() => setEditingId(s.id_session)}
              onCancel={() => setEditingId(null)}
              onSave={(updated) => updateSession(s.id_session, updated)}
              onDelete={() => deleteSession(s.id_session)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatHoursToHHMM(hours) {
  if (hours == null) return "";
  const totalMin = Math.round(Number(hours) * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${h}h${String(m).padStart(2, "0")}`;
}

function SessionRow({ session, isEditing, onEdit, onCancel, onSave, onDelete }) {
  const [local, setLocal] = useState(session);

  useEffect(() => setLocal(session), [session]);

  return (
    <tr>
      <td>{session.id_session}</td>
      <td>{session.id_user}</td>

      <td>
        {isEditing ? (
          <input
            value={local.session_date}
            onChange={(e) => setLocal({ ...local, session_date: e.target.value })}
          />
        ) : (
          session.session_date
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.calories_burned ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                calories_burned: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          session.calories_burned
        )}
      </td>

    <td>{formatHoursToHHMM(session.session_duration_hours)}</td>

      <td>
        {isEditing ? (
          <input
            value={local.avg_bpm ?? ""}
            onChange={(e) =>
              setLocal({
                ...local,
                avg_bpm: e.target.value === "" ? null : Number(e.target.value),
              })
            }
          />
        ) : (
          session.avg_bpm
        )}
      </td>

      <td>
        {isEditing ? (
          <input
            value={local.workout_type ?? ""}
            onChange={(e) => setLocal({ ...local, workout_type: e.target.value })}
          />
        ) : (
          session.workout_type
        )}
      </td>

      <td>
        {isEditing ? (
          <>
            <button onClick={() => onSave(local)}>Save</button>
            <button onClick={onCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={onEdit}>Edit</button>
            <button onClick={onDelete}>Delete</button>
          </>
        )}
      </td>
    </tr>
  );
}