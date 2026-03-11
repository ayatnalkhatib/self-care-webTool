
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