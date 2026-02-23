import { useEffect, useState } from "react";
import { apiGet, apiPost } from "../api";

export default function Exports() {
  const [files, setFiles] = useState([]);

  const load = () => {
    apiGet("/exports").then((data) => {
      setFiles(data.files || []);
    });
  };

  useEffect(() => {
    load();
  }, []);

  const runExport = async () => {
    await apiPost("/exports/run");
    load();
  };

  return (
    <div>
      <h1>Exports</h1>
      <button onClick={runExport}>Run Export</button>

      <ul>
        {files.map((f) => (
          <li key={f.name}>
            <a
              href={`http://localhost:8000/exports/${f.name}`}
              target="_blank"
              rel="noreferrer"
            >
              {f.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}