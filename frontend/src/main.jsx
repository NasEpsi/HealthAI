import React from "react";
import ReactDOM from "react-dom/client";
import { StatusBar, Style } from "@capacitor/status-bar";
import { SplashScreen } from "@capacitor/splash-screen";
import App from "./App";
import { isNative } from "./utils/platform";
import { loadThemePreference, resolveTheme, applyTheme } from "./services/theme";
import "./style.css";

async function initNative() {
  if (!isNative) return;

  document.body.classList.add("native-app");

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#F8F5F0" });
    await SplashScreen.hide();
  } catch {
    /* plugins optionnels */
  }
}

initNative();
applyTheme(resolveTheme(loadThemePreference()));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
