const THEME_KEY = "healthai_theme";

export function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolveTheme(preference) {
  if (preference === "system" || !preference) {
    return getSystemTheme();
  }
  return preference;
}

export function applyTheme(resolved) {
  document.documentElement.setAttribute("data-theme", resolved);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", resolved === "dark" ? "#1a1816" : "#F8F5F0");
  }
}

export function loadThemePreference() {
  try {
    return localStorage.getItem(THEME_KEY) || "system";
  } catch {
    return "system";
  }
}

export function saveThemePreference(preference) {
  localStorage.setItem(THEME_KEY, preference);
}

export { THEME_KEY };
