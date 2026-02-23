const API_URL = "http://localhost:8000";
const API_KEY = "healthai"; // adapte si tu modifies .env

export async function apiGet(path) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "x-api-key": API_KEY },
  });
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiPut(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: {
      "x-api-key": API_KEY,
    },
  });
  return res.json();
}