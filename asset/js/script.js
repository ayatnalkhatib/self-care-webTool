import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

// storage

let selectedDate = new Date().toISOString().split("T")[0];
let currentMonth = new Date();
let journalData = JSON.parse(localStorage.getItem("journalData")) || {};
let wellnessData = JSON.parse(localStorage.getItem("wellnessData")) || {};
let wellnessChart = null;
let moodChart = null;

// changes between sections 

const sections = ["loginSection", "newUser", "mainPage", "wellnessTracker", "journal", "report", "calendar"];

window.showSection = function (sectionId) {
  const id = sectionId === 'calander' ? 'calendar' : sectionId;
  
  sections.forEach(s => {
    const el = document.getElementById(s);
    if (el) el.style.display = (s === id) ? "flex" : "none";
  });

  if (id === "journal") renderEntries(selectedDate);
  if (id === "calendar") renderPageCalendar();
  if (id === "report") renderReport('weekly');
};

// fire base auth 

window.login = async function () {
  const email = document.getElementById("usernameInput").value;
  const pass = document.getElementById("passwordInput").value;
  try {
    await signInWithEmailAndPassword(window.auth, email, pass);
  } catch (error) {
    document.getElementById("loginMessage").textContent = error.message;
  }
};

window.signup = async function () {
  const email = document.getElementById("usernameInput").value;
  const pass = document.getElementById("passwordInput").value;
  try {
    await createUserWithEmailAndPassword(window.auth, email, pass);
    window.showSection("newUser");
  } catch (error) {
    document.getElementById("loginMessage").textContent = error.message;
  }
};

window.logout = async function () {
  await signOut(window.auth);
  window.showSection("loginSection");
};

setTimeout(() => {
  if (window.auth) {
    onAuthStateChanged(window.auth, (user) => {
      if (user) {
        const completed = localStorage.getItem("newUserCompleted") === "true";
        window.showSection(completed ? "mainPage" : "newUser");
        showWelcome();
      } else {
        window.showSection("loginSection");
      }
    });
  }
}, 500);

// avatars
window.createUser = function() {
  const name = document.getElementById("nickname").value;
  if(!name) return alert("Please enter a name");
  localStorage.setItem("username", name);
  localStorage.setItem("newUserCompleted", "true");
  window.showSection("mainPage");
  showWelcome();
};

function showWelcome() {
  const name = localStorage.getItem("username");
  const msgEl = document.querySelector(".message");
  if (name && msgEl) msgEl.textContent = `Welcome, ${name}! 👋`;
  renderAnimal();
}

function renderAnimal() {
  const animal = localStorage.getItem("animal") || "bear";
  const display = document.getElementById("bearDisplay");
  const emojiMap = { bear: "🐻", cat: "🐱", dog: "🐶", rabbit: "🐰", fox: "🦊", panda: "🐼", frog: "🐸", koala: "🐨", lion: "🦁", pig: "🐷" };
  if (display) display.textContent = emojiMap[animal];
}

// wellness page 

document.addEventListener("click", function(e) {
  if (e.target && e.target.classList.contains("mood")) {
    document.querySelectorAll(".mood").forEach(m => m.classList.remove("selected"));
    e.target.classList.add("selected");
  }

  if (e.target && e.target.classList.contains("savedata")) {
    const moodEl = document.querySelector(".mood.selected");
    const currentMood = moodEl ? (moodEl.dataset.mood || moodEl.id || "okay") : "okay";
    const readingVal = document.querySelector('input[name="reading"]:checked')?.value || "no";

    wellnessData[selectedDate] = {
      water: document.getElementById("waterintake")?.value || "0",
      exercise: document.getElementById("exercise")?.value || "0",
      sleep: document.getElementById("sleep")?.value || "0",
      calories: document.getElementById("cal-intake")?.value || "0",
      hobby: document.getElementById("hobby")?.value || "",
      reading: readingVal,
      mood: currentMood
    };
    
    localStorage.setItem("wellnessData", JSON.stringify(wellnessData));
    displayStatusMessage(currentMood);
  }
});

function displayStatusMessage(mood) {
    const statusBox = document.getElementById("statusMessage");
    if (!statusBox) return;

    let title, message, color;

    if (mood === 'happy') {
        title = "Day Status: Great Day";
        message = "You showed up for yourself today. That kind of care builds strength over time. Keep going!";
        color = "#48bb78";
    } else if (mood === 'sad') {
        title = "Day Status: Bad Day";
        message = "It’s okay to move softly today. Rest, kindness, and patience are part of self-care too.";
        color = "#f56565";
    } else {
        title = "Day Status: Okay Day";
        message = "Some days are steady, not loud and that’s still growth. You’re moving forward in your own way.";
        color = "#5a67d8";
    }

    statusBox.innerHTML = `
        <div class="status-card" style="border-left: 8px solid ${color}; margin: 20px 0; padding: 15px; background: white; border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); animation: fadeIn 0.5s ease;">
            <h4 style="margin: 0 0 5px 0; color: ${color};">${title}</h4>
            <p style="margin: 0; font-size: 0.95rem; color: #4a5568; line-height: 1.4;">${message}</p>
        </div>
    `;
}

/// journal 
document.getElementById("entryForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const title = document.getElementById("entry-title").value;
  const text = document.getElementById("entry").value;
  if (!journalData[selectedDate]) journalData[selectedDate] = [];
  journalData[selectedDate].push({ title, text, time: new Date().toLocaleTimeString() });
  localStorage.setItem("journalData", JSON.stringify(journalData));
  renderEntries(selectedDate);
  e.target.reset();
});

function renderEntries(date) {
  const container = document.getElementById("entryResults");
  if (!container) return;
  container.innerHTML = "";
  (journalData[date] || []).forEach(e => {
    const div = document.createElement("div");
    div.className = "detail-box";
    div.style.marginBottom = "10px";
    div.innerHTML = `<strong>${e.title}</strong><p>${e.text}</p><small>${e.time}</small>`;
    container.prepend(div);
  });
}

// calanders 

window.openCalendar = () => {
    document.getElementById("calendarModal").classList.remove("hidden");
    generateModalCalendar();
};

window.closeCalendar = () => document.getElementById("calendarModal").classList.add("hidden");

function generateModalCalendar() {
    const grid = document.getElementById("calendarGrid");
    if (!grid) return;
    grid.innerHTML = "";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement("div");
        cell.classList.add("day");
        cell.textContent = day;
        const dateKey = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        if (journalData[dateKey]) cell.style.background = "#8290e0";
        cell.onclick = () => {
            selectedDate = dateKey;
            renderEntries(dateKey);
            window.closeCalendar();
        };
        grid.appendChild(cell);
    }
}

window.changeMonth = (step) => {
  currentMonth.setMonth(currentMonth.getMonth() + step);
  renderPageCalendar();
};

function renderPageCalendar() {
  const grid = document.getElementById("pageCalendarGrid");
  const label = document.getElementById("monthYear");
  if (!grid || !label) return;
  grid.innerHTML = "";
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  label.textContent = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(currentMonth);
  ['S','M','T','W','T','F','S'].forEach(d => {
    const head = document.createElement("div");
    head.className = "calendar-header-day";
    head.textContent = d;
    grid.appendChild(head);
  });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let i = 0; i < firstDay; i++) grid.appendChild(document.createElement("div"));
  for (let d = 1; d <= daysInMonth; d++) {
    const dayBtn = document.createElement("div");
    dayBtn.className = "day";
    dayBtn.textContent = d;
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (journalData[dateKey] || wellnessData[dateKey]) dayBtn.classList.add("has-data");
    dayBtn.onmouseover = () => showDayDetail(dateKey);
    dayBtn.onclick = () => showDayDetail(dateKey);
    grid.appendChild(dayBtn);
  }
}

function showDayDetail(date) {
  const detailDiv = document.getElementById("dayDetail");
  if (!detailDiv) return;
  const entries = journalData[date] || [];
  const well = wellnessData[date];
  let html = `<div class="detail-box"><h3>Records for ${date}</h3>`;
  if (well) html += `<div class="well-summary">💧 ${well.water}L | 😴 ${well.sleep}h | 🎭 ${well.mood}</div>`;
  if (entries.length > 0) {
      entries.forEach(e => html += `<div class="journal-item"><strong>${e.title}</strong>: ${e.text}</div>`);
  } else if (!well) {
      html += `<p style="font-size: 12px; color: #888;">No data for this date.</p>`;
  }
  detailDiv.innerHTML = html + `</div>`;
}

//report 

window.renderReport = function(type) {
    const days = type === 'weekly' ? 7 : 30;
    const labels = [];
    const sets = { water: [], sleep: [], exercise: [], calories: [], reading: 0, moods: { happy:0, okay:0, sad:0 }, hobbies: [] };

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        labels.push(key.split('-').slice(1).join('/'));
        
        const data = wellnessData[key] || {};
        sets.water.push(parseFloat(data.water) || 0);
        sets.sleep.push(parseFloat(data.sleep) || 0);
        sets.exercise.push(parseFloat(data.exercise) || 0);
        sets.calories.push(parseFloat(data.calories) || 0);
        if (data.reading === "yes") sets.reading++;
        if (data.mood) sets.moods[data.mood]++;
        if (data.hobby) sets.hobbies.push(data.hobby);
    }

    if (wellnessChart) wellnessChart.destroy();
    const ctx1 = document.getElementById('wellnessChart')?.getContext('2d');
    if (ctx1) {
        wellnessChart = new Chart(ctx1, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Water (L)', data: sets.water, borderColor: '#B8F2E6', tension: 0.3 },
                    { label: 'Sleep (H)', data: sets.sleep, borderColor: '#CDB4DB', tension: 0.3 },
                    { label: 'Exercise (M)', data: sets.exercise, borderColor: '#FFB7A5', tension: 0.3 }
                ]
            },
            options: { responsive: true }
        });
    }

    if (moodChart) moodChart.destroy();
    const ctx2 = document.getElementById('moodChart')?.getContext('2d');
    if (ctx2) {
        moodChart = new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Happy', 'Okay', 'Sad'],
                datasets: [{
                    data: [sets.moods.happy, sets.moods.okay, sets.moods.sad],
                    backgroundColor: ['#B8F2E6', '#CDB4DB', '#F7C8E0', '#edf2f7']
                }]
            }
        });
    }

    const summ = document.getElementById('statsSummary');
    if (summ) {
        summ.innerHTML = `
            <div class="well-summary" style="margin-top:15px;">
                📖 Read ${sets.reading} / ${days} days | 🔥 Avg Cal: ${(sets.calories.reduce((a,b)=>a+b,0)/days).toFixed(0)}
            </div>
        `;
    }
    const hob = document.getElementById('hobbyList');
    if (hob) {
        const uniqueHobbies = [...new Set(sets.hobbies)];
        hob.innerHTML = `<strong>Hobbies:</strong> ${uniqueHobbies.join(", ") || "None recorded"}`;
    }
};

// new user
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".backToMain").forEach(b => { b.onclick = () => window.showSection("mainPage"); });
  
  // Animal Selection
  document.querySelectorAll(".animal").forEach(a => {
    a.onclick = () => {
      document.querySelectorAll(".animal").forEach(x => x.classList.remove("selected"));
      a.classList.add("selected");
      localStorage.setItem("animal", a.dataset.animal);
    };
  });
  
  renderAnimal();
});