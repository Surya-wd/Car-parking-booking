import { auth } from "./firebase.js";
import { onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const API_BASE = "https://car-parking-booking-production.up.railway.app";

/* =====================================================
   LOAD TICKET DATA SAFELY
===================================================== */
const ticketDataRaw = localStorage.getItem("ticketData");

if (!ticketDataRaw) {
  alert("No ticket data found. Please book again.");
  window.location.href = "../html/book.html";
}

const ticketData = JSON.parse(ticketDataRaw);

/* =====================================================
   FILL TICKET SAFELY
===================================================== */
function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.innerText = value || "-";
  }
}

setText("ticketId", "#" + (ticketData.ticketId || ""));
setText("userName", ticketData.email);
setText("vehicleNo", ticketData.vehicle);
setText("slotNo", ticketData.slot);
setText("date", ticketData.date);
setText("time", ticketData.time);

/* =====================================================
   SHOW MODAL
===================================================== */
const modal = document.getElementById("ticketModal");
if (modal) {
  modal.style.display = "flex";
}

/* =====================================================
   CLOSE BUTTON
===================================================== */
const closeBtn = document.getElementById("closeTicketBtn");
if (closeBtn) {
  closeBtn.onclick = () => {
    localStorage.removeItem("ticketData");
    window.location.href = "../html/dash.html";
  };
}

/* =====================================================
   PRINT
===================================================== */
const printBtn = document.getElementById("printBtn");
if (printBtn) {
  printBtn.onclick = () => window.print();
}

/* =====================================================
   FIREBASE AUTH CHECK
===================================================== */
let firebaseToken = null;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("Session expired. Please login again.");
    window.location.href = "../html/login.html";
    return;
  }

  firebaseToken = await user.getIdToken();
});

/* =====================================================
   DOWNLOAD PDF
===================================================== */
const downloadBtn = document.getElementById("downloadPdfBtn");

if (downloadBtn) {
  downloadBtn.onclick = async () => {
    try {
      if (!ticketData.ticketId) {
        alert("Invalid ticket ID");
        return;
      }

      const pdfUrl =
        ticketData.downloadUrl ||
        `${API_BASE}/api/ticket-pdf/${ticketData.ticketId}`;

      const res = await fetch(pdfUrl, {
        headers: firebaseToken
          ? { Authorization: `Bearer ${firebaseToken}` }
          : {}
      });

      if (!res.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `ticket_${ticketData.ticketId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("PDF download error:", err);
      alert("PDF download failed");
    }
  };
}

/* =====================================================
   GENERATE QR CODE
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const qrContainer = document.getElementById("qrcode");

  if (qrContainer && window.QRCode && ticketData.ticketId) {
    const scanUrl = `${API_BASE}/api/ticket-pdf/${ticketData.ticketId}`;

    new QRCode(qrContainer, {
      text: scanUrl,
      width: 150,
      height: 150
    });
  }
});
