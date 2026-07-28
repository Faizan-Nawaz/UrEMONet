// ── THEME ENGINE ──
let isDark = localStorage.getItem('theme-preference') !== 'light';

function applyTheme() {
  const root = document.documentElement;
  
  if (isDark) {
    root.removeAttribute('data-theme'); // Dark mode CSS
  } else {
    root.setAttribute('data-theme', 'light'); // Light mode CSS
  }

  // Icons visibility
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

// Window scope par function attach taake inline onclick har haal mein chale
window.toggleTheme = toggleTheme;

// Page Load Event
document.addEventListener('DOMContentLoaded', () => {
  applyTheme();

  // Alternative safe listener binding
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
});

// ── NAVIGATION (In-Page Navigation Fallback) ──
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

    // Render history dynamically when switching tabs
    if (name === 'history') {
      renderHistory();
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

  // Reset old cards if re-uploading
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

// ── DETECTION (Demo simulation — Replace with real fetch to Flask API) ──
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
        prevStep.style.color = '#22c55e'; // Turn completed step green
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

// Demo result payload
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

  // Set Emotion Text & Confidence
  const resultEmo = document.getElementById('result-emotion');
  const resultConf = document.getElementById('result-conf');
  if (resultEmo) resultEmo.textContent = r.emotion;
  if (resultConf) resultConf.textContent = r.confidence + '% confidence';

  setTimeout(() => {
    const confFill = document.getElementById('conf-fill');
    if (confFill) confFill.style.width = r.confidence + '%';
  }, 100);

  // Set Modalities Output
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

  // Render Probability Bars
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

  // Animate progress bars
  setTimeout(() => {
    document.querySelectorAll('.prob-bar').forEach(b => {
      b.style.width = b.dataset.val + '%';
    });
  }, 100);

  // Save to LocalStorage History
  if (selectedFile) {
    addHistory(selectedFile.name, r.emotion, r.confidence);
  }
}

// ── HISTORY MANAGEMENT ──
const emojiMap = { Happy: '😊', Sad: '😢', Anger: '😡', Neutral: '😐', Love: '❤️' };
let historyItems = JSON.parse(localStorage.getItem('uremonet-history-data')) || [];

function addHistory(filename, emotion, conf) {
  historyItems.unshift({
    filename: filename,
    emotion: emotion,
    conf: conf,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  localStorage.setItem('uremonet-history-data', JSON.stringify(historyItems));
  renderHistory();
}

function renderHistory() {
  const empty = document.getElementById('history-empty');
  const list = document.getElementById('history-list');

  if (!empty || !list) return; // Safety check if user is not on history view

  if (historyItems.length === 0) {
    empty.style.display = 'block';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = 'flex';
  list.innerHTML = historyItems.map(item => `
    <div class="history-item" style="display:flex; align-items:center; justify-content:space-between; background:var(--dark-card, #12281c); padding:1rem 1.2rem; border-radius:12px; border:1px solid rgba(255,255,255,0.1); color:#f2f5ee;">
      <div style="display:flex; align-items:center; gap:1rem;">
        <div class="history-emo-badge" style="font-size:1.8rem;">${emojiMap[item.emotion] || '🎭'}</div>
        <div class="history-info">
          <p class="history-filename" style="font-weight:700; margin:0; color:#f2f5ee;">${item.filename}</p>
          <p class="history-meta" style="font-size:0.85rem; color:#9bb8a9; margin:0;">${item.time}</p>
        </div>
      </div>
      <div class="history-result" style="text-align:right;">
        <p class="history-emotion" style="font-weight:700; color:#86efac; margin:0;">${item.emotion}</p>
        <p class="history-conf" style="font-size:0.85rem; color:#9bb8a9; margin:0;">${item.conf}%</p>
      </div>
    </div>
  `).join('');
}

function clearAllHistory() {
  if (confirm("Do you want to clear all prediction history?")) {
    historyItems = [];
    localStorage.removeItem('uremonet-history-data');
    renderHistory();
  }
}

// ── DOM INITIALIZATION ──
document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme application
  applyTheme();

  // 2. Initial History Render
  renderHistory();

  // 3. Drag and Drop Auto-Binding for Upload Zone (if present)
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