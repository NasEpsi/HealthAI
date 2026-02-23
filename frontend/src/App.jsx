import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Exports from "./pages/Exports";
import Users from "./pages/Users";
import Sessions from "./pages/Sessions";
import Foods from "./pages/Foods";

export default function App() {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>HealthAI Admin</h2>
        <button onClick={() => setPage("dashboard")}>Dashboard</button>
        <button onClick={() => setPage("users")}>Users</button>
        <button onClick={() => setPage("sessions")}>Sessions</button>
        <button onClick={() => setPage("exports")}>Exports</button>
        <button onClick={() => setPage("foods")}>Foods</button>
      </aside>

      <main className="content">
        {page === "dashboard" && <Dashboard />}
        {page === "users" && <Users />}
        {page === "sessions" && <Sessions />}
        {page === "exports" && <Exports />}
        {page === "foods" && <Foods />}
      </main>
    </div>
  );
}