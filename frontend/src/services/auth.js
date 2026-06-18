import bcrypt from "bcryptjs";
import { storageGet, storageSet, storageRemove } from "./storage";

const USERS_KEY = "healthai_users";
const SESSION_KEY = "healthai_session";
const SALT_ROUNDS = 10;
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

async function getUsersMap() {
  const raw = await storageGet(USERS_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveUsersMap(users) {
  await storageSet(USERS_KEY, JSON.stringify(users));
}

async function createSession(userId, email) {
  const session = {
    userId,
    email,
    token: crypto.randomUUID(),
    expiresAt: Date.now() + SESSION_MS,
  };
  await storageSet(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function validatePassword(password) {
  if (!password || password.length < 8) {
    return "Le mot de passe doit contenir au moins 8 caractères.";
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return "Le mot de passe doit contenir au moins une lettre et un chiffre.";
  }
  return null;
}

export function validateEmail(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return "Adresse email invalide.";
  }
  return null;
}

export async function registerUser({ email, password, profile, avatar = null }) {
  const normalized = normalizeEmail(email);
  const emailError = validateEmail(normalized);
  if (emailError) throw new Error(emailError);

  const passwordError = validatePassword(password);
  if (passwordError) throw new Error(passwordError);

  const users = await getUsersMap();
  if (users[normalized]) {
    throw new Error("Un compte existe déjà avec cet email.");
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = crypto.randomUUID();

  users[normalized] = {
    id: userId,
    email: normalized,
    passwordHash,
    avatar,
    profile: { ...profile, email: normalized },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await saveUsersMap(users);
  await createSession(userId, normalized);
  return users[normalized];
}

export async function loginUser(email, password) {
  const normalized = normalizeEmail(email);
  const users = await getUsersMap();
  const user = users[normalized];

  if (!user) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw new Error("Email ou mot de passe incorrect.");
  }

  await createSession(user.id, normalized);
  return user;
}

export async function logoutUser() {
  await storageRemove(SESSION_KEY);
}

export async function getSession() {
  const raw = await storageGet(SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw);
    if (!session.expiresAt || Date.now() > session.expiresAt) {
      await storageRemove(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    await storageRemove(SESSION_KEY);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const users = await getUsersMap();
  const user = users[session.email];
  if (!user) {
    await storageRemove(SESSION_KEY);
    return null;
  }
  return user;
}

export async function updateUserProfile(email, profileUpdates) {
  const normalized = normalizeEmail(email);
  const users = await getUsersMap();
  const user = users[normalized];
  if (!user) throw new Error("Utilisateur introuvable.");

  users[normalized] = {
    ...user,
    profile: { ...user.profile, ...profileUpdates, email: normalized },
    updatedAt: new Date().toISOString(),
  };

  await saveUsersMap(users);
  return users[normalized];
}

export async function updateUserAvatar(email, avatar) {
  const normalized = normalizeEmail(email);
  const users = await getUsersMap();
  const user = users[normalized];
  if (!user) throw new Error("Utilisateur introuvable.");

  users[normalized] = {
    ...user,
    avatar,
    updatedAt: new Date().toISOString(),
  };

  await saveUsersMap(users);
  return users[normalized];
}

export async function changePassword(email, currentPassword, newPassword) {
  const normalized = normalizeEmail(email);
  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  const users = await getUsersMap();
  const user = users[normalized];
  if (!user) throw new Error("Utilisateur introuvable.");

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new Error("Mot de passe actuel incorrect.");

  users[normalized] = {
    ...user,
    passwordHash: await bcrypt.hash(newPassword, SALT_ROUNDS),
    updatedAt: new Date().toISOString(),
  };

  await saveUsersMap(users);
}

export function appDataKey(userId) {
  return `healthai_data_${userId}`;
}
