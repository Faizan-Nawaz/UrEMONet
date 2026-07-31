// ── FIREBASE INITIALIZATION ──
const firebaseConfig = {
  apiKey: "AIzaSyBW7pQhdtZV9KNPzkKlHmjlsXrRdpcTdgI",
  authDomain: "uremonet.firebaseapp.com",
  projectId: "uremonet",
  storageBucket: "uremonet.firebasestorage.app",
  messagingSenderId: "718440674680",
  appId: "1:718440674680:web:a3c4b923cac5b9faf9c48d"
};

// Initialize Firebase safely
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// Track Active User
let currentUser = null;

auth.onAuthStateChanged((user) => {

  currentUser = user;

  if (user) {

    const username = user.displayName || user.email.split("@")[0];

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("email", user.email);

  } else {

    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

  }

  updateUserUI(user);

  // Current page detection
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  if (currentPath === "history.html" || document.getElementById("history-list")) {
    if (user) {
      fetchHistoryFromFirestore();
    } else {
      renderGuestHistoryNotice();
    }
  }

});

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

    const loggedOut = document.getElementById("logged-out-view");
    const loggedIn = document.getElementById("logged-in-view");

    if (!loggedOut || !loggedIn) return;

    // Instant UI from cache
    const cachedUsername = localStorage.getItem("username");

    if (!user && cachedUsername) {

        document.getElementById("nav-username").textContent = cachedUsername;
        document.getElementById("user-avatar").textContent =
            cachedUsername.charAt(0).toUpperCase();

        loggedOut.style.display = "none";
        loggedIn.style.display = "flex";
        return;
    }

    if (user) {

        const email = user.email || "User";
        const username = email.split("@")[0];

        // Save for next page load
        localStorage.setItem("username", username);

        document.getElementById("nav-username").textContent = username;
        document.getElementById("user-email").textContent = email;
        document.getElementById("user-avatar").textContent =
            username.charAt(0).toUpperCase();

        loggedOut.style.display = "none";
        loggedIn.style.display = "flex";

    } else {

        localStorage.removeItem("username");

        loggedOut.style.display = "flex";
        loggedIn.style.display = "none";

    }

    document.getElementById("user-nav-status").style.visibility = "visible";

}

// ── AUTHENTICATION FUNCTIONS ──
function handleSignup(event) {
  event.preventDefault();
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;

 const fullName = document.getElementById("signup-name").value;

auth.createUserWithEmailAndPassword(email, password)
.then(async (userCredential) => {

    const user = userCredential.user;

    await user.updateProfile({
        displayName: fullName
    });

    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("username", fullName);
    localStorage.setItem("email", user.email);

    window.location.href = "detect.html";

})
.catch((error) => {

    alert(error.message);

});
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  auth.signInWithEmailAndPassword(email, password)
  .then((userCredential) => {

  const user = userCredential.user;
  const username = user.displayName || user.email.split("@")[0];

  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("username", username);
  localStorage.setItem("email", user.email);

  window.location.href = "detect.html";
})
    .catch((error) => {
      alert("Login Error: " + error.message);
    });
}

function handleLogout() {

  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("username");
  localStorage.removeItem("email");

  auth.signOut().then(() => {
    window.location.href = "index.html";
  });

}

window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;

// ── CARD VISIBILITY HELPER (Mobile Overrides Safe) ──
function hideCard(card) {
  if (!card) return;
  card.style.display = 'none';
  card.classList.add('hidden');
  card.classList.remove('show-card');
}

function showCard(card) {
  if (!card) return;
  card.classList.remove('hidden');
  card.classList.add('show-card');
  card.style.display = 'block';
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
  }
  
  if (detectBtn) {
    detectBtn.disabled = false;
    detectBtn.style.opacity = '1';
    detectBtn.style.cursor = 'pointer';
  }

  // Hide loading and results cards safely
  hideCard(document.getElementById('results-card'));
  hideCard(document.getElementById('loading-card'));
}

function clearFile() {
  selectedFile = null;

  const fileInput = document.getElementById('file-input');
  const filePreviewEl = document.getElementById('file-preview');
  const detectBtn = document.getElementById('detect-btn');

  if (fileInput) fileInput.value = '';
  if (filePreviewEl) filePreviewEl.style.display = 'none';
  
  if (detectBtn) {
    detectBtn.disabled = true;
    detectBtn.style.opacity = '0.6';
    detectBtn.style.cursor = 'not-allowed';
  }
  
  // Hide loading and results cards safely
  hideCard(document.getElementById('results-card'));
  hideCard(document.getElementById('loading-card'));
}

window.handleFile = handleFile;
window.clearFile = clearFile;

// ── DETECTION ──
function runDetection() {
  if (!selectedFile) return;

  const resultsCard = document.getElementById('results-card');
  const loadingCard = document.getElementById('loading-card');
  const detectBtn = document.getElementById('detect-btn');

  // Hide results and show loading
  hideCard(resultsCard);
  
  if (loadingCard) {
    showCard(loadingCard);
    loadingCard.scrollIntoView({ behavior: 'smooth' });
  }
  
  if (detectBtn) detectBtn.disabled = true;

  const steps = ['step-video', 'step-audio', 'step-text', 'step-fusion'];
  let i = 0;

  function activateStep() {
    if (i > 0) {
      const prevStep = document.getElementById(steps[i - 1]);
      if (prevStep) {
        prevStep.style.color = '#22c55e';
      }
    }
    if (i < steps.length) {
      const currentStep = document.getElementById(steps[i]);
      if (currentStep) {
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
window.runDetection = runDetection;

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

  // Hide loading card
  hideCard(loadingCard);

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

  // Show Results Card
  if (resultsCard) {
    showCard(resultsCard);
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

  // SAVE TO FIRESTORE ONLY IF LOGGED IN
  if (selectedFile && currentUser) {
    saveToFirestoreHistory(selectedFile.name, r.emotion, r.confidence);
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
      list.style.flexDirection = 'column';

      let docsArray = [];
      querySnapshot.forEach(doc => docsArray.push(doc.data()));

      // Sort client-side safely without needing complex Firestore composite indexes
      docsArray.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

      let itemsHTML = '';
      docsArray.forEach((item) => {
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
    })
    .catch(err => {
      console.error("Firestore Fetch Error:", err);
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
      const batch = db.batch();
      snapshot.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    }).then(() => {
      fetchHistoryFromFirestore();
    });
  }
}
window.clearAllHistory = clearAllHistory;

// ── DOM INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {

  



  const loggedOut = document.getElementById("logged-out-view");
const loggedIn = document.getElementById("logged-in-view");
const nav = document.getElementById("user-nav-status");

const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
const username = localStorage.getItem("username");
const email = localStorage.getItem("email");

if (isLoggedIn) {

    document.getElementById("nav-username").textContent = username;
    document.getElementById("user-email").textContent = email;
    document.getElementById("user-avatar").textContent =
        username.charAt(0).toUpperCase();

    loggedOut.style.display = "none";
    loggedIn.style.display = "flex";

} else {

    loggedOut.style.display = "flex";
    loggedIn.style.display = "none";

}

nav.style.visibility = "visible";


  // Ensure cards start in clean state
  hideCard(document.getElementById('loading-card'));
  hideCard(document.getElementById('results-card'));

  // Drag and drop initialization
  const dropZone = document.getElementById('upload-zone');
  if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, e => e.preventDefault(), false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.style.borderColor = '#22c55e', false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => dropZone.style.borderColor = 'rgba(255, 255, 255, 0.2)', false);
    });

    dropZone.addEventListener('drop', e => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile({ target: { files: files } });
      }
    });
  }

  // Navbar Active Link Highlighting
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === currentPath) {
      link.classList.add("active");
    }
  });
});



