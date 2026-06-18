import { Preferences } from "@capacitor/preferences";
import { isNative } from "../utils/platform";

export async function storageGet(key) {
  if (isNative) {
    const { value } = await Preferences.get({ key });
    return value;
  }
  return localStorage.getItem(key);
}

export async function storageSet(key, value) {
  if (isNative) {
    await Preferences.set({ key, value });
    return;
  }
  localStorage.setItem(key, value);
}

export async function storageRemove(key) {
  if (isNative) {
    await Preferences.remove({ key });
    return;
  }
  localStorage.removeItem(key);
}

export function storageGetSync(key) {
  if (isNative) return null;
  return localStorage.getItem(key);
}

export function storageSetSync(key, value) {
  if (!isNative) localStorage.setItem(key, value);
}
