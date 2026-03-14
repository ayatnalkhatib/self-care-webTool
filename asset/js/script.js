
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const emailInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

function showLogin() {
  document.getElementById("loginSection").style.display = "block";
}

window.signup = async function() {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passwordInput.value
    );
    loginMessage.textContent = `Sign up successful! Welcome ${userCredential.user.email}`;
  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

window.login = async function() {
  try {
    const userCredential = await signInWithEmailAndPassword(
      window.auth,
      emailInput.value,
      passwordInput.value
    );
    loginMessage.textContent = `Welcome back, ${userCredential.user.email}`;
  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

window.logout = async function() {
  try {
    await signOut(window.auth);
    loginMessage.textContent = "Logged out successfully.";
    showLogin();
  } catch (error) {
    loginMessage.textContent = error.message;
  }
};

onAuthStateChanged(window.auth, (user) => {
  if(user) {
    loginMessage.textContent = `Logged in as ${user.email}`;
  } else {
    showLogin();
  }
});



// Show/Hide Sections

const sections = ["loginSection" , "newUser" , "mainPage" , "wellnessTracker" , "journal" , "report" , "calander" ]

function showSection(sectionId){
  sections.forEach(id => {
    document.getElementById(id).style.display = (id === sectionId) ? "block" : "none";
  });
}


// update auth

window.signup = async function () {
  try{
    const userCredential = await createUserWithEmailAndPassword(
      window.auth, 
      emailInput.value, 
      passwordInput.value
    );
    loginMessage.textContent = `Sign up sucessful Welcome ${userCredential.user.email}`; 

    // new user step up page
    showSection("newUser"); 
  } catch(error){
    loginMessage.textContent = error.message
  }
  
};

window.login = async function () {
  try{
    const userCredential = await signInWithEmailAndPassword(
      window.auth, 
      emailInput.value, 
      passwordInput.value
    ); 
    loginMessage.textContent = `Welcome back, ${userCredential.user.email}`;

    // main page
    showSection("mainPage");
    
  } catch (error){
    loginMessage.textContent = error.message;
  }
  
};

// refresh with firebase

onAuthStateChanged(window.auth, (user => {
  if(user){
    const newUserCompleted = localStorage.getItem("newUserCompleted") === "true"; 
    
    if(newUserCompleted) showSection("mainPage");
    else showSection("newUser"); 

    loginMessage.textContent = `Logged in as ${user.email}`; 
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
  button.addEventListener(button => {
    showSection("mainPage");
  });
});

// finish setup 
document.getElementById("finishSetup").addEventListener("click", () => {
  localStorage.setItem("newUserCompleted", "true");
  showSection("mainPage");
});

// logout button

onAuthStateChanged(window.auth, (user) => {
  if(user) {
    document.querySelector(".message").textContent =
      `Welcome, ${user.email}`;
  }
});