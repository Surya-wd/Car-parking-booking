import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithPopup,
  sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log("login.js loaded");

/* ---------- CONFIG ---------- */
const ADMIN_EMAILS = [
  "admin@system.com"
];

/* ---------- ELEMENTS ---------- */
const loginForm = document.getElementById("loginForm");
const errorMsg = document.getElementById("error-msg");
const googleLoginBtn = document.getElementById("googleLoginBtn");
const forgotPasswordLink = document.getElementById("forgotPassword");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

/* ---------- EMAIL LOGIN ---------- */
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMsg.style.color = "red";
    errorMsg.textContent = "";

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        emailInput.value.trim(),
        passwordInput.value
      );

      await handleRedirect(userCred.user);
    } catch (err) {
      console.error("Email login error:", err);
      errorMsg.textContent = "Invalid email or password.";
    }
  });
}

/* ---------- FORGOT PASSWORD (✅ FIXED) ---------- */
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();
    errorMsg.style.color = "red";
    errorMsg.textContent = "";

    const email = emailInput.value.trim();

    if (!email) {
      errorMsg.textContent = "Please enter your email to reset password.";
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      errorMsg.style.color = "green";
      errorMsg.textContent = "Password reset link sent to your email.";
    } catch (err) {
      console.error("Password reset error:", err);

      if (err.code === "auth/user-not-found") {
        errorMsg.textContent = "No account found with this email.";
      } else if (err.code === "auth/invalid-email") {
        errorMsg.textContent = "Invalid email address.";
      } else {
        errorMsg.textContent = "Failed to send reset email.";
      }
    }
  });
}

/* ---------- GOOGLE LOGIN ---------- */
const provider = new GoogleAuthProvider();

if (googleLoginBtn) {
  googleLoginBtn.addEventListener("click", async () => {
    errorMsg.style.color = "red";
    errorMsg.textContent = "";

    try {
      if (window.innerWidth > 768) {
        const result = await signInWithPopup(auth, provider);
        await handleRedirect(result.user);
      } else {
        await signInWithRedirect(auth, provider);
      }
    } catch (err) {
      console.error("Google login failed:", err);
      errorMsg.textContent = "Google login failed.";
    }
  });
}

/* ---------- HANDLE GOOGLE REDIRECT ---------- */
window.addEventListener("load", async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      await handleRedirect(result.user);
    }
  } catch (err) {
    console.error("Redirect login error:", err);
    if (err.code !== "auth/no-auth-event") {
      errorMsg.textContent = "Google login failed.";
    }
  }
});

/* ---------- ADMIN / USER REDIRECT ---------- */
async function handleRedirect(user) {
  try {
    const email = user?.email?.toLowerCase().trim() || "";
    const isAdmin = ADMIN_EMAILS.includes(email);

    localStorage.setItem("isAdmin", isAdmin ? "true" : "false");

    if (isAdmin) {
      window.location.replace("../html/admin.html");
    } else {
      window.location.replace("../html/dash.html");
    }
  } catch (err) {
    console.error("Redirect handling error:", err);
    errorMsg.textContent = "Login successful, but redirect failed.";
  }
}
