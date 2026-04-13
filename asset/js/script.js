import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";


const emailInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

// sections 

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
    if (el) {
      el.style.display = (id === sectionId) ? "block" : "none";
    }
  });
};

// authencticatoion 
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
  try {
    await signOut(window.auth);

    loginMessage.textContent = "Logged out";

    showSection("loginSection");

  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

// setup

window.createUser = function () {
  const name = document.getElementById("nickname").value;

  if (!name) return;

  localStorage.setItem("username", name);
  localStorage.setItem("newUserCompleted", "true");

  showSection("mainPage");
  showWelcome();
};

//message 

function showWelcome() {
  const name = localStorage.getItem("username");
  const message = document.querySelector(".message");

  if (message && name) {
    message.textContent = `Welcome, ${name}! 👋`;
  }
}

// buttons

document.querySelectorAll(".backToMain").forEach(btn => {
  btn.addEventListener("click", () => {
    showSection("mainPage");
    showWelcome();
  });
});



onAuthStateChanged(window.auth, (user) => {
  if (user) {
    const completed =
      localStorage.getItem("newUserCompleted") === "true";

    if (completed) {
      showSection("mainPage");
    } else {
      showSection("newUser");
    }

    showWelcome();

  } else {
    showSection("loginSection");
  }
});

// avatar 

let selectedAnimal = null;

document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".animal").forEach(el => {
    el.addEventListener("click", () => {

      document.querySelectorAll(".animal")
        .forEach(a => a.classList.remove("selected"));

      el.classList.add("selected");

      selectedAnimal = el.dataset.animal;
      localStorage.setItem("animal", selectedAnimal);

      renderAnimal();
    });
  });

  renderAnimal(); 
});

function renderAnimal() {
  const animal = localStorage.getItem("animal");
  const display = document.getElementById("bearDisplay");

  if (!display) return;

  const emojiMap = {
    bear: "🐻",
    cat: "🐱",
    dog: "🐶",
    rabbit: "🐰",
    fox: "🦊",
    panda: "🐼",
    frog: "🐸",
    koala: "🐨",
    lion: "🦁",
    pig: "🐷"
  };

  display.textContent = animal ? emojiMap[animal] || "🐻" : "";
}


window.onload = function () {
  showWelcome();
  renderAnimal();
};