import { useEffect, useState } from "react";
import { apiGet } from "../api";

export default function Dashboard() {
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    apiGet("/kpis/quality").then((data) => {
      setRuns(data.runs || []);
    });
  }, []);

  return (
    <div>
      <h1>Pipeline Quality</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Pipeline</th>
            <th>Status</th>
            <th>Rows Read</th>
            <th>Rejected</th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => (
            <tr key={r.id_run}>
              <td>{r.id_run}</td>
              <td>{r.pipeline_name}</td>
              <td>{r.status}</td>
              <td>{r.rows_read}</td>
              <td>{r.rows_rejected}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}