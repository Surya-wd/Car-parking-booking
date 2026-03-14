import { auth } from "../js/firebase";
import { signOut } from
"https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

logoutBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  await signOut(auth);
  window.location.href = "login.html";
});

