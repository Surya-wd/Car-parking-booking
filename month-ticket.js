const ticket = JSON.parse(localStorage.getItem("monthlyTicket"));

if (!ticket) {
  alert("⚠ No Ticket Found!");
  window.location.href = "../html/dashboard.html";
}

/* Show Ticket Data */
document.getElementById("ticketId").innerText = ticket.monthlyId;
document.getElementById("name").innerText = ticket.name;
document.getElementById("email").innerText = ticket.email;
document.getElementById("vehicle").innerText = ticket.vehicle;
document.getElementById("phone").innerText = ticket.phone;
document.getElementById("location").innerText = ticket.location;
document.getElementById("months").innerText = ticket.months + " Months";
document.getElementById("amount").innerText = "₹" + ticket.amount;

document.getElementById("startDate").innerText = ticket.startDate;
document.getElementById("endDate").innerText = ticket.endDate;
document.getElementById("days").innerText = ticket.totalDays + " Days";

/* Download PDF */
document.getElementById("downloadBtn").onclick = () => {
  window.open(
    `http://127.0.0.1:5000/api/monthly-ticket-pdf/${ticket.monthlyId}`,
    "_blank"
  );
};