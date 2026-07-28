// ── FIREBASE INITIALIZATION ──
// Replace these values with your own Firebase Console Config
const firebaseConfig = {
  apiKey: "AIzaSyBW7pQhdtZV9KNPzkKlHmjlsXrRdpcTdgI",
  authDomain: "uremonet.firebaseapp.com",
  projectId: "uremonet",
  storageBucket: "uremonet.firebasestorage.app",
  messagingSenderId: "718440674680",
  appId: "1:718440674680:web:a3c4b923cac5b9faf9c48d"
};


// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Track Active User
let currentUser = null;

auth.onAuthStateChanged((user) => {
  currentUser = user;
  updateUserUI(user);
  if (user) {
    fetchHistoryFromFirestore();
  } else {
    renderGuestHistoryNotice();
  }
});

// Update Navbar / UI based on Auth state
// Dropdown Toggle Functionality
function toggleUserDropdown() {
  const dropdown = document.getElementById('user-dropdown-menu');
  if (dropdown) {
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
  }
}
window.toggleUserDropdown = toggleUserDropdown;

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
  const container = document.getElementById('user-nav-status');
  const dropdown = document.getElementById('user-dropdown-menu');
  if (container && dropdown && !container.contains(e.target)) {
    dropdown.style.display = 'none';
  }
});

// Update Navbar / UI based on Auth state
function updateUserUI(user) {
  const userContainer = document.getElementById('user-nav-status');
  if (!userContainer) return;

  if (user) {
    const userEmail = user.email || 'User';
    const userName = userEmail.split('@')[0]; // Email se username banaya
    const initial = userName.charAt(0).toUpperCase(); // Pehla letter avatar ke liye

    userContainer.innerHTML = `
      <div onclick="toggleUserDropdown()" style="display:flex; align-items:center; gap:0.6rem; cursor:pointer; background:#12281c; padding:0.4rem 0.8rem; border-radius:99px; border:1px solid #22c55e; user-select:none;">
        <div style="width:32px; height:32px; border-radius:50%; background:#22c55e; color:#0e2a1a; font-weight:800; display:flex; align-items:center; justify-content:center; font-size:0.9rem;">
          ${initial}
        </div>
        <span style="color:#f2f5ee; font-weight:600; font-size:0.9rem;">${userName}</span>
        <span style="color:#22c55e; font-size:0.7rem;">▼</span>
      </div>

      <div id="user-dropdown-menu" style="display:none; position:absolute; top:120%; right:0; background:#12281c; border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:0.5rem; width:160px; box-shadow:0 10px 25px rgba(0,0,0,0.5); z-index:1000;">
        <div style="padding:0.5rem; border-bottom:1px solid rgba(255,255,255,0.1); margin-bottom:0.4rem;">
          <p style="margin:0; font-size:0.8rem; color:#9bb8a9;">Signed in as</p>
          <p style="margin:0; font-size:0.85rem; font-weight:700; color:#86efac; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${userEmail}</p>
        </div>
        <button onclick="handleLogout()" style="width:100%; text-align:left; background:transparent; color:#ef4444; border:none; padding:0.5rem; font-weight:600; font-size:0.9rem; cursor:pointer; border-radius:6px; display:flex; align-items:center; gap:0.5rem;">
          🚪 Log Out
        </button>
      </div>
    `;
  } else {
    userContainer.innerHTML = `
      <a href="login.html" style="color:#22c55e; font-weight:600; text-decoration:none; margin-right:12px;">Log In</a>
      <a href="signup.html" style="background:#22c55e; color:#0e2a1a; padding:0.5rem 1rem; border-radius:8px; font-weight:700; text-decoration:none;">Sign Up</a>
    `;
  }
}

// ── AUTHENTICATION FUNCTIONS ──
function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => {
      alert("Account created successfully!");
      window.location.href = "detect.html";
    })
    .catch((error) => {
      alert("Signup Error: " + error.message);
    });
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Logged in successfully!");
      window.location.href = "detect.html";
    })
    .catch((error) => {
      alert("Login Error: " + error.message);
    });
}

function handleLogout() {
  auth.signOut().then(() => {
    alert("Logged out!");
    window.location.reload();
  });
}

window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;


// ── THEME ENGINE ──
let isDark = localStorage.getItem('theme-preference') !== 'light';

function applyTheme() {
  const root = document.documentElement;
  if (isDark) {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', 'light');
  }

  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon = document.getElementById('theme-icon-sun');

  if (moonIcon && sunIcon) {
    moonIcon.style.display = isDark ? 'none' : 'inline-block';
    sunIcon.style.display  = isDark ? 'inline-block' : 'none';
  }
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
  applyTheme();
}

window.toggleTheme = toggleTheme;

// ── NAVIGATION ──
function showPage(name) {
  const pages = document.querySelectorAll('.page');
  const navBtns = document.querySelectorAll('.nav-links button, .nav-links a');

  if (pages.length > 0) {
    pages.forEach(p => p.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));
    
    const targetPage = document.getElementById('page-' + name);
    const targetNav = document.getElementById('nav-' + name);

    if (targetPage) targetPage.classList.add('active');
    if (targetNav) targetNav.classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (name === 'history') {
      if (currentUser) {
        fetchHistoryFromFirestore();
      } else {
        renderGuestHistoryNotice();
      }
    }
  }
}

// ── FILE HANDLING ──
let selectedFile = null;

function handleFile(e) {
  const file = e.target.files ? e.target.files[0] : (e.dataTransfer ? e.dataTransfer.files[0] : null);
  if (!file) return;

  selectedFile = file;

  const fileNameEl = document.getElementById('file-name');
  const fileSizeEl = document.getElementById('file-size');
  const filePreviewEl = document.getElementById('file-preview');
  const detectBtn = document.getElementById('detect-btn');

  if (fileNameEl) fileNameEl.textContent = file.name;
  if (fileSizeEl) fileSizeEl.textContent = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
  
  if (filePreviewEl) {
    filePreviewEl.style.display = 'flex';
    filePreviewEl.classList.add('show');
  }
  
  if (detectBtn) {
    detectBtn.disabled = false;
    detectBtn.style.opacity = '1';
    detectBtn.style.cursor = 'pointer';
  }

  const resultsCard = document.getElementById('results-card');
  const loadingCard = document.getElementById('loading-card');
  
  if (resultsCard) {
    resultsCard.style.display = 'none';
    resultsCard.classList.remove('show');
  }
  if (loadingCard) {
    loadingCard.style.display = 'none';
    loadingCard.classList.remove('show');
  }
}

function clearFile() {
  selectedFile = null;

  const fileInput = document.getElementById('file-input');
  const filePreviewEl = document.getElementById('file-preview');
  const detectBtn = document.getElementById('detect-btn');
  const resultsCard = document.getElementById('results-card');
  const loadingCard = document.getElementById('loading-card');

  if (fileInput) fileInput.value = '';
  
  if (filePreviewEl) {
    filePreviewEl.style.display = 'none';
    filePreviewEl.classList.remove('show');
  }
  
  if (detectBtn) {
    detectBtn.disabled = true;
    detectBtn.style.opacity = '0.6';
    detectBtn.style.cursor = 'not-allowed';
  }
  
  if (resultsCard) {
    resultsCard.style.display = 'none';
    resultsCard.classList.remove('show');
  }
  
  if (loadingCard) {
    loadingCard.style.display = 'none';
    loadingCard.classList.remove('show');
  }
}

// ── DETECTION (Demo simulation — Replace with Flask API endpoint when ready) ──
function runDetection() {
  if (!selectedFile) return;

  const resultsCard = document.getElementById('results-card');
  const loadingCard = document.getElementById('loading-card');
  const detectBtn = document.getElementById('detect-btn');

  if (resultsCard) {
    resultsCard.style.display = 'none';
    resultsCard.classList.remove('show');
  }
  
  if (loadingCard) {
    loadingCard.style.display = 'block';
    loadingCard.classList.add('show');
    loadingCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  if (detectBtn) detectBtn.disabled = true;

  const steps = ['step-video', 'step-audio', 'step-text', 'step-fusion'];
  let i = 0;

  function activateStep() {
    if (i > 0) {
      const prevStep = document.getElementById(steps[i - 1]);
      if (prevStep) {
        prevStep.classList.remove('active');
        prevStep.style.color = '#22c55e';
      }
    }
    if (i < steps.length) {
      const currentStep = document.getElementById(steps[i]);
      if (currentStep) {
        currentStep.classList.add('active');
        currentStep.style.color = '#22c55e';
        currentStep.style.fontWeight = '700';
      }
      i++;
      setTimeout(activateStep, 700);
    } else {
      setTimeout(showResults, 600);
    }
  }

  activateStep();
}

const DEMO_RESULT = {
  emotion: 'Sad',
  confidence: 72,
  modalities: {
    video: { emotion: 'Sad', conf: 65 },
    audio: { emotion: 'Sad', conf: 78 },
    text: { emotion: 'Neutral', conf: 51 },
  },
  probs: [
    { label: 'Sad', val: 72, top: true },
    { label: 'Neutral', val: 14, top: false },
    { label: 'Anger', val: 8, top: false },
    { label: 'Happy', val: 4, top: false },
    { label: 'Love', val: 2, top: false },
  ]
};

function showResults() {
  const r = DEMO_RESULT;

  const loadingCard = document.getElementById('loading-card');
  const resultsCard = document.getElementById('results-card');
  const detectBtn = document.getElementById('detect-btn');

  if (loadingCard) {
    loadingCard.style.display = 'none';
    loadingCard.classList.remove('show');
  }

  const resultEmo = document.getElementById('result-emotion');
  const resultConf = document.getElementById('result-conf');
  if (resultEmo) resultEmo.textContent = r.emotion;
  if (resultConf) resultConf.textContent = r.confidence + '% confidence';

  setTimeout(() => {
    const confFill = document.getElementById('conf-fill');
    if (confFill) confFill.style.width = r.confidence + '%';
  }, 100);

  const videoRes = document.getElementById('mod-video-result');
  const videoPct = document.getElementById('mod-video-pct');
  const audioRes = document.getElementById('mod-audio-result');
  const audioPct = document.getElementById('mod-audio-pct');
  const textRes = document.getElementById('mod-text-result');
  const textPct = document.getElementById('mod-text-pct');

  if (videoRes) videoRes.textContent = r.modalities.video.emotion;
  if (videoPct) videoPct.textContent = r.modalities.video.conf + '%';
  if (audioRes) audioRes.textContent = r.modalities.audio.emotion;
  if (audioPct) audioPct.textContent = r.modalities.audio.conf + '%';
  if (textRes) textRes.textContent = r.modalities.text.emotion;
  if (textPct) textPct.textContent = r.modalities.text.conf + '%';

  const probsEl = document.getElementById('prob-bars');
  if (probsEl) {
    probsEl.innerHTML = r.probs.map(p => `
      <div class="prob-row" style="margin-bottom: 0.8rem;">
        <div style="display:flex; justify-content:space-between; color:#f2f5ee; font-size:0.9rem; margin-bottom:0.3rem;">
          <span class="prob-label">${p.label}</span>
          <span class="prob-pct">${p.val}%</span>
        </div>
        <div class="prob-track" style="background:#1b3528; height:8px; border-radius:99px; overflow:hidden;">
          <div class="prob-bar ${p.top ? 'top' : ''}" style="width:0%; height:100%; background:${p.top ? '#22c55e' : '#64748b'}; transition: width 0.8s ease;" data-val="${p.val}"></div>
        </div>
      </div>
    `).join('');
  }

  if (resultsCard) {
    resultsCard.style.display = 'block';
    resultsCard.classList.add('show');
    resultsCard.scrollIntoView({ behavior: 'smooth' });
  }

  if (detectBtn) {
    detectBtn.disabled = false;
    detectBtn.style.opacity = '1';
    detectBtn.style.cursor = 'pointer';
  }

  setTimeout(() => {
    document.querySelectorAll('.prob-bar').forEach(b => {
      b.style.width = b.dataset.val + '%';
    });
  }, 100);

  // SAVE TO FIRESTORE ONLY IF USER IS LOGGED IN
  if (selectedFile && currentUser) {
    saveToFirestoreHistory(selectedFile.name, r.emotion, r.confidence);
  } else {
    console.log("Guest detection: Result displayed, but NOT saved to database.");
  }
}

// ── FIRESTORE HISTORY MANAGEMENT ──
const emojiMap = { Happy: '😊', Sad: '😢', Anger: '😡', Neutral: '😐', Love: '❤️' };

function saveToFirestoreHistory(filename, emotion, conf) {
  if (!currentUser) return;

  db.collection('history').add({
    userId: currentUser.uid,
    filename: filename,
    emotion: emotion,
    conf: conf,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
    console.log("Saved to Firebase Firestore!");
    fetchHistoryFromFirestore();
  }).catch(err => {
    console.error("Firestore Save Error: ", err);
  });
}

function fetchHistoryFromFirestore() {
  const empty = document.getElementById('history-empty');
  const list = document.getElementById('history-list');
  if (!list) return;

  if (!currentUser) {
    renderGuestHistoryNotice();
    return;
  }

  db.collection('history')
    .where('userId', '==', currentUser.uid)
    .get()
    .then((querySnapshot) => {
      if (querySnapshot.empty) {
        if (empty) empty.style.display = 'block';
        list.style.display = 'none';
        return;
      }

      if (empty) empty.style.display = 'none';
      list.style.display = 'flex';

      let itemsHTML = '';
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const dateStr = item.timestamp ? new Date(item.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now';

        itemsHTML += `
          <div class="history-item" style="display:flex; align-items:center; justify-content:space-between; background:var(--dark-card, #12281c); padding:1rem 1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1); color:#f2f5ee; margin-bottom: 0.8rem;">
            <div style="display:flex; align-items:center; gap:1rem;">
              <div class="history-emo-badge" style="font-size:1.8rem;">${emojiMap[item.emotion] || '🎭'}</div>
              <div class="history-info">
                <p class="history-filename" style="font-weight:700; margin:0; color:#f2f5ee;">${item.filename}</p>
                <p class="history-meta" style="font-size:0.85rem; color:#9bb8a9; margin:0;">${dateStr}</p>
              </div>
            </div>
            <div class="history-result" style="text-align:right;">
              <p class="history-emotion" style="font-weight:700; color:#86efac; margin:0;">${item.emotion}</p>
              <p class="history-conf" style="font-size:0.85rem; color:#9bb8a9; margin:0;">${item.conf}%</p>
            </div>
          </div>
        `;
      });
      list.innerHTML = itemsHTML;
    });
}

function renderGuestHistoryNotice() {
  const empty = document.getElementById('history-empty');
  const list = document.getElementById('history-list');

  if (empty) empty.style.display = 'none';
  if (list) {
    list.style.display = 'block';
    list.innerHTML = `
      <div style="text-align:center; padding:3rem 1rem; background:#12281c; border-radius:16px; border:1px solid rgba(255,255,255,0.1); color:#f2f5ee;">
        <h3 style="color:#22c55e; margin-bottom:0.5rem;">Guest Mode Active</h3>
        <p style="color:#9bb8a9; margin-bottom:1.5rem;">You are currently not logged in. Log in to save and view your emotion prediction history across devices.</p>
        <a href="login.html" style="background:#22c55e; color:#0e2a1a; padding:0.6rem 1.2rem; border-radius:8px; font-weight:700; text-decoration:none;">Log In Now</a>
      </div>
    `;
  }
}

function clearAllHistory() {
  if (!currentUser) return;
  if (confirm("Do you want to clear all your prediction history from database?")) {
    db.collection('history').where('userId', '==', currentUser.uid).get().then(snapshot => {
      snapshot.forEach(doc => doc.ref.delete());
      fetchHistoryFromFirestore();
    });
  }
}

// ── DOM INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();

  const dropZone = document.getElementById('upload-zone') || document.getElementById('drop-zone');
  if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => e.preventDefault(), false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.classList.remove('drag-over'), false);
    });

    dropZone.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile({ target: { files: files } });
      }
    });
  }
});

// Automatically set 'active' class on navbar links based on current page URL
document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    // Remove active class from all
    link.classList.remove("active");

    // Match link href with current URL
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
});