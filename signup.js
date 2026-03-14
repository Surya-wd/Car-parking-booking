import { auth } from "./firebase.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

async function register(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const errorMsg = document.getElementById("error-msg");

  if (!name) {
    errorMsg.textContent = "Name is required";
    return;
  }

  if (password !== confirmPassword) {
    errorMsg.textContent = "Passwords do not match";
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });

    const token = await userCredential.user.getIdToken();

    await fetch("http://127.0.0.1:5000/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ name, email })
    });

    window.location.href = "login.html";

  } catch (err) {
    errorMsg.textContent = err.message;
  }
}

window.register = register;
