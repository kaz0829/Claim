import config from "./config.js";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import App from "./App.jsx";
import "./index.css";

const root = document.documentElement;
root.style.setProperty("--c-primary", config.primaryColor);
root.style.setProperty("--c-accent", config.accentColor);
root.style.setProperty("--c-bg", config.backgroundColor);
document.title = config.ui.pageTitle;

const description = document.createElement("meta");
description.name = "description";
description.content = config.tagline;
document.head.appendChild(description);

const theme = document.createElement("meta");
theme.name = "theme-color";
theme.content = config.backgroundColor;
document.head.appendChild(theme);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
