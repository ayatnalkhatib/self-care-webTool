import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const emailInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

function showLogin() {
  document.getElementById("loginSection").style.display = "block";
}

// Show/Hide Sections
const sections = ["loginSection" , "newUser" , "mainPage" , "wellnessTracker" , "journal" , "report" , "calander" ];

window.showSection = function(sectionId){
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) { // FIX: prevents crash if missing
      el.style.display = (id === sectionId) ? "block" : "none";
    }
  });
}

// update auth (LOGIN - FIXED ONLY ONE VERSION)
window.login = async function () {
  try{
    const userCredential = await signInWithEmailAndPassword(
      window.auth, 
      emailInput.value, 
      passwordInput.value
    ); 
    loginMessage.textContent = `Welcome back, ${userCredential.user.email}`;

    showSection("mainPage");
    
  } catch (error){
    loginMessage.textContent = error.message;
  }
};

// SIGNUP (FIXED ONLY ONE VERSION)
window.signup = async function() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passwordInput.value
    );
    loginMessage.textContent = `Sign up successful Welcome ${userCredential.user.email}`;

    showSection("newUser");

  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

window.logout = async function() {
  try {
    await signOut(window.auth);
    loginMessage.textContent = "Logged out successfully.";
    showSection("loginSection");
  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

// refresh with firebase (MERGED FIX - ONLY ONE LISTENER)
onAuthStateChanged(window.auth, (user => {
  if(user){
    const newUserCompleted = localStorage.getItem("newUserCompleted") === "true"; 
    
    if(newUserCompleted) showSection("mainPage"); 
    else showSection("newUser"); 

    if (loginMessage) {
      loginMessage.textContent = `Logged in as ${user.email}`; 
    }

    if (document.querySelector(".message")) {
      document.querySelector(".message").textContent =
        `Welcome, ${user.email}`;
    }

  } else{
    showSection("loginSection");
  }
}));

// buttons
const mainPageButtons = document.querySelectorAll("#mainPage button"); 

mainPageButtons.forEach(button => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("data-target"); 
    showSection(targetId);
  });
});

// back button 
const backButtons = document.querySelectorAll(".backToMain"); 

backButtons.forEach(button =>{
  button.addEventListener("click", () => {
    showSection("mainPage");
  });
});

// finish setup 
const finishBtn = document.getElementById("finishSetup");

if (finishBtn) {
  finishBtn.addEventListener("click", () => {
    localStorage.setItem("newUserCompleted", "true");
    showSection("mainPage");
  });
}


// avatar
function selectAvatar() {
  localStorage.setItem("selectedAvatar", "avatar");
  window.location.href = "main.html";
}