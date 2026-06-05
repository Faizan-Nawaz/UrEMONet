// ── THEME ──
let dark = localStorage.getItem('theme-preference') === 'dark';
// 🚫 Removed the loose applyTheme() call from here to prevent execution order errors

function applyTheme() {
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
  
  // Guard clauses to make sure elements exist before changing styles
  const moonIcon = document.getElementById('theme-icon-moon');
  const sunIcon = document.getElementById('theme-icon-sun');
  
  if (moonIcon && sunIcon) {
    moonIcon.style.display = dark ? 'none' : 'block';
    sunIcon.style.display  = dark ? 'block' : 'none';
  }
}

function toggleTheme() {
  dark = !dark;
  // Save the selection to browser memory so other pages can see it
  localStorage.setItem('theme-preference', dark ? 'dark' : 'light');
  applyTheme();
}

// ── NAVIGATION (Retained for in-page logic fallback) ──
function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-links button').forEach(b => b.classList.remove('active'));
  
  document.getElementById('page-' + name).classList.add('active');
  document.getElementById('nav-' + name).classList.add('active');
  window.scrollTo(0, 0);

  // If the user navigates to the history tab, make sure we render the latest items
  if (name === 'history') {
    renderHistory();
  }
}

// ── FILE HANDLING ──
let selectedFile = null;
function handleFile(e) {
  const file = e.target.files[0];
  if (!file) return;
  selectedFile = file;
  document.getElementById('file-name').textContent = file.name;
  document.getElementById('file-size').textContent = (file.size / (1024*1024)).toFixed(2) + ' MB';
  document.getElementById('file-preview').classList.add('show');
  document.getElementById('detect-btn').disabled = false;
  document.getElementById('results-card').classList.remove('show');
  document.getElementById('loading-card').classList.remove('show');
}

function clearFile() {
  selectedFile = null;
  document.getElementById('file-input').value = '';
  document.getElementById('file-preview').classList.remove('show');
  document.getElementById('detect-btn').disabled = true;
  document.getElementById('results-card').classList.remove('show');
  document.getElementById('loading-card').classList.remove('show');
}

// ── DETECTION (demo simulation — replace with real fetch to Flask) ──
function runDetection() {
  if (!selectedFile) return;
  document.getElementById('results-card').classList.remove('show');
  document.getElementById('loading-card').classList.add('show');
  document.getElementById('detect-btn').disabled = true;

  const steps = ['step-video', 'step-audio', 'step-text', 'step-fusion'];
  let i = 0;
  function activateStep() {
    if (i > 0) document.getElementById(steps[i-1]).classList.remove('active');
    if (i < steps.length) {
      document.getElementById(steps[i]).classList.add('active');
      i++;
      setTimeout(activateStep, 900);
    } else {
      setTimeout(showResults, 600);
    }
  }
  activateStep();
}

// Demo result data — replace with real API response from Flask
const DEMO_RESULT = {
  emotion: 'Sad',
  confidence: 72,
  modalities: {
    video:  { emotion: 'Sad',     conf: 65 },
    audio:  { emotion: 'Sad',     conf: 78 },
    text:   { emotion: 'Neutral', conf: 51 },
  },
  probs: [
    { label: 'Sad',     val: 72, top: true  },
    { label: 'Neutral', val: 14, top: false },
    { label: 'Anger',   val:  8, top: false },
    { label: 'Happy',   val:  4, top: false },
    { label: 'Love',    val:  2, top: false },
  ]
};

function showResults() {
  const r = DEMO_RESULT;
  document.getElementById('loading-card').classList.remove('show');

  document.getElementById('result-emotion').textContent = r.emotion;
  document.getElementById('result-conf').textContent    = r.confidence + '% confidence';
  setTimeout(() => {
    const confFill = document.getElementById('conf-fill');
    if(confFill) confFill.style.width = r.confidence + '%';
  }, 100);

  document.getElementById('mod-video-result').textContent = r.modalities.video.emotion;
  document.getElementById('mod-video-pct').textContent    = r.modalities.video.conf + '%';
  document.getElementById('mod-audio-result').textContent = r.modalities.audio.emotion;
  document.getElementById('mod-audio-pct').textContent    = r.modalities.audio.conf + '%';
  document.getElementById('mod-text-result').textContent  = r.modalities.text.emotion;
  document.getElementById('mod-text-pct').textContent     = r.modalities.text.conf + '%';

  const probsEl = document.getElementById('prob-bars');
  probsEl.innerHTML = r.probs.map(p => `
    <div class="prob-row">
      <span class="prob-label">${p.label}</span>
      <div class="prob-track"><div class="prob-bar ${p.top ? 'top' : ''}" style="width:0%" data-val="${p.val}"></div></div>
      <span class="prob-pct">${p.val}%</span>
    </div>
  `).join('');

  document.getElementById('results-card').classList.add('show');
  document.getElementById('detect-btn').disabled = false;

  setTimeout(() => {
    document.querySelectorAll('.prob-bar').forEach(b => {
      b.style.width = b.dataset.val + '%';
    });
  }, 100);

  // Save to history
  addHistory(selectedFile.name, r.emotion, r.confidence);
}

// ── HISTORY ──
const emojiMap = { Happy:'😊', Sad:'😢', Anger:'😡', Neutral:'😐', Love:'❤️' };
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
  const list  = document.getElementById('history-list');
  if (!empty || !list) return; // safety check if not on history page
  
  if (historyItems.length === 0) {
    empty.style.display = 'block'; 
    list.style.display = 'none'; 
    return;
  }
  empty.style.display = 'none'; list.style.display = 'flex';
  list.innerHTML = historyItems.map(item => `
    <div class="history-item">
      <div class="history-emo-badge">${emojiMap[item.emotion] || '🎭'}</div>
      <div class="history-info">
        <p class="history-filename">${item.filename}</p>
        <p class="history-meta">${item.time}</p> </div>
      <div class="history-result">
        <p class="history-emotion">${item.emotion}</p>
        <p class="history-conf">${item.conf}%</p>
      </div>
    </div>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Re-apply theme icon states once the HTML elements are fully built in the DOM
  applyTheme();
  
  // 2. Render your history records if you are on the history page
  if (typeof renderHistory === 'function') {
    renderHistory();
  }
});

function clearAllHistory() {
  if (confirm("Kya aap saari history delete karna chahte hain?")) {
    historyItems = []; // Array clear kiya
    localStorage.removeItem('uremonet-history-data'); // Browser storage clear ki
    renderHistory(); // UI ko update kiya taake "No history yet" screen dikhe
  }
}