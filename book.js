import { auth } from "../js/firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------------- ELEMENTS ---------------- */
const checkBtn = document.getElementById("checkAvailabilityBtn");

/* ---------------- ACCOUNT UI FUNCTION ---------------- */
function setupAccountAvatar(user) {
  const userInfo = document.getElementById("userInfo");
  const avatar = document.getElementById("userAvatar");
  const dropdown = document.getElementById("accountDropdown");
  const dropdownEmail = document.getElementById("dropdownEmail");
  const dropdownUID = document.getElementById("dropdownUID");
  const logoutBtn = document.getElementById("logoutBtn");

  userInfo.style.display = "flex";
  dropdownEmail.textContent = user.email;
  dropdownUID.textContent = user.uid;
  avatar.src = user.photoURL || "../html/user.png";

  avatar.onclick = (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("hidden");
  };

  document.onclick = () => {
    dropdown.classList.add("hidden");
  };

  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = "../html/login.html";
  };
}

/* ---------------- AUTH CHECK ---------------- */
onAuthStateChanged(auth, (user) => {
  if (!user) {
    window.location.href = "../html/login.html";
    return;
  }

  setupAccountAvatar(user);
});

/* ---------------- CHECK AVAILABILITY ---------------- */
checkBtn.addEventListener("click", (e) => {
  e.preventDefault();

  const location = document.getElementById("location").value.trim();
  const vehicle = document.getElementById("vehicle").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if (!location || !vehicle || !date || !time) {
    alert("Please fill all fields");
    return;
  }

  localStorage.setItem("bookingData", JSON.stringify({
    location,
    vehicle,
    date,
    time,
    email: auth.currentUser.email
  }));

  window.location.href = "../html/slot.html";
});
