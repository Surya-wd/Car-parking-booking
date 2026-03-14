import { auth } from "../js/firebase.js";
import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------------- ELEMENTS ---------------- */
const accountBox = document.getElementById("accountBox");
const authButtons = document.getElementById("authButtons");
const avatar = document.getElementById("avatar");

const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

/* ---------------- AVATAR DROPDOWN ---------------- */
if (avatar && accountBox) {
  avatar.addEventListener("click", () => {
    accountBox.classList.toggle("active");
  });

  document.addEventListener("click", (e) => {
    if (!accountBox.contains(e.target) && !avatar.contains(e.target)) {
      accountBox.classList.remove("active");
    }
  });
}

/* ---------------- AUTH STATE ---------------- */
onAuthStateChanged(auth, (user) => {
  if (user) {
    accountBox?.classList.remove("hidden");
    authButtons?.classList.add("hidden");
    userEmail.textContent = user.email;
  } else {
    accountBox?.classList.add("hidden");
    authButtons?.classList.remove("hidden");
  }
});

/* ---------------- LOGOUT ---------------- */
logoutBtn?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    alert("Logged out successfully");
    window.location.href = "../html/login.html";
  } catch (error) {
    console.error(error);
  }
});

/* ---------------- BOOK NOW BUTTON ---------------- */
document.getElementById("bookNowBtn")?.addEventListener("click", () => {
  window.location.href = "../html/book.html";
});


/* =====================================================
   🔁 DASHBOARD HOURLY / MONTHLY FUNCTION
===================================================== */

const hourlyTab = document.getElementById("hourlyTab");
const monthlyTab = document.getElementById("monthlyTab");

const hourlyFields = document.getElementById("hourlyFields");
const monthlyFields = document.getElementById("monthlyFields");

/* ✅ FIXED IDs (Matching Your HTML) */
const locationSelect = document.getElementById("location"); // correct
const hourDate = document.getElementById("hourDate");
const hourTime = document.getElementById("hourTime");
const monthlyPackage = document.getElementById("package"); // correct

const searchBtn = document.getElementById("searchNowBtn");

/* Default Mode */
let bookingMode = "hourly";

/* ---------- TAB SWITCH ---------- */
hourlyTab?.addEventListener("click", () => {
  bookingMode = "hourly";

  hourlyTab.classList.add("active");
  monthlyTab.classList.remove("active");

  hourlyFields.style.display = "flex";
  monthlyFields.style.display = "none";
});

monthlyTab?.addEventListener("click", () => {
  bookingMode = "monthly";

  monthlyTab.classList.add("active");
  hourlyTab.classList.remove("active");

  hourlyFields.style.display = "none";
  monthlyFields.style.display = "flex";
});

/* ---------- SEARCH BUTTON FIXED ---------- */
searchBtn?.addEventListener("click", (event) => {
  event.preventDefault();

  const location = locationSelect.value;

  /* ✅ Location Validation */
  if (!location) {
    alert("⚠ Please select a location");
    return;
  }

  /* ===============================
     ✅ HOURLY BOOKING FLOW
     Dashboard → Slot Page
  =============================== */
  if (bookingMode === "hourly") {
    if (!hourDate.value || !hourTime.value) {
      alert("⚠ Please select date and time");
      return;
    }

    const hourlyData = {
      mode: "hourly",
      location: location,
      date: hourDate.value,
      time: hourTime.value,
    };

    localStorage.setItem("bookingData", JSON.stringify(hourlyData));

    alert("✅ Hourly Booking Saved!");

    window.location.href = "../html/slot.html";
  }

  /* ===============================
     ✅ MONTHLY BOOKING FLOW
     Dashboard → Monthly Booking Page
  =============================== */
  if (bookingMode === "monthly") {
    if (!monthlyPackage.value) {
      alert("⚠ Please select a package");
      return;
    }

    const monthlyData = {
      mode: "monthly",
      location: location,
      months: monthlyPackage.value,
    };

    localStorage.setItem("monthlyData", JSON.stringify(monthlyData));

    alert("✅ Monthly Package Selected!");

    /* ✅ Redirect to Separate Monthly Page */
    window.location.href = "../html/monthly-booking.html";
  }
});

/* =====================================================
   🌗 THEME SYSTEM
===================================================== */

const themeSelect = document.getElementById("themeSelect");

function applyTheme(theme) {
  if (!theme) theme = "system";
  document.body.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

const savedTheme = localStorage.getItem("theme") || "system";
applyTheme(savedTheme);

if (themeSelect) themeSelect.value = savedTheme;

themeSelect?.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});