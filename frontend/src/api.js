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

export async function getProfile(userId) {
  const res = await fetch(`${API_URL}/profiles/${userId}`);
  if (!res.ok) throw new Error("Erreur récupération profil");
  return res.json();
}

export async function createOrUpdateProfile(userId, data) {
  const res = await fetch(`${API_URL}/profiles/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur mise à jour profil");
  return res.json();
}

export async function generateNutritionRecommendation(data) {
  const res = await fetch(`${API_URL}/recommendations/nutrition`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur recommandation nutrition");
  return res.json();
}

export async function generateWorkoutRecommendation(data) {
  const res = await fetch(`${API_URL}/recommendations/workout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Erreur recommandation sport");
  return res.json();
}

export async function getRecommendationHistory(userId) {
  const res = await fetch(`${API_URL}/recommendations/history/${userId}`);
  if (!res.ok) throw new Error("Erreur historique recommandations");
  return res.json();
}