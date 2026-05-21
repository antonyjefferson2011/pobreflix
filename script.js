import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getDatabase, ref, set, onValue } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzqQmGpMz-7AYM7_Mpt2owpmf6BXjW1yk",
  authDomain: "nucisz.firebaseapp.com",
  databaseURL: "https://nucisz-default-rtdb.firebaseio.com",
  projectId: "nucisz",
  storageBucket: "nucisz.firebasestorage.app",
  messagingSenderId: "90824519141",
  appId: "1:90824519141:web:8ec5d6686c07cbbf94930c",
  measurementId: "G-BZ4S7Q3NM2"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db, ref, set, onValue };
