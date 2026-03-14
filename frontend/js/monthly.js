import { auth } from "./firebase.js";
import {
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ================================
   LOAD MONTHLY PACKAGE DATA
================================ */

const monthlyData = JSON.parse(localStorage.getItem("monthlyData"));

if (!monthlyData) {
  alert("⚠ No Monthly Package Selected!");
  window.location.href = "../html/dashboard.html";
}

/* ================================
   SHOW PACKAGE DETAILS
================================ */

const locationText = document.getElementById("locationText");
const packageText = document.getElementById("packageText");
const priceText = document.getElementById("priceText");

let price = 0;

if (monthlyData.months == 1) price = 2000;
if (monthlyData.months == 6) price = 10000;
if (monthlyData.months == 12) price = 18000;

locationText.innerText = monthlyData.location;
packageText.innerText = `${monthlyData.months} Month Package`;
priceText.innerText = "₹" + price;

/* ================================
   FIREBASE TOKEN
================================ */

let firebaseToken = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Session expired. Please login again.");
    window.location.href = "../html/login.html";
    return;
  }

  firebaseToken = await user.getIdToken();
});

/* ================================
   CONFIRM MONTHLY BOOKING
================================ */

document.getElementById("monthlyForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("fullName").value;
  const vehicleNo = document.getElementById("vehicleNo").value;
  const phoneNo = document.getElementById("phoneNo").value;

  if (!firebaseToken) {
    alert("⚠ Authentication not ready. Try again.");
    return;
  }

  try {
    /* ================================
       SEND BOOKING DATA TO BACKEND
    ================================ */

const response = await fetch("http://127.0.0.1:5000/api/confirm-monthly-booking", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${firebaseToken}`,
  },
 body: JSON.stringify({
  customer_name: fullName,
  vehicle_no: vehicleNo,
  phone_no: phoneNo,   // 🔥 THIS LINE
  location: monthlyData.location,
  latitude: 0,
  longitude: 0,
  package_months: monthlyData.months,
  amount: price
})
,

});

const result = await response.json();

if (!response.ok) {
  alert("❌ Monthly Booking Failed!");
  console.error(result);
  return;
}


    /* ================================
       SAVE FULL TICKET DATA
    ================================ */

    const today = new Date();
    const startDate = today.toLocaleDateString();

    const endDateObj = new Date();
    endDateObj.setMonth(endDateObj.getMonth() + parseInt(monthlyData.months));

    const endDate = endDateObj.toLocaleDateString();

    const totalDays = Math.round(
      (endDateObj - today) / (1000 * 60 * 60 * 24)
    );

    const monthlyTicket = {
      monthlyId: result.monthly_id,
      bookingType: "Monthly",
      name: fullName,
      email: auth.currentUser.email,
      vehicle: vehicleNo,
      phone: phoneNo,
      location: monthlyData.location,
      months: monthlyData.months,
      amount: result.amount,
      startDate: startDate,
      endDate: endDate,
      totalDays: totalDays,
    };

    localStorage.setItem("monthlyTicket", JSON.stringify(monthlyTicket));

    alert("✅ Monthly Booking Confirmed!");

    /* ✅ Redirect to Ticket Page */
    window.location.href = "../html/month-ticket.html";

  } catch (err) {
    console.error("Monthly Booking Error:", err);
    alert("❌ Server Error! Try Again.");
  }
});