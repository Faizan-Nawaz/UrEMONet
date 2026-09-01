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
    fetchRecentActivityFromFirestore(user);
    populateAccountForm(user);
    loadMemberSince(user);
    loadUserStatsFromFirestore(user);

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
  const pathName = window.location.pathname.split("/").pop() || "index.html";

  if (pathName === "history.html" || document.getElementById("history-list")) {
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

  const cachedUsername = localStorage.getItem("username");
  const cachedEmail = localStorage.getItem("email");

  if (user) {
    const email = user.email || "User";
    const username = user.displayName || localStorage.getItem("username") || email.split("@")[0];

    localStorage.setItem("username", username);
    localStorage.setItem("email", email);

    if (loggedOut && loggedIn) {
      const avatarElem = document.getElementById("user-avatar");
      if (avatarElem) avatarElem.textContent = username.charAt(0).toUpperCase();

      const nameElem = document.getElementById("user-display-name");
      if (nameElem) nameElem.textContent = username;

      const emailElem = document.getElementById("user-email");
      if (emailElem) emailElem.textContent = email;

      loggedOut.style.display = "none";
      loggedIn.style.display = "flex";
    }

    updateProfilePageUI(username, email);
  } else if (cachedUsername) {
    if (loggedOut && loggedIn) {
      const avatarElem = document.getElementById("user-avatar");
      if (avatarElem) avatarElem.textContent = cachedUsername.charAt(0).toUpperCase();

      const nameElem = document.getElementById("user-display-name");
      if (nameElem) nameElem.textContent = cachedUsername;

      const emailElem = document.getElementById("user-email");
      if (emailElem) emailElem.textContent = cachedEmail || "";

      loggedOut.style.display = "none";
      loggedIn.style.display = "flex";
    }

    updateProfilePageUI(cachedUsername, cachedEmail || "");
  } else {
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    if (loggedOut && loggedIn) {
      loggedOut.style.display = "flex";
      loggedIn.style.display = "none";
    }

    if (document.getElementById("profile-display-name")) {
      window.location.href = "signup.html";
    }
  }

  const nav = document.getElementById("user-nav-status");
  if (nav) nav.style.visibility = "visible";
}

function updateProfilePageUI(username, email) {
  const nameElem = document.getElementById("profile-display-name");
  if (nameElem) nameElem.textContent = username;

  const emailElem = document.getElementById("profile-email");
  if (emailElem) emailElem.textContent = email;

  const avatarElem = document.getElementById("profile-avatar-large");
  if (avatarElem) avatarElem.textContent = username.charAt(0).toUpperCase();
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
      await user.updateProfile({ displayName: fullName });

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", fullName);
      localStorage.setItem("email", user.email);
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

// ── CARD VISIBILITY HELPER ──
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

  if (filePreviewEl) filePreviewEl.style.display = 'flex';

  if (detectBtn) {
    detectBtn.disabled = false;
    detectBtn.style.opacity = '1';
    detectBtn.style.cursor = 'pointer';
  }

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

  hideCard(document.getElementById('results-card'));
  hideCard(document.getElementById('loading-card'));
}

window.handleFile = handleFile;
window.clearFile = clearFile;

// ── DETECTION CONFIG ──
const API_BASE_URL = "http://127.0.0.1:8000";

async function runDetection() {
  if (!selectedFile) return;

  const resultsCard = document.getElementById("results-card");
  const loadingCard = document.getElementById("loading-card");
  const detectBtn = document.getElementById("detect-btn");

  hideCard(resultsCard);

  if (loadingCard) {
    showCard(loadingCard);
    loadingCard.scrollIntoView({ behavior: "smooth" });
  }

  if (detectBtn) {
    detectBtn.disabled = true;
    detectBtn.style.opacity = "0.6";
    detectBtn.style.cursor = "not-allowed";
  }

  const steps = ["step-video", "step-audio", "step-text", "step-fusion"];
  steps.forEach(stepId => {
    const step = document.getElementById(stepId);
    if (step) {
      step.style.color = "#9bb8a9";
      step.style.fontWeight = "400";
    }
  });

  const videoStep = document.getElementById("step-video");
  if (videoStep) {
    videoStep.style.color = "#22c55e";
    videoStep.style.fontWeight = "700";
  }

  try {
    const formData = new FormData();
    formData.append("file", selectedFile);

    setTimeout(() => {
      const audioStep = document.getElementById("step-audio");
      if (audioStep) {
        audioStep.style.color = "#22c55e";
        audioStep.style.fontWeight = "700";
      }
    }, 500);

    setTimeout(() => {
      const textStep = document.getElementById("step-text");
      if (textStep) {
        textStep.style.color = "#22c55e";
        textStep.style.fontWeight = "700";
      }
    }, 1000);

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      let errorMessage = "Prediction failed.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorMessage;
      } catch (e) {}
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log("Backend response:", data);

    const fusionStep = document.getElementById("step-fusion");
    if (fusionStep) {
      fusionStep.style.color = "#22c55e";
      fusionStep.style.fontWeight = "700";
    }

    showBackendResults(data);
  } catch (error) {
    console.error("Prediction Error:", error);
    hideCard(loadingCard);
    alert("Unable to analyze the video.\n\nError: " + error.message);
  } finally {
    if (detectBtn) {
      detectBtn.disabled = false;
      detectBtn.style.opacity = "1";
      detectBtn.style.cursor = "pointer";
    }
  }
}

window.runDetection = runDetection;

function showBackendResults(data) {
  const loadingCard = document.getElementById("loading-card");
  const resultsCard = document.getElementById("results-card");

  hideCard(loadingCard);

  const emotion = data.predicted_emotion || "Unknown";
  const probabilities = data.probabilities || {};
  const probabilityValues = Object.values(probabilities);

  const confidence = probabilityValues.length > 0 ? Math.max(...probabilityValues) * 100 : 0;

  const resultEmo = document.getElementById("result-emotion");
  const resultConf = document.getElementById("result-conf");
  const confFill = document.getElementById("conf-fill");

  if (resultEmo) resultEmo.textContent = emotion;
  if (resultConf) resultConf.textContent = confidence.toFixed(1) + "% confidence";

  if (confFill) {
    setTimeout(() => {
      confFill.style.width = confidence.toFixed(1) + "%";
    }, 100);
  }

  const videoRes = document.getElementById("mod-video-result");
  const videoPct = document.getElementById("mod-video-pct");
  const audioRes = document.getElementById("mod-audio-result");
  const audioPct = document.getElementById("mod-audio-pct");
  const textRes = document.getElementById("mod-text-result");
  const textPct = document.getElementById("mod-text-pct");

  if (videoRes) videoRes.textContent = "Analyzed";
  if (videoPct) videoPct.textContent = "—";
  if (audioRes) audioRes.textContent = "Analyzed";
  if (audioPct) audioPct.textContent = "—";
  if (textRes) textRes.textContent = "Analyzed";
  if (textPct) textPct.textContent = "—";

  const probsEl = document.getElementById("prob-bars");

  if (probsEl) {
    const emotionOrder = ["Anger", "Happy", "Love", "Neutral", "Sad"];

    probsEl.innerHTML = emotionOrder
      .filter(label => probabilities[label] !== undefined)
      .map(label => {
        const value = probabilities[label] * 100;
        const isTop = label.toLowerCase() === emotion.toLowerCase();

        return `
          <div class="prob-row" style="margin-bottom:0.8rem;">
            <div style="display:flex; justify-content:space-between; color:#f2f5ee; font-size:0.9rem; margin-bottom:0.3rem;">
              <span>${label}</span>
              <span>${value.toFixed(1)}%</span>
            </div>
            <div style="background:#1b3528; height:8px; border-radius:99px; overflow:hidden;">
              <div style="width:0%; height:100%; background:${isTop ? "#22c55e" : "#64748b"}; transition:width 0.8s ease;" data-value="${value}"></div>
            </div>
          </div>
        `;
      })
      .join("");

    setTimeout(() => {
      probsEl.querySelectorAll("[data-value]").forEach(bar => {
        bar.style.width = bar.dataset.value + "%";
      });
    }, 100);
  }

  console.log("Transcription:", data.transcription);

  if (resultsCard) {
    showCard(resultsCard);
    resultsCard.scrollIntoView({ behavior: "smooth" });
  }

  if (selectedFile && currentUser) {
    saveToFirestoreHistory(selectedFile.name, emotion, confidence.toFixed(1));
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
  hideCard(document.getElementById('loading-card'));
  hideCard(document.getElementById('results-card'));

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

  const activePath = window.location.pathname.split("/").pop() || "index.html";
  const navLinks = document.querySelectorAll(".nav-links a");

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === activePath) {
      link.classList.add("active");
    }
  });
});

function loadMemberSince(user) {
  const memberSinceEl = document.getElementById("stat-member-since");
  if (!memberSinceEl || !user || !user.metadata || !user.metadata.creationTime) return;

  const creationDate = new Date(user.metadata.creationTime);
  const formattedDate = creationDate.toLocaleDateString("en-US", {
    month: "short",
    year: "numeric"
  });

  memberSinceEl.textContent = formattedDate;
}

async function loadUserStatsFromFirestore(user) {
  if (!user) return;

  const totalDetectionsEl = document.getElementById("stat-total-detections");
  const emotionTextEl = document.getElementById("stat-emotion-text");

  try {
    const snapshot = await db.collection("history")
      .where("userId", "==", user.uid)
      .get();

    const totalCount = snapshot.size;
    if (totalDetectionsEl) {
      totalDetectionsEl.textContent = totalCount;
    }

    if (totalCount === 0) {
      if (emotionTextEl) emotionTextEl.textContent = "N/A";
      return;
    }

    const emotionCounts = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const emotion = data.emotion || data.predicted_emotion;
      if (emotion) {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
      }
    });

    let mostCommon = "--";
    let maxFreq = 0;
    for (const [emo, count] of Object.entries(emotionCounts)) {
      if (count > maxFreq) {
        maxFreq = count;
        mostCommon = emo;
      }
    }

    if (emotionTextEl) {
      emotionTextEl.textContent = mostCommon.charAt(0).toUpperCase() + mostCommon.slice(1);
    }
  } catch (error) {
    console.error("Error in loading state:", error);
  }
}

function populateAccountForm(user) {
  if (!user) return;

  const nameInput = document.getElementById("account-full-name");
  const emailInput = document.getElementById("account-email");

  const displayName = user.displayName || localStorage.getItem("username") || user.email.split("@")[0];

  if (nameInput) nameInput.value = displayName;
  if (emailInput) emailInput.value = user.email || "";
}

async function handleAccountSave(event) {
  event.preventDefault();

  if (!currentUser) {
    alert("Login first!");
    return;
  }

  const saveBtn = document.getElementById("save-account-btn");
  const nameInput = document.getElementById("account-full-name");
  const newPassInput = document.getElementById("account-new-password");
  const confirmPassInput = document.getElementById("account-confirm-password");

  const newName = nameInput ? nameInput.value.trim() : "";
  const newPassword = newPassInput ? newPassInput.value : "";
  const confirmPassword = confirmPassInput ? confirmPassInput.value : "";

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    let updated = false;

    if (newName && newName !== currentUser.displayName) {
      await currentUser.updateProfile({ displayName: newName });
      localStorage.setItem("username", newName);
      updated = true;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        throw new Error("New Password and Confirm Password do not match.");
      }
      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }

      await currentUser.updatePassword(newPassword);
      newPassInput.value = "";
      confirmPassInput.value = "";
      updated = true;
    }

    if (updated) {
      alert("Updated account details successfully!");
      updateUserUI(currentUser);
    } else {
      alert("Nothing changed.");
    }
  } catch (error) {
    console.error("Account update error:", error);
    if (error.code === 'auth/requires-recent-login') {
      alert("For security reasons you must log in again before changing your password.");
    } else {
      alert("Error: " + error.message);
    }
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Changes";
    }
  }
}

window.handleAccountSave = handleAccountSave;

async function handleSignOutAll() {
  const confirmSignOut = confirm("Do you want to sign out from all sessions?");
  if (!confirmSignOut) return;

  const btn = document.getElementById("sign-out-all-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Signing Out...";
  }

  try {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    localStorage.removeItem("email");

    await auth.signOut();
    window.location.href = "index.html";
  } catch (error) {
    console.error("Sign Out Error:", error);
    alert("Error in sign out: " + error.message);
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Sign Out All";
    }
  }
}
window.handleSignOutAll = handleSignOutAll;

async function handleDeleteAccount() {
  if (!currentUser) {
    alert("Login first!");
    return;
  }

  const confirmDelete = confirm(
    "WARNING: Are you sure you want to delete your account and all detection history? This action cannot be undone."
  );

  if (!confirmDelete) return;

  const btn = document.getElementById("delete-account-btn");
  if (btn) {
    btn.disabled = true;
    btn.textContent = "Deleting...";
  }

  try {
    const userId = currentUser.uid;

    const historySnapshot = await db.collection("history")
      .where("userId", "==", userId)
      .get();

    const batch = db.batch();
    historySnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    await currentUser.delete();

    localStorage.clear();

    alert("Your account and all detection history have been deleted successfully.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Account Deletion Error:", error);

    if (error.code === "auth/requires-recent-login") {
      alert("For security reasons, it is mandatory to log in again before deleting your account.");
    } else {
      alert("Error while deleting account: " + error.message);
    }

    if (btn) {
      btn.disabled = false;
      btn.textContent = "Delete";
    }
  }
}
window.handleDeleteAccount = handleDeleteAccount;

function timeAgo(date) {
  if (!date) return 'Just now';
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd ago';

  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h ago';

  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm ago';

  return 'Just now';
}

async function fetchRecentActivityFromFirestore(user) {
  const container = document.getElementById('recent-activity-list');
  if (!container || !user) return;

  try {
    const snapshot = await db.collection('history')
      .where('userId', '==', user.uid)
      .get();

    if (snapshot.empty) {
      container.innerHTML = '<div style="color:#9bb8a9; font-size:0.9rem; padding:0.5rem 0;">No recent activity found.</div>';
      return;
    }

    let docsArray = [];
    snapshot.forEach(doc => docsArray.push(doc.data()));

    docsArray.sort((a, b) => (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0));

    const recentItems = docsArray.slice(0, 3);

    let html = '';
    recentItems.forEach((item) => {
      const emoName = item.emotion || item.predicted_emotion || 'Unknown';
      const conf = item.conf || item.confidence || '--';

      let timeStr = 'Just now';
      if (item.timestamp) {
        timeStr = timeAgo(item.timestamp.toDate());
      }

      html += `
        <div class="activity-item">
          <div class="activity-emo">${emojiMap[emoName] || '🎭'}</div>
          <div class="txt">Detected <b>${emoName}</b> · ${conf}%</div>
          <div class="time">${timeStr}</div>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (error) {
    console.error("Recent Activity Fetch Error:", error);
    container.innerHTML = '<div style="color:#ef4444; font-size:0.85rem;">Failed to load activity.</div>';
  }
}