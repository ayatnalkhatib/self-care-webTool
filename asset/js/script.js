import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


let selectedDate = new Date().toISOString().split("T")[0];
let journalData = JSON.parse(localStorage.getItem("journalData")) || {};

const emailInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

//sections 

const sections = [
  "loginSection",
  "newUser",
  "mainPage",
  "wellnessTracker",
  "journal",
  "report",
  "calander"
];

window.showSection = function (sectionId) {
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = (id === sectionId) ? "" : "none";
  });

  // refresh journal when opened
  if (sectionId === "journal") {
    renderEntries(selectedDate);
  }
};

//authentication

window.login = async function () {
  try {
    const userCredential = await signInWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passwordInput.value
    );

    loginMessage.textContent = `Welcome back ${userCredential.user.email}`;
    showSection("mainPage");
    showWelcome();

  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

window.signup = async function () {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passwordInput.value
    );

    loginMessage.textContent = `Account created: ${userCredential.user.email}`;
    showSection("newUser");

  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

window.logout = async function () {
  await signOut(window.auth);
  loginMessage.textContent = "Logged out";
  showSection("loginSection");
};

//user 

window.createUser = function () {
  const name = document.getElementById("nickname").value;
  if (!name) return;

  localStorage.setItem("username", name);
  localStorage.setItem("newUserCompleted", "true");

  showSection("mainPage");
  showWelcome();
};

function showWelcome() {
  const name = localStorage.getItem("username");
  const message = document.querySelector(".message");

  if (message && name) {
    message.textContent = `Welcome, ${name}! 👋`;
  }
}

//back buttons 

document.querySelectorAll(".backToMain").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection("mainPage");
    showWelcome();
  });
});

//authenetication 

onAuthStateChanged(window.auth, (user) => {
  if (user) {
    const completed = localStorage.getItem("newUserCompleted") === "true";
    showSection(completed ? "mainPage" : "newUser");
    showWelcome();
  } else {
    showSection("loginSection");
  }
});

//avatar 

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".animal").forEach(el => {
    el.addEventListener("click", () => {
      document.querySelectorAll(".animal").forEach(a => a.classList.remove("selected"));
      el.classList.add("selected");

      localStorage.setItem("animal", el.dataset.animal);
      renderAnimal();
    });
  });

  renderAnimal();
});

function renderAnimal() {
  const animal = localStorage.getItem("animal");
  const display = document.getElementById("bearDisplay");

  const emojiMap = {
    bear: "🐻", cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊",
    panda: "🐼", frog: "🐸", koala: "🐨", lion: "🦁", pig: "🐷"
  };

  if (display) {
    display.textContent = animal ? emojiMap[animal] || "🐻" : "";
  }
}

//journal 

document.getElementById("entryForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const title = document.getElementById("entry-title").value;
  const entry = document.getElementById("entry").value;

  if (!journalData[selectedDate]) {
    journalData[selectedDate] = [];
  }

  journalData[selectedDate].push({
    title,
    text: entry,
    time: new Date().toLocaleTimeString()
  });

  localStorage.setItem("journalData", JSON.stringify(journalData));

  renderEntries(selectedDate);

  document.getElementById("entry-title").value = "";
  document.getElementById("entry").value = "";
});

function renderEntries(date) {
  const container = document.getElementById("entryResults");
  if (!container) return;

  container.innerHTML = "";

  const entries = journalData[date] || [];

  entries.forEach(e => {
    const div = document.createElement("div");
    div.classList.add("journal-entry");

    div.innerHTML = `
      <h3>${e.title}</h3>
      <p>${e.text}</p>
      <small>${e.time}</small>
    `;

    container.prepend(div);
  });
}

//calander 

window.openCalendar = function () {
  document.getElementById("calendarModal").classList.remove("hidden");
  generateCalendar();
};

window.closeCalendar = function () {
  document.getElementById("calendarModal").classList.add("hidden");
};

function generateCalendar() {
  const grid = document.getElementById("calendarGrid");
  grid.innerHTML = "";

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    grid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("div");
    cell.classList.add("day");
    cell.textContent = day;

    cell.addEventListener("click", () => {
      selectedDate = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      closeCalendar();
      renderEntries(selectedDate);
    });

    grid.appendChild(cell);
  }
}

// load default
window.onload = function () {
  showWelcome();
  renderAnimal();
  renderEntries(selectedDate);
};