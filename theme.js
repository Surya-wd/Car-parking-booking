const root = document.documentElement;
const themeSelect = document.getElementById("themeSelect");

/* ---------- APPLY THEME ---------- */
function applyTheme(theme) {
  if (theme === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.setAttribute("data-theme", prefersDark ? "dark" : "light");
  } else {
    root.setAttribute("data-theme", theme);
  }
}

/* ---------- LOAD SAVED THEME ---------- */
const savedTheme = localStorage.getItem("theme") || "system";
applyTheme(savedTheme);

if (themeSelect) {
  themeSelect.value = savedTheme;

  themeSelect.addEventListener("change", () => {
    const theme = themeSelect.value;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  });
}

/* ---------- LISTEN SYSTEM THEME CHANGE ---------- */
window.matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (localStorage.getItem("theme") === "system") {
      applyTheme("system");
    }
  });
