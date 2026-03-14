// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDunfXd51LIAJmgpRlyeB9j6FBkyIo-fnU",
  authDomain: "car-parking-92ea4.firebaseapp.com",
  projectId: "car-parking-92ea4", // ✅ FIXED (capital I)
  databaseURL: "https://car-parking-92ea4-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Export
export { app, auth, db };
