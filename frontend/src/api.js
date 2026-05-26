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
  return apiPost("/recommendations/nutrition", data);
}

export async function generateWorkoutRecommendation(data) {
  return apiPost("/recommendations/workout", data);
}

export async function getRecommendationHistory(userId) {
  return apiGet(`/recommendations/history/${userId}`);
}

export async function analyzeMealImage(file, userId, goal = "maintain") {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("user_id", String(userId));
  formData.append("goal", goal);

  const response = await fetch("http://localhost:8001/ai/vision/meal/analyze", {
    method: "POST",
    body: formData,
  });

  const text = await response.text();

  if (!response.ok) {
    console.error("Erreur scan image:", response.status, text);
    throw new Error(text || "Erreur analyse image repas");
  }

  return JSON.parse(text);
}

export async function registerUser(payload) {
  return apiPost("/users", payload);
}

export async function getUsers() {
  return apiGet("/users");
}

export async function createProfile(payload) {
  return apiPost("/profiles/", payload);
}

export async function getProfile(userId) {
  return apiGet(`/profiles/${userId}`);
}

export async function updateProfileApi(userId, payload) {
  return apiPut(`/profiles/${userId}`, payload);
}

export async function generateWorkoutPlan(payload) {
  return apiPost("/recommendations/workout", payload);
}

export async function generateNutritionPlan(payload) {
  return apiPost("/recommendations/nutrition", payload);
}

export async function getMealHistory(userId) {
  return apiGet(`/meals/history/${userId}`);
}

export async function saveMealAnalysis(payload) {
  return apiPost("/meals/analyze", payload);
}

export async function getDashboardSummary(userId) {
  return apiGet(`/kpis/dashboard/${userId}`);
}