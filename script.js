const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

// Radio game elements
const radioGame = document.getElementById("radioGame");
const dialInput = document.getElementById("dialInput");
const dialWrap = document.getElementById("dialWrap");
const dialKnob = document.getElementById("dialKnob");
const radioNeedle = document.getElementById("radioNeedle");
const freqValue = document.getElementById("freqValue");
const radioMessage = document.getElementById("radioMessage");
const afterTuned = document.getElementById("afterTuned");
const inviteReveal = document.getElementById("inviteReveal");
const waveFlood = document.getElementById("waveFlood");

// Quiz elements
const quizOverlay = document.getElementById("quizOverlay");
const quizStartBtn = document.getElementById("quizStartBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const quizStartScreen = document.getElementById("quizStartScreen");
const quizQuestionsScreen = document.getElementById("quizQuestionsScreen");
const quizResultScreen = document.getElementById("quizResultScreen");
const quizBeginBtn = document.getElementById("quizBeginBtn");
const questionContainer = document.getElementById("questionContainer");
const currentQSpan = document.getElementById("currentQ");
const quizNameInput = document.getElementById("quizName");
const resultHeading = document.getElementById("resultHeading");
const resultImage = document.getElementById("resultImage");
const resultDescription = document.getElementById("resultDescription");
const resultAudio = document.getElementById("resultAudio");
const tryAgainBtn = document.getElementById("tryAgainBtn");
const backToInviteBtn = document.getElementById("backToInviteBtn");

const TARGET_FREQ = 103.5;

// Easier tuning (mobile-friendly)
const SUCCESS_TOLERANCE = 0.12;
const STATIC_FULL_AT = 1.6;

// Drag sensitivity
const DRAG_SENSITIVITY = 0.03;

const FREQ_MIN = 88.0;
const FREQ_MAX = 108.0;

// Snap settings
const SNAP_RANGE = 0.20;
const SNAP_STRENGTH = 0.18;
const SNAP_MAX_STEP = 0.08;

let musicStarted = false;
let tuned = false;
let musicPausedForQuiz = false;
let musicCurrentTime = 0;

// Quiz state
let currentQuestion = 0;
let userName = "";
let answers = [];
let quizActive = false;

// Song data
const songs = {
  "how-do-i-make-you-love-me": {
    name: "How Do I Make You Love Me?",
    image: "how-do-i-make-you-love-me.jpg",
    audio: "how-do-i-make-you-love-me.mp3",
    description: "You're the mysterious one. Introspective, deep, and always searching for connection beyond the surface.",
    lyric: "I see the real you"
  },
  "is-there-someone-else": {
    name: "Is There Someone Else?",
    image: "is-there-someone-else.jpg",
    audio: "is-there-someone-else.mp3",
    description: "You're the romantic skeptic. Passionate but cautious, you love hard but protect your heart.",
    lyric: "Cause I wanna be with you forever"
  },
  "less-than-zero": {
    name: "Less Than Zero",
    image: "less-than-zero.jpg",
    audio: "less-than-zero.mp3",
    description: "You're the free spirit. You value your independence and won't be tied down by anything or anyone.",
    lyric: "I try to fight, but I'd rather be free"
  },
  "moth-to-a-flame": {
    name: "Moth to a Flame",
    image: "moth-to-a-flame.jpg",
    audio: "moth-to-a-flame.mp3",
    description: "You're the irresistible force. Magnetic, alluring, and impossible to ignore. Dangerous but worth it.",
    lyric: "His love for you is true"
  },
  "sacrifice": {
    name: "Sacrifice",
    image: "sacrifice.jpg",
    audio: "sacrifice.mp3",
    description: "You're the main character. Smooth, confident, and a little dangerous. You own every room you enter.",
    lyric: "This life is still worth living"
  }
};

// Quiz questions
const questions = [
  {
    question: "If you had to pick one guilty-pleasure snack at midnight, what is it?",
    choices: [
      { text: "Chips + something spicy", song: "how-do-i-make-you-love-me" },
      { text: "Ice cream straight from the tub", song: "is-there-someone-else" },
      { text: "Chocolate/Sweets", song: "less-than-zero" },
      { text: "A sweet pastry / dessert", song: "moth-to-a-flame" },
      { text: "None of the above...I'm trying to be healthy", song: "sacrifice" }
    ]
  },
  {
    question: "Which language would you love to learn just for fun?",
    choices: [
      { text: "French", song: "how-do-i-make-you-love-me" },
      { text: "Spanish", song: "is-there-someone-else" },
      { text: "Italian", song: "less-than-zero" },
      { text: "Japanese", song: "moth-to-a-flame" },
      { text: "German", song: "sacrifice" }
    ]
  },
  {
    question: "Favorite genre of music",
    choices: [
      { text: "Pop", song: "how-do-i-make-you-love-me" },
      { text: "R&B", song: "is-there-someone-else" },
      { text: "80's and 90's", song: "less-than-zero" },
      { text: "Rap", song: "moth-to-a-flame" },
      { text: "Amapiano", song: "sacrifice" }
    ]
  },
  {
    question: "Which one of these places would you like to go to for vacation?",
    choices: [
      { text: "Tokyo", song: "how-do-i-make-you-love-me" },
      { text: "New York", song: "is-there-someone-else" },
      { text: "Rio", song: "less-than-zero" },
      { text: "Paris", song: "moth-to-a-flame" },
      { text: "Italy", song: "sacrifice" }
    ]
  },
  {
    question: "Pick a colour",
    choices: [
      { text: "Black", song: "how-do-i-make-you-love-me" },
      { text: "White", song: "is-there-someone-else" },
      { text: "Red", song: "less-than-zero" },
      { text: "Blue", song: "moth-to-a-flame" },
      { text: "Yellow", song: "sacrifice" }
    ]
  },
  {
    question: "Pick a Dawn FM lyric",
    choices: [
      { text: "How Do I Make You Love Me? – \"I see the real you\"", song: "how-do-i-make-you-love-me" },
      { text: "Is There Someone Else? – \"Cause I wanna be with you forever\"", song: "is-there-someone-else" },
      { text: "Less Than Zero – \"I try to fight, but I'd rather be free\"", song: "less-than-zero" },
      { text: "Moth to a Flame – \"His love for you is true\"", song: "moth-to-a-flame" },
      { text: "Sacrifice – \"This life is still worth living\"", song: "sacrifice" }
    ]
  }
];

// For knob dragging
let dragging = false;
let lastX = 0;
let currentFreq = parseFloat(dialInput?.value || "99.5");

// Prevent touch scrolling while locked
function preventScroll(e) {
  if (document.body.classList.contains("locked")) e.preventDefault();
}
window.addEventListener("touchmove", preventScroll, { passive: false });

/* ---------------- PAGE NAV (Page0 -> Page1) ---------------- */
function showOnlyPage(pageNumber) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const el = document.getElementById("page" + pageNumber);
  if (el) el.classList.add("active");
}

startBtn?.addEventListener("click", () => {
  showOnlyPage(1);
  startMusic();

  currentFreq = parseFloat(dialInput?.value || "99.5");
  updateRadioUI(currentFreq);
});

/* ---------------- MUSIC ---------------- */
function startMusic() {
  if (musicStarted || !music) return;

  music.volume = 0;
  music.play().catch(() => {});
  musicStarted = true;

  const fade = setInterval(() => {
    if (music.volume < 0.6) {
      music.volume = Math.min(0.6, music.volume + 0.05);
    } else {
      clearInterval(fade);
    }
  }, 180);
}

function pauseMusicForQuiz() {
  if (music && !music.paused) {
    musicCurrentTime = music.currentTime;
    music.pause();
    musicPausedForQuiz = true;
  }
}

function resumeMusicFromQuiz() {
  if (music && musicPausedForQuiz) {
    music.currentTime = musicCurrentTime;
    music.play().catch(() => {});
    musicPausedForQuiz = false;
  }
}

/* ---------------- HELPERS ---------------- */
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function quantizeToStep(v, step = 0.1) {
  return Math.round(v / step) * step;
}

/* ---------------- SNAP LOGIC ---------------- */
function applySoftSnap(freq) {
  if (tuned) return freq;

  const dist = TARGET_FREQ - freq;
  const abs = Math.abs(dist);

  if (abs > SNAP_RANGE) return freq;

  let pull = dist * SNAP_STRENGTH;
  pull = clamp(pull, -SNAP_MAX_STEP, SNAP_MAX_STEP);

  return freq + pull;
}

/* ---------------- RADIO UI ---------------- */
function setFreq(freq) {
  let next = clamp(freq, FREQ_MIN, FREQ_MAX);
  next = applySoftSnap(next);
  next = quantizeToStep(next, 0.1);

  currentFreq = next;
  if (dialInput) dialInput.value = currentFreq.toFixed(1);

  updateRadioUI(currentFreq);
}

function updateRadioUI(freq) {
  if (!freqValue || !dialKnob || !radioNeedle || !radioGame) return;

  const f = Math.round(freq * 10) / 10;
  freqValue.textContent = f.toFixed(1);

  const knobDeg = mapRange(f, FREQ_MIN, FREQ_MAX, -140, 140);
  dialKnob.style.transform = `rotate(${knobDeg}deg)`;

  const needlePct = mapRange(f, FREQ_MIN, FREQ_MAX, 0, 100);
  radioNeedle.style.left = `${needlePct}%`;

  const dist = Math.abs(f - TARGET_FREQ);
  const staticAmt = clamp(dist / STATIC_FULL_AT, 0, 1);

  radioGame.style.setProperty("--static", staticAmt.toFixed(3));
  radioGame.style.setProperty("--glow", (1 - staticAmt).toFixed(3));

  if (tuned) return;

  if (dist <= SUCCESS_TOLERANCE) {
    onTuneSuccess();
  } else {
    if (!radioMessage) return;

    if (dist < 0.25) radioMessage.textContent = "Almost… hold it steady";
    else if (dist < 0.8) radioMessage.textContent = "Close… keep tuning";
    else radioMessage.textContent = "STATIC… find 103.5";
  }
}

/* ---------------- SUCCESS ---------------- */
function onTuneSuccess() {
  tuned = true;

  radioGame?.classList.add("tuned");
  dialInput?.setAttribute("disabled", "true");
  dialWrap?.classList.add("locked");

  currentFreq = TARGET_FREQ;
  if (dialInput) dialInput.value = TARGET_FREQ.toFixed(1);
  if (freqValue) freqValue.textContent = TARGET_FREQ.toFixed(1);

  if (radioMessage) radioMessage.textContent = "103.5 Dawn FM — You're tuned in.";

  if (afterTuned) {
    afterTuned.setAttribute("aria-hidden", "false");
    afterTuned.classList.add("show");
  }

  setTimeout(() => {
    if (waveFlood) {
      waveFlood.setAttribute("aria-hidden", "false");
      waveFlood.classList.add("go");
    }
  }, 250);

  setTimeout(() => {
    if (inviteReveal) {
      inviteReveal.setAttribute("aria-hidden", "false");
      inviteReveal.classList.add("reveal");
    }
  }, 650);

  setTimeout(() => {
    finishGame();
  }, 5200);
}

/* ---------------- INPUT (fallback slider) ---------------- */
dialInput?.addEventListener("input", (e) => {
  if (tuned) return;
  const v = parseFloat(e.target.value);
  setFreq(v);
});

/* ---------------- SMOOTH KNOB DRAG ---------------- */
function getClientX(evt) {
  if (evt.touches && evt.touches[0]) return evt.touches[0].clientX;
  if (typeof evt.clientX === "number") return evt.clientX;
  return 0;
}

function startDrag(evt) {
  if (tuned) return;
  dragging = true;
  lastX = getClientX(evt);

  dialWrap?.classList.add("dragging");

  if (evt.pointerId && dialWrap?.setPointerCapture) {
    try { dialWrap.setPointerCapture(evt.pointerId); } catch {}
  }
}

function moveDrag(evt) {
  if (!dragging || tuned) return;

  const x = getClientX(evt);
  const dx = x - lastX;
  lastX = x;

  const next = currentFreq + (dx * DRAG_SENSITIVITY);
  setFreq(next);
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  dialWrap?.classList.remove("dragging");
}

if (dialWrap) {
  dialWrap.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    startDrag(e);
  });

  window.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    e.preventDefault();
    moveDrag(e);
  }, { passive: false });

  window.addEventListener("pointerup", endDrag);
  window.addEventListener("pointercancel", endDrag);

  dialWrap.addEventListener("touchstart", (e) => {
    e.preventDefault();
    startDrag(e);
  }, { passive: false });

  window.addEventListener("touchmove", (e) => {
    if (!dragging) return;
    e.preventDefault();
    moveDrag(e);
  }, { passive: false });

  window.addEventListener("touchend", endDrag);
}

/* ---------------- FINISH ---------------- */
function finishGame() {
  document.body.classList.remove("locked");
  document.body.classList.add("scroll-mode");

  const page2 = document.getElementById("page2");
  setTimeout(() => {
    page2?.scrollIntoView({ behavior: "smooth" });
  }, 250);
}

/* ---------------- QUIZ FUNCTIONS ---------------- */
function openQuiz() {
  pauseMusicForQuiz();
  quizOverlay.setAttribute("aria-hidden", "false");
  quizOverlay.classList.add("active");
  quizActive = true;
  
  // Reset quiz state
  currentQuestion = 0;
  answers = [];
  userName = "";
  quizNameInput.value = "";
  
  // Show start screen, hide others
  quizStartScreen.style.display = "block";
  quizQuestionsScreen.style.display = "none";
  quizResultScreen.style.display = "none";
  
  // Stop any playing result audio
  resultAudio.pause();
  resultAudio.currentTime = 0;
}

function closeQuiz() {
  quizOverlay.setAttribute("aria-hidden", "true");
  quizOverlay.classList.remove("active");
  quizActive = false;
  
  // Stop result audio
  resultAudio.pause();
  resultAudio.currentTime = 0;
  
  resumeMusicFromQuiz();
}

function beginQuiz() {
  userName = quizNameInput.value.trim() || "Guest";
  
  if (!userName) {
    alert("Please enter your name!");
    return;
  }
  
  quizStartScreen.style.display = "none";
  quizQuestionsScreen.style.display = "block";
  showQuestion(0);
}

function showQuestion(index) {
  currentQuestion = index;
  currentQSpan.textContent = index + 1;
  
  const q = questions[index];
  
  let html = `
    <div class="question-box">
      <h3 class="question-text">${q.question}</h3>
      <div class="choices-container">
  `;
  
  q.choices.forEach((choice, i) => {
    html += `
      <button class="choice-btn" data-song="${choice.song}" data-index="${i}">
        ${choice.text}
      </button>
    `;
  });
  
  html += `
      </div>
    </div>
    <div class="quiz-nav">
      ${index > 0 ? '<button class="nav-btn prev-btn" id="prevBtn">Previous</button>' : '<div></div>'}
      ${index === questions.length - 1 ? 
        '<button class="nav-btn reveal-btn" id="revealBtn" style="display: none;">Reveal my song</button>' : 
        '<button class="nav-btn next-btn" id="nextBtn" style="display: none;">Next</button>'}
    </div>
  `;
  
  questionContainer.innerHTML = html;
  
  // Add click handlers
  document.querySelectorAll(".choice-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      // Remove selected from all
      document.querySelectorAll(".choice-btn").forEach(b => b.classList.remove("selected"));
      // Add selected to clicked
      e.target.classList.add("selected");
      
      // Store answer
      answers[index] = e.target.dataset.song;
      
      // Show next/reveal button
      if (index === questions.length - 1) {
        document.getElementById("revealBtn").style.display = "inline-block";
      } else {
        document.getElementById("nextBtn").style.display = "inline-block";
      }
    });
  });
  
  // Next button
  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showQuestion(index + 1);
    });
  }
  
  // Previous button
  const prevBtn = document.getElementById("prevBtn");
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showQuestion(index - 1);
    });
  }
  
  // Reveal button
  const revealBtn = document.getElementById("revealBtn");
  if (revealBtn) {
    revealBtn.addEventListener("click", () => {
      showResult();
    });
  }
  
  // Restore previous selection if exists
  if (answers[index]) {
    const prevBtn = document.querySelector(`[data-song="${answers[index]}"]`);
    if (prevBtn) {
      prevBtn.classList.add("selected");
      if (index === questions.length - 1) {
        document.getElementById("revealBtn").style.display = "inline-block";
      } else {
        document.getElementById("nextBtn").style.display = "inline-block";
      }
    }
  }
}

function showResult() {
  // Calculate result
  const songCounts = {};
  answers.forEach(song => {
    songCounts[song] = (songCounts[song] || 0) + 1;
  });
  
  // Find song with max count
  let maxCount = 0;
  let resultSong = "";
  
  for (const [song, count] of Object.entries(songCounts)) {
    if (count > maxCount) {
      maxCount = count;
      resultSong = song;
    }
  }
  
  // If tie, pick first in answers
  if (!resultSong) resultSong = answers[0];
  
  const songData = songs[resultSong];
  
  // Update UI
  resultHeading.textContent = `${userName}, you Are ${songData.name}`;
  resultImage.src = songData.image;
  resultImage.alt = songData.name;
  resultDescription.textContent = songData.description;
  
  // Set up audio
  resultAudio.src = songData.audio;
  
  // Switch screens
  quizQuestionsScreen.style.display = "none";
  quizResultScreen.style.display = "block";
  
  // Play audio
  resultAudio.play().catch(() => {});
  
  // Scroll to show result
  setTimeout(() => {
    quizResultScreen.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function tryAgain() {
  // Reset and go back to start
  currentQuestion = 0;
  answers = [];
  resultAudio.pause();
  resultAudio.currentTime = 0;
  
  quizResultScreen.style.display = "none";
  quizStartScreen.style.display = "block";
  quizNameInput.value = userName;
}

/* ---------------- QUIZ EVENT LISTENERS ---------------- */
quizStartBtn?.addEventListener("click", openQuiz);
quizCloseBtn?.addEventListener("click", closeQuiz);
quizBeginBtn?.addEventListener("click", beginQuiz);
tryAgainBtn?.addEventListener("click", tryAgain);
backToInviteBtn?.addEventListener("click", () => {
  closeQuiz();
});

// Close on overlay click
quizOverlay?.addEventListener("click", (e) => {
  if (e.target === quizOverlay) {
    closeQuiz();
  }
});
