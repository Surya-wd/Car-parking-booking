// slot.js (CONNECTED TO RAILWAY BACKEND)

import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const API_BASE = "https://car-parking-booking-production.up.railway.app";

document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ slot.js loaded");

  const slotsContainer = document.getElementById("slots");
  const selectedSlotText = document.getElementById("selectedSlot");
  const confirmBtn = document.getElementById("confirmBtn");

  const userInfo = document.getElementById("userInfo");
  const userAvatar = document.getElementById("userAvatar");
  const dropdown = document.getElementById("accountDropdown");
  const dropdownEmail = document.getElementById("dropdownEmail");
  const dropdownUID = document.getElementById("dropdownUID");
  const logoutBtn = document.getElementById("logoutBtn");

  let currentUser = null;
  let selectedSlotId = null;
  let bookedSlots = [];

  confirmBtn.disabled = true;

  /* ---------------- BOOKING DATA ---------------- */
  const bookingDataRaw = localStorage.getItem("bookingData");

  if (!bookingDataRaw) {
    alert("❌ Booking data missing");
    window.location.replace("book.html");
    return;
  }

  const bookingData = JSON.parse(bookingDataRaw);

  /* ---------------- AUTH ---------------- */
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.replace("login.html");
      return;
    }

    currentUser = user;

    userInfo.style.display = "flex";
    dropdownEmail.textContent = user.email || "No email";
    dropdownUID.textContent = user.uid || "No UID";
    userAvatar.src = user.photoURL || "./user.png";

    userAvatar.onclick = (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("hidden");
    };

    document.onclick = () => dropdown.classList.add("hidden");

    logoutBtn.onclick = async () => {
      await signOut(auth);
      window.location.replace("login.html");
    };
  });

  /* ---------------- LOAD BOOKED SLOTS ---------------- */
 async function loadBookedSlots() {
  try {
    const url = `${API_BASE}/api/booked-slots?date=${encodeURIComponent(bookingData.date)}&location=${encodeURIComponent(bookingData.location)}`;

    const res = await fetch(url);
    const text = await res.text();

    if (!res.ok) {
      console.error("❌ booked-slots raw response:", text);
      bookedSlots = [];
      return;
    }

    const data = JSON.parse(text);
    bookedSlots = data.slots || [];
    console.log("✅ Booked slots:", bookedSlots);

  } catch (err) {
    console.error("❌ Error loading booked slots:", err);
    bookedSlots = [];
  }
}
  /* ---------------- RENDER SLOTS ---------------- */
  function renderSlots() {
    slotsContainer.innerHTML = "";

    for (let i = 1; i <= 40; i++) {
      const slotId = `S${i}`;
      const isBooked = bookedSlots.includes(slotId);

      const slot = document.createElement("div");
      slot.className = `slot ${isBooked ? "booked" : ""}`;
      slot.innerHTML = `<strong>${slotId}</strong>`;

      if (!isBooked) {
        slot.onclick = () => {
          document.querySelectorAll(".slot").forEach((s) => {
            s.classList.remove("selected");
          });

          slot.classList.add("selected");
          selectedSlotId = slotId;
          selectedSlotText.textContent = slotId;
          confirmBtn.disabled = false;
        };
      }

      slotsContainer.appendChild(slot);
    }
  }

  /* ---------------- CONFIRM BOOKING ---------------- */
  confirmBtn.onclick = async () => {
    if (!currentUser || !selectedSlotId) {
      alert("Select a slot first");
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerText = "Booking...";

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const token = await currentUser.getIdToken();

          const res = await fetch(`${API_BASE}/api/confirm-booking`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
              slot: selectedSlotId,
              vehicle: bookingData.vehicle,
              date: bookingData.date,
              location: bookingData.location,
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Booking failed");
          }

          console.log("✅ Booking Success:", data);

          localStorage.setItem("ticketData", JSON.stringify({
            ticketId: data.ticket_id,
            email: currentUser.email,
            vehicle: bookingData.vehicle,
            slot: selectedSlotId,
            location: bookingData.location,
            date: bookingData.date,
            time: bookingData.time,
            downloadUrl: data.download_url
          }));

          window.location.href = "ticket.html";

        } catch (err) {
          console.error("❌ Booking Error:", err);
          alert(err.message || "Something went wrong");
          confirmBtn.disabled = false;
          confirmBtn.innerText = "Book Now";
        }
      },
      () => {
        alert("❌ Location permission denied");
        confirmBtn.disabled = false;
        confirmBtn.innerText = "Book Now";
      }
    );
  };

  /* ---------------- INIT ---------------- */
  (async () => {
    await loadBookedSlots();
    renderSlots();
  })();
});
