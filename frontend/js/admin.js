import { auth } from "./firebase.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const API_BASE = "http://127.0.0.1:5000/api";

/* =======================
   SECTIONS
======================= */
const bookingsSection = document.getElementById("bookingsSection");
const customersSection = document.getElementById("customersSection");
const monthlyBookingsSection = document.getElementById("monthlyBookingsSection");

const pageTitle = document.getElementById("pageTitle");

/* =======================
   TABLES
======================= */
const bookingsTable = document.getElementById("bookingsTable");
const customersTable = document.getElementById("customersTable");
const monthlyBookingsTable = document.getElementById("monthlyBookingsTable");

/* =======================
   AUTH CHECK
======================= */
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../html/login.html";
    return;
  }
  await showBookings();
});

/* =======================
   FORCE TOKEN REFRESH
======================= */
async function getAdminToken() {
  if (!auth.currentUser) throw new Error("Not logged in");
  return await auth.currentUser.getIdToken(true);
}

/* =======================
   SHOW BOOKINGS
======================= */
window.showBookings = async () => {
  pageTitle.textContent = "All Bookings";

  bookingsSection.style.display = "block";
  customersSection.style.display = "none";
  monthlyBookingsSection.style.display = "none";

  bookingsTable.innerHTML =
    `<tr><td colspan="7">Loading...</td></tr>`;

  try {
    const token = await getAdminToken();

    const res = await fetch(`${API_BASE}/admin/bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load bookings");

    bookingsTable.innerHTML = "";

    if (data.length === 0) {
      bookingsTable.innerHTML =
        `<tr><td colspan="7">No bookings</td></tr>`;
      return;
    }

    data.forEach(b => {
      const status = b.exit_time ? "🔴 Completed" : "🟢 Active";

      bookingsTable.innerHTML += `
        <tr>
          <td>${b.id}</td>
          <td>${b.firebase_uid}</td>
          <td>${b.slot_no}</td>
          <td>${b.vehicle_no}</td>
          <td>${new Date(b.booking_date).toLocaleDateString()}</td>
          <td>${status}</td>
          <td>
            ${b.exit_time ? "-" : `
              <button class="revoke-btn"
                onclick="revokeBooking(${b.id})">
                Revoke
              </button>
            `}
          </td>
        </tr>
      `;
    });

  } catch (err) {
    bookingsTable.innerHTML =
      `<tr><td colspan="7">${err.message}</td></tr>`;
  }
};

/* =======================
   REVOKE HOURLY BOOKING
======================= */
window.revokeBooking = async (bookingId) => {
  if (!confirm("Revoke this booking?")) return;

  try {
    const token = await getAdminToken();

    const res = await fetch(`${API_BASE}/admin/revoke-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ booking_id: bookingId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Revoke failed");

    alert(
      `Booking Revoked\nHours: ${data.total_hours}\nAmount: ₹${data.amount}`
    );

    showBookings();

  } catch (err) {
    alert(err.message);
  }
};

/* =======================
   SHOW MONTHLY BOOKINGS
======================= */
window.showMonthlyBookings = async () => {
  pageTitle.textContent = "Monthly Bookings";

  bookingsSection.style.display = "none";
  customersSection.style.display = "none";
  monthlyBookingsSection.style.display = "block";

  monthlyBookingsTable.innerHTML =
    `<tr><td colspan="10">Loading...</td></tr>`;

  try {
    const token = await getAdminToken();

    const res = await fetch(`${API_BASE}/admin/monthly-bookings`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load monthly bookings");

    monthlyBookingsTable.innerHTML = "";

    if (data.length === 0) {
      monthlyBookingsTable.innerHTML =
        `<tr><td colspan="10">No Monthly Bookings Found</td></tr>`;
      return;
    }

    data.forEach(m => {
      monthlyBookingsTable.innerHTML += `
        <tr>
          <td>${m.id}</td>
          <td>${m.firebase_uid}</td>
          <td>${m.customer_name}</td>
          <td>${m.email}</td>
          <td>${m.vehicle_no}</td>
          <td>${m.location}</td>
          <td>${m.package_months} Months</td>
          <td>₹${m.amount}</td>
          <td>${new Date(m.start_date).toLocaleDateString()}</td>
          <td>${new Date(m.end_date).toLocaleDateString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    monthlyBookingsTable.innerHTML =
      `<tr><td colspan="10">${err.message}</td></tr>`;
  }
};

/* =======================
   REVOKE MONTHLY BOOKING
======================= */
window.revokeMonthlyBooking = async (monthlyId) => {
  if (!confirm("Revoke this monthly pass?")) return;

  try {
    const token = await getAdminToken();

    const res = await fetch(`${API_BASE}/admin/revoke-monthly-booking`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ monthly_id: monthlyId })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Revoke failed");

    alert("Monthly booking revoked successfully");
    showMonthlyBookings();

  } catch (err) {
    alert(err.message);
  }
};

/* =======================
   SHOW CUSTOMERS
======================= */
window.showCustomers = async () => {
  pageTitle.textContent = "All Customers";

  bookingsSection.style.display = "none";
  customersSection.style.display = "block";
  monthlyBookingsSection.style.display = "none";

  customersTable.innerHTML =
    `<tr><td colspan="4">Loading...</td></tr>`;

  try {
    const token = await getAdminToken();

    const res = await fetch(`${API_BASE}/admin/customers`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to load customers");

    customersTable.innerHTML = "";

    data.forEach(u => {
      customersTable.innerHTML += `
        <tr>
          <td>${u.firebase_uid}</td>
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${new Date(u.created_at).toLocaleString()}</td>
        </tr>
      `;
    });

  } catch (err) {
    customersTable.innerHTML =
      `<tr><td colspan="4">${err.message}</td></tr>`;
  }
};

/* =======================
   LOGOUT
======================= */
window.logout = async () => {
  await auth.signOut();
  window.location.href = "../html/login.html";
};
