// ============================================================
// ZenFlow 3D - script.js (First Half)
// Core setup, 3D background, cursor, loading, state,
// theme, dashboard, and task management
// ============================================================

// ===== APP STATE (loads saved data from localStorage) =====
var STATE = {
  tasks: JSON.parse(localStorage.getItem('zf3d_tasks') || '[]'),
  focusMins: +(localStorage.getItem('zf3d_focusMins') || 0),
  breatheMins: +(localStorage.getItem('zf3d_breatheMins') || 0),
  sessions: +(localStorage.getItem('zf3d_sessions') || 0),
  streak: +(localStorage.getItem('zf3d_streak') || 0),
  lastDate: localStorage.getItem('zf3d_lastDate') || '',
  activeTab: 'daily',
  activeFilter: 'all'
};

// persist state to localStorage so data survives page refresh
function save() {
  localStorage.setItem('zf3d_tasks', JSON.stringify(STATE.tasks));
  localStorage.setItem('zf3d_focusMins', STATE.focusMins);
  localStorage.setItem('zf3d_breatheMins', STATE.breatheMins);
  localStorage.setItem('zf3d_sessions', STATE.sessions);
  localStorage.setItem('zf3d_streak', STATE.streak);
  localStorage.setItem('zf3d_lastDate', STATE.lastDate);
}

// check streak on load - reset if the user missed more than 1 day
(function checkStreak() {
  var today = new Date().toDateString();
  if (STATE.lastDate && STATE.lastDate !== today) {
    if ((new Date(today) - new Date(STATE.lastDate)) / 86400000 > 1) STATE.streak = 0;
  }
  if (!STATE.lastDate) STATE.lastDate = today;
  save();
})();

// bump streak whenever user completes an action (task, timer, breathe)
function bumpStreak() {
  var today = new Date().toDateString();
  if (STATE.lastDate !== today) {
    var diff = (new Date(today) - new Date(STATE.lastDate)) / 86400000;
    STATE.streak = diff <= 1 ? STATE.streak + 1 : 1;
    STATE.lastDate = today;
    save();
  }
}

// escape HTML to prevent XSS in user-entered task text
function escHTML(s) {
  var d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

// ===== INSPIRATIONAL QUOTES =====
var QUOTES = [
  { t: "The secret of getting ahead is getting started.", a: "Mark Twain" },
  { t: "Focus on being productive instead of busy.", a: "Tim Ferriss" },
  { t: "Almost everything will work again if you unplug it for a few minutes - including you.", a: "Anne Lamott" },
  { t: "You don't have to see the whole staircase, just take the first step.", a: "MLK Jr." },
  { t: "Your calm mind is the ultimate weapon against your challenges.", a: "Bryant McGill" },
  { t: "Start where you are. Use what you have. Do what you can.", a: "Arthur Ashe" }
];


// ============================================================
// THREE.JS - ANIMATED PARTICLE BACKGROUND
// Creates a floating particle field rendered on the bg-canvas
// ============================================================
(function initThreeBackground() {
  var canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 30;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // create particle geometry - 800 randomly placed points
  var count = 800;
  var positions = new Float32Array(count * 3);
  var colors = new Float32Array(count * 3);

  var purple = new THREE.Color(0xa855f7);
  var cyan = new THREE.Color(0x06b6d4);

  for (var i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 80;      // x
    positions[i * 3 + 1] = (Math.random() - 0.5) * 80;  // y
    positions[i * 3 + 2] = (Math.random() - 0.5) * 80;  // z

    // blend between purple and cyan randomly for each particle
    var mix = Math.random();
    var col = purple.clone().lerp(cyan, mix);
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  var material = new THREE.PointsMaterial({
    size: 0.15,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  var particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // mouse tracking for subtle parallax
  var mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', function (e) {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // handle window resize
  window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // animation loop
  function animate() {
    requestAnimationFrame(animate);
    particles.rotation.y += 0.0008;
    particles.rotation.x += 0.0003;
    // subtle camera drift following mouse
    camera.position.x += (mouseX * 3 - camera.position.x) * 0.02;
    camera.position.y += (-mouseY * 3 - camera.position.y) * 0.02;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  animate();
})();


// ============================================================
// CURSOR GLOW - radial gradient that follows the mouse
// ============================================================
(function initCursorGlow() {
  var glow = document.getElementById('cursor-glow');
  if (!glow) return;

  document.addEventListener('mousemove', function (e) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
    if (!glow.classList.contains('visible')) glow.classList.add('visible');
  });

  document.addEventListener('mouseleave', function () {
    glow.classList.remove('visible');
  });
})();


// ============================================================
// LOADING SCREEN - hide after a short delay
// ============================================================
window.addEventListener('load', function () {
  setTimeout(function () {
    var ls = document.getElementById('loading-screen');
    if (ls) ls.classList.add('hidden');
  }, 1800);
});


// ============================================================
// 3D TILT CARDS - hover parallax + shine effect
// Tracks mouse position on each .tilt-card and applies a
// subtle CSS transform + moves the .card-shine gradient
// ============================================================
(function initTiltCards() {
  var cards = document.querySelectorAll('.tilt-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -6;  // max 6 deg
      var rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) translateY(-4px)';

      // update shine position via CSS custom properties
      card.style.setProperty('--mouse-x', x + 'px');
      card.style.setProperty('--mouse-y', y + 'px');
    });

    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });
})();


// ============================================================
// SIDEBAR NAVIGATION - switch between views
// ============================================================
document.querySelectorAll('.nav-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var target = btn.dataset.view;
    // update active nav button
    document.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    // show matching view, hide others
    document.querySelectorAll('.view').forEach(function (v) {
      v.classList.toggle('active', v.id === 'view-' + target);
    });
    if (target === 'dashboard') refreshDashboard();
  });
});


// ============================================================
// THEME TOGGLE - dark / light mode with localStorage
// ============================================================
var themeToggle = document.getElementById('theme-toggle');
var moonSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"/></svg>';
var sunSvg = '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
  themeToggle.innerHTML = t === 'light' ? sunSvg : moonSvg;
}
applyTheme(localStorage.getItem('zf3d_theme') || 'dark');

themeToggle.addEventListener('click', function () {
  var next = document.body.classList.contains('light') ? 'dark' : 'light';
  localStorage.setItem('zf3d_theme', next);
  applyTheme(next);
});


// ============================================================
// DASHBOARD - greeting, date, stats, quote, upcoming tasks
// ============================================================
function refreshDashboard() {
  var h = new Date().getHours();
  var greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('greeting').textContent = greet;
  document.getElementById('date-display').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // count daily completed tasks
  var done = 0;
  for (var i = 0; i < STATE.tasks.length; i++) {
    if (STATE.tasks[i].type === 'daily' && STATE.tasks[i].done) done++;
  }

  document.getElementById('stat-completed').textContent = done;
  document.getElementById('stat-focus-mins').textContent = STATE.focusMins;
  document.getElementById('stat-streak-count').textContent = STATE.streak;
  document.getElementById('stat-breathe-mins').textContent = STATE.breatheMins;

  // random motivational quote
  var q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
  document.getElementById('quote-text').textContent = '"' + q.t + '"';
  document.getElementById('quote-author').textContent = '- ' + q.a;

  // upcoming (first 5 undone daily tasks)
  var upcoming = [];
  var list = document.getElementById('upcoming-list');
  for (var j = 0; j < STATE.tasks.length; j++) {
    if (!STATE.tasks[j].done && STATE.tasks[j].type === 'daily' && upcoming.length < 5) {
      upcoming.push(STATE.tasks[j]);
    }
  }
  if (!upcoming.length) {
    list.innerHTML = '<li class="empty-state">No tasks yet - add some!</li>';
    return;
  }
  var html = '';
  for (var k = 0; k < upcoming.length; k++) {
    html += '<li><span class="priority-dot ' + upcoming[k].priority + '"></span>' + escHTML(upcoming[k].text) + '</li>';
  }
  list.innerHTML = html;
}


// ============================================================
// TASK MANAGEMENT - add, toggle, delete, filter, render
// ============================================================
var taskInput = document.getElementById('task-input');
var taskList = document.getElementById('task-list');

// daily / weekly tab switching
document.querySelectorAll('.tab').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    STATE.activeTab = btn.dataset.tab;

    // move the tab slider
    var slider = document.getElementById('tab-slider');
    if (slider) {
      slider.classList.toggle('right', btn.dataset.tab === 'weekly');
    }
    renderTasks();
  });
});

// filter buttons (all / active / done)
document.querySelectorAll('.filter-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.filter-btn').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    STATE.activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

// add task via button or Enter key
document.getElementById('btn-add-task').addEventListener('click', addTask);
taskInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  var text = taskInput.value.trim();
  if (!text) return;
  STATE.tasks.push({
    id: Date.now(),
    text: text,
    priority: document.getElementById('task-priority').value,
    category: document.getElementById('task-category').value,
    type: STATE.activeTab,
    done: false
  });
  taskInput.value = '';
  save();
  renderTasks();
  bumpStreak();
}

// toggle and delete are on window so onclick attributes can call them
window.toggleTask = function (id) {
  var t = STATE.tasks.find(function (x) { return x.id === id; });
  if (t) { t.done = !t.done; save(); renderTasks(); }
};
window.deleteTask = function (id) {
  STATE.tasks = STATE.tasks.filter(function (x) { return x.id !== id; });
  save();
  renderTasks();
};

// builds the task list HTML based on active tab and filter
function renderTasks() {
  var filtered = [], total = 0, doneCount = 0;
  for (var i = 0; i < STATE.tasks.length; i++) {
    var t = STATE.tasks[i];
    if (t.type === STATE.activeTab) {
      total++;
      if (t.done) doneCount++;
      if (STATE.activeFilter === 'all' ||
          (STATE.activeFilter === 'active' && !t.done) ||
          (STATE.activeFilter === 'completed' && t.done)) {
        filtered.push(t);
      }
    }
  }

  // update progress bar
  var pct = total ? Math.round((doneCount / total) * 100) : 0;
  document.getElementById('task-progress-fill').style.width = pct + '%';
  document.getElementById('task-progress-text').textContent = doneCount + ' of ' + total + ' done';

  // render task items
  var emoji = { work: '🏢', personal: '🏠', health: '💪', learning: '📚' };
  var html = '';
  for (var k = 0; k < filtered.length; k++) {
    var t = filtered[k];
    html += '<li class="task-item ' + (t.done ? 'completed' : '') + '" style="animation-delay:' + (k * 0.05) + 's">' +
      '<button class="task-checkbox ' + (t.done ? 'checked' : '') + '" onclick="toggleTask(' + t.id + ')"></button>' +
      '<span class="task-text">' + escHTML(t.text) + '</span>' +
      '<div class="task-meta">' +
        '<span class="task-badge ' + t.category + '">' + (emoji[t.category] || '') + ' ' + t.category + '</span>' +
        '<span class="priority-dot ' + t.priority + '"></span>' +
      '</div>' +
      '<button class="task-delete" onclick="deleteTask(' + t.id + ')">✕</button>' +
    '</li>';
  }
  taskList.innerHTML = html;
}


// ===== INITIAL RENDER =====
refreshDashboard();
renderTasks();


// ============================================================
// FOCUS TIMER - Pomodoro with SVG ring progress
// CIRC = circumference of the SVG circle (2 × π × 120)
// ============================================================
var timerInterval = null;
var timerRemaining = 1500;   // 25 min default
var timerTotal = 1500;
var timerRunning = false;
var CIRC = 2 * Math.PI * 120;

var timerTimeEl = document.getElementById('timer-time');
var timerLabelEl = document.getElementById('timer-label');
var ringProgress = document.getElementById('ring-progress');
var btnStart = document.getElementById('btn-timer-start');

// set initial stroke dash so the ring is full
ringProgress.style.strokeDasharray = CIRC;

// timer tab switching (Focus 25 / Short 5 / Long 15)
var timerTabs = document.querySelectorAll('.timer-tab');
var timerTabSlider = document.querySelector('.timer-tab-slider');

timerTabs.forEach(function (tab, index) {
  tab.addEventListener('click', function () {
    if (timerRunning) return;     // lock tabs while running
    timerTabs.forEach(function (t) { t.classList.remove('active'); });
    tab.classList.add('active');

    // animate the slider to the correct position
    if (timerTabSlider) {
      timerTabSlider.style.transform = 'translateX(' + (index * 100) + '%)';
    }

    timerTotal = timerRemaining = (+tab.dataset.duration) * 60;
    updateTimerDisplay();
    timerLabelEl.textContent = 'Ready to focus';
  });
});

// start / pause button
btnStart.addEventListener('click', function () {
  timerRunning ? pauseTimer() : startTimer();
});
document.getElementById('btn-timer-reset').addEventListener('click', resetTimer);

function startTimer() {
  timerRunning = true;
  btnStart.innerHTML = '<svg class="play-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause';
  btnStart.classList.add('running');
  timerLabelEl.textContent = 'Focusing...';

  timerInterval = setInterval(function () {
    timerRemaining--;
    updateTimerDisplay();
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      btnStart.innerHTML = '<svg class="play-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg> Start';
      btnStart.classList.remove('running');
      timerLabelEl.textContent = 'Session complete!';

      // update stats
      STATE.sessions++;
      STATE.focusMins += Math.round(timerTotal / 60);
      save();
      document.getElementById('session-count').textContent = STATE.sessions;
      playChime();
      bumpStreak();
    }
  }, 1000);
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  btnStart.innerHTML = '<svg class="play-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg> Resume';
  btnStart.classList.remove('running');
  timerLabelEl.textContent = 'Paused';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  var activeDur = +document.querySelector('.timer-tab.active').dataset.duration;
  timerTotal = timerRemaining = activeDur * 60;
  btnStart.innerHTML = '<svg class="play-icon" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21"/></svg> Start';
  btnStart.classList.remove('running');
  timerLabelEl.textContent = 'Ready to focus';
  updateTimerDisplay();
}

// updates MM:SS text and the SVG ring offset
function updateTimerDisplay() {
  var m = Math.floor(timerRemaining / 60);
  var s = timerRemaining % 60;
  timerTimeEl.textContent = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  ringProgress.style.strokeDashoffset = CIRC * (1 - timerRemaining / timerTotal);
}

// show saved session count and initial display
document.getElementById('session-count').textContent = STATE.sessions;
updateTimerDisplay();


// ============================================================
// BREATHING EXERCISE - 3 patterns with animated phase cycling
// Each pattern defines durations (seconds) per phase
// ============================================================
var patterns = {
  '478': { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  'box': { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '22':  { inhale: 2, hold1: 0, exhale: 2, hold2: 0 }
};
var curPattern = patterns['478'];
var breatheRunning = false;
var breatheTimeout = null;
var breatheStart = 0;

var breatheCircle = document.getElementById('breathe-circle');
var breatheText = document.getElementById('breathe-text');
var breatheCounter = document.getElementById('breathe-counter');
var btnBreathe = document.getElementById('btn-breathe');

// pattern selection buttons
document.querySelectorAll('.pattern-btn').forEach(function (btn) {
  btn.addEventListener('click', function () {
    if (breatheRunning) return;
    document.querySelectorAll('.pattern-btn').forEach(function (b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
    curPattern = patterns[btn.dataset.pattern];
  });
});

// start / stop toggle
btnBreathe.addEventListener('click', function () {
  breatheRunning ? stopBreathe() : startBreathe();
});

function startBreathe() {
  breatheRunning = true;
  btnBreathe.textContent = 'Stop Session';
  btnBreathe.classList.add('active');
  breatheStart = Date.now();
  runCycle();
}

function stopBreathe() {
  breatheRunning = false;
  clearTimeout(breatheTimeout);
  btnBreathe.textContent = 'Begin Session';
  btnBreathe.classList.remove('active');
  breatheCircle.className = 'breathe-circle';
  breatheText.textContent = 'Tap to start';
  breatheCounter.textContent = '';

  // track mindful minutes
  var mins = Math.round((Date.now() - breatheStart) / 60000);
  if (mins > 0) {
    STATE.breatheMins += mins;
    save();
  }
  bumpStreak();
}

// builds a phase list and runs them in sequence, then loops
function runCycle() {
  if (!breatheRunning) return;
  var p = curPattern;
  var phases = [];
  phases.push({ name: 'Breathe in', cls: 'inhale', dur: p.inhale });
  if (p.hold1) phases.push({ name: 'Hold', cls: 'hold', dur: p.hold1 });
  phases.push({ name: 'Breathe out', cls: 'exhale', dur: p.exhale });
  if (p.hold2) phases.push({ name: 'Hold', cls: 'hold', dur: p.hold2 });

  var idx = 0;
  (function next() {
    if (!breatheRunning || idx >= phases.length) {
      if (breatheRunning) runCycle();    // loop back
      return;
    }
    var ph = phases[idx];
    breatheCircle.className = 'breathe-circle ' + ph.cls;
    breatheCircle.style.transitionDuration = ph.dur + 's';
    breatheText.textContent = ph.name;

    // countdown display
    var sec = ph.dur;
    breatheCounter.textContent = sec;
    var ci = setInterval(function () {
      sec--;
      if (sec <= 0) {
        clearInterval(ci);
        breatheCounter.textContent = '';
      } else {
        breatheCounter.textContent = sec;
      }
    }, 1000);

    breatheTimeout = setTimeout(function () {
      idx++;
      next();
    }, ph.dur * 1000);
  })();
}


// ============================================================
// AMBIENT SOUNDS - Web Audio API with gain nodes for volume
// ============================================================
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var activeSounds = {};   // tracks currently playing sounds

// CDN URLs for ambient MP3 loops
var soundBase = 'https://cdn.jsdelivr.net/gh/remvze/moodist@main/public/sounds';
var soundUrls = {
  rain:   soundBase + '/rain/light-rain.mp3',
  ocean:  soundBase + '/nature/waves.mp3',
  forest: soundBase + '/nature/jungle.mp3',
  fire:   soundBase + '/nature/campfire.mp3',
  wind:   soundBase + '/nature/wind.mp3',
  cafe:   soundBase + '/places/cafe.mp3'
};

// creates an Audio element routed through a gain node for smooth volume control
function playSound(type, vol) {
  var audio = new Audio(soundUrls[type]);
  audio.crossOrigin = 'anonymous';
  audio.loop = true;

  var src = audioCtx.createMediaElementSource(audio);
  var gain = audioCtx.createGain();
  gain.gain.value = 0;
  src.connect(gain);
  gain.connect(audioCtx.destination);

  audio.play().catch(function () {});
  // fade in over 1.5 seconds
  gain.gain.linearRampToValueAtTime(vol, audioCtx.currentTime + 1.5);
  return { audio: audio, gainNode: gain, source: src };
}

// fades out over 0.8s then disconnects and cleans up
function stopSound(type) {
  var s = activeSounds[type];
  if (!s) return;
  s.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
  s.gainNode.gain.setValueAtTime(s.gainNode.gain.value, audioCtx.currentTime);
  s.gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.8);

  setTimeout(function () {
    s.audio.pause();
    s.audio.src = '';
    try { s.source.disconnect(); } catch (e) {}
    try { s.gainNode.disconnect(); } catch (e) {}
    delete activeSounds[type];
  }, 900);
}

// sound card click / slider interaction
document.querySelectorAll('.sound-card').forEach(function (card) {
  var type = card.dataset.sound;
  var slider = card.querySelector('.sound-vol');

  // prevent slider clicks from toggling the sound
  slider.addEventListener('click', function (e) { e.stopPropagation(); });
  slider.addEventListener('mousedown', function (e) { e.stopPropagation(); });

  card.addEventListener('click', function (e) {
    if (e.target === slider || (e.target.closest && e.target.closest('.sound-vol'))) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    if (activeSounds[type]) {
      stopSound(type);
      card.classList.remove('active');
    } else {
      activeSounds[type] = playSound(type, slider.value / 100);
      card.classList.add('active');
    }
  });

  // real-time volume adjustment
  slider.addEventListener('input', function () {
    if (!activeSounds[type]) return;
    var g = activeSounds[type].gainNode;
    g.gain.cancelScheduledValues(audioCtx.currentTime);
    g.gain.setValueAtTime(g.gain.value, audioCtx.currentTime);
    g.gain.linearRampToValueAtTime(slider.value / 100, audioCtx.currentTime + 0.1);
  });
});

// stop all sounds button
document.getElementById('btn-stop-sounds').addEventListener('click', function () {
  Object.keys(activeSounds).forEach(function (k) { stopSound(k); });
  document.querySelectorAll('.sound-card').forEach(function (c) {
    c.classList.remove('active');
  });
});


// ============================================================
// CHIME - short two-tone oscillator played when timer finishes
// ============================================================
function playChime() {
  var osc = audioCtx.createOscillator();
  var g = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(830, audioCtx.currentTime);
  osc.frequency.setValueAtTime(1050, audioCtx.currentTime + 0.15);
  g.gain.setValueAtTime(0.3, audioCtx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.6);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
}
