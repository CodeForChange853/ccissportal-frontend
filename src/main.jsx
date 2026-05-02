// frontend/src/main.jsx
// PHASE A: Wrapped app with ThemeProvider so useTheme() works everywhere.
// PHASE 5: axe-core wired for dev-only accessibility scanning.

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";

// ── Accessibility audit (development only) ────────────────────────────────
// axe-core runs after every React render and logs violations to the browser
// console with element selectors, impact level, and fix guidance.
// Has zero effect in production builds (import.meta.env.PROD check).
if (import.meta.env.DEV) {
  import('@axe-core/react').then(({ default: axe }) => {
    axe(React, ReactDOM, 1000); // 1000ms debounce after renders
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);