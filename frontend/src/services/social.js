import { API_URL } from "../config";

function authHeaders(userId) {
  return {
    "Content-Type": "application/json",
    "X-User-Id": userId,
  };
}

async function handleResponse(res) {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Erreur serveur");
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchFeed(userId, page = 1, limit = 10) {
  const res = await fetch(`${API_URL}/posts?page=${page}&limit=${limit}`, {
    headers: authHeaders(userId),
  });
  return handleResponse(res);
}

export async function createPost(userId, data) {
  const res = await fetch(`${API_URL}/posts`, {
    method: "POST",
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updatePost(userId, postId, data) {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "PUT",
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deletePost(userId, postId) {
  const res = await fetch(`${API_URL}/posts/${postId}`, {
    method: "DELETE",
    headers: authHeaders(userId),
  });
  return handleResponse(res);
}

export async function likePost(userId, postId, userName) {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "POST",
    headers: authHeaders(userId),
    body: JSON.stringify({ user_name: userName }),
  });
  return handleResponse(res);
}

export async function unlikePost(userId, postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/like`, {
    method: "DELETE",
    headers: authHeaders(userId),
  });
  return handleResponse(res);
}

export async function fetchComments(postId) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`);
  return handleResponse(res);
}

export async function createComment(userId, postId, data) {
  const res = await fetch(`${API_URL}/posts/${postId}/comments`, {
    method: "POST",
    headers: authHeaders(userId),
    body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateComment(userId, commentId, content) {
  const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
    method: "PUT",
    headers: authHeaders(userId),
    body: JSON.stringify({ content }),
  });
  return handleResponse(res);
}

export async function deleteComment(userId, commentId) {
  const res = await fetch(`${API_URL}/posts/comments/${commentId}`, {
    method: "DELETE",
    headers: authHeaders(userId),
  });
  return handleResponse(res);
}

export async function fetchUserLikes(userId, page = 1, limit = 20) {
  const res = await fetch(
    `${API_URL}/posts/users/${userId}/likes?page=${page}&limit=${limit}`,
    { headers: authHeaders(userId) }
  );
  return handleResponse(res);
}
