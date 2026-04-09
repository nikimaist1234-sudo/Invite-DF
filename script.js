const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");
const resultAudio = document.getElementById("resultAudio");

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

// Quiz elements (Kiss Land style)
const openQuizBtn = document.getElementById("openQuizBtn");
const quizBackBtn = document.getElementById("quizBackBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const quizRetryBtn = document.getElementById("quizRetryBtn");
const quizFinishBtn = document.getElementById("quizFinishBtn");

const quizScreen = document.getElementById("pageQuiz");
const quizForm = document.getElementById("quizForm");
const quizResult = document.getElementById("quizResult");
const quizResultInner = document.getElementById("quizResultInner");
const quizOverlay = document.getElementById("quizOverlay");
const resultCover = document.getElementById("resultCover");
const resultBlurb = document.getElementById("resultBlurb");
const guestNameInput = document.getElementById("guestName");

const TARGET_FREQ = 103.5;
const SUCCESS_TOLERANCE = 0.12;
const STATIC_FULL_AT = 1.6;
const DRAG_SENSITIVITY = 0.03;
const FREQ_MIN = 88.0;
const FREQ_MAX = 108.0;
const SNAP_RANGE = 0.20;
const SNAP_STRENGTH = 0.18;
const SNAP_MAX_STEP = 0.08;

let musicStarted = false;
let tuned = false;
let musicPausedForQuiz = false;
let musicCurrentTime = 0;

// Quiz state
let _scrollYBeforeQuiz = 0;
let _inviteWasPlaying = false;
let _inviteTime = 0;

// Song data
const SONG_KEYS = [
  "how-do-i-make-you-love-me",
  "is-there-someone-else",
  "less-than-zero",
  "moth-to-a-flame",
  "sacrifice"
];

const SONG_PRETTY = {
  "how-do-i-make-you-love-me": "How Do I Make You Love Me?",
  "is-there-someone-else": "Is There Someone Else?",
  "less-than-zero": "Less Than Zero",
  "moth-to-a-flame": "Moth to a Flame",
  "sacrifice": "Sacrifice"
};

const SONG_BLURB = {
  "how-do-i-make-you-love-me": "You're the mysterious one. Introspective, deep, and always searching for connection beyond the surface.",
  "is-there-someone-else": "You're the romantic skeptic. Passionate but cautious, you love hard but protect your heart.",
  "less-than-zero": "You're the free spirit. You value your independence and won't be tied down by anything or anyone.",
  "moth-to-a-flame": "You're the irresistible force. Magnetic, alluring, and impossible to ignore. Dangerous but worth it.",
  "sacrifice": "You're the main character. Smooth, confident, and a little dangerous. You own every room you enter."
};

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

function stopResultAudio() {
  if (!resultAudio) return;
  resultAudio.pause();
  resultAudio.currentTime = 0;
  resultAudio.removeAttribute("src");
}

function enterQuizAudioMode() {
  stopResultAudio();
  if (!music) return;
  _inviteWasPlaying = !music.paused;
  _inviteTime = music.currentTime || 0;
  music.pause();
}

function exitQuizAudioMode() {
  stopResultAudio();
  if (!music) return;
  if (_inviteWasPlaying) {
    try { music.currentTime = _inviteTime || 0; } catch (e) {}
    music.play().catch(() => {});
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

/* ---------------- QUIZ FUNCTIONS (Kiss Land Style) ---------------- */
function resetQuizUI() {
  quizForm?.reset();
  if (quizResult) quizResult.style.display = "none";
  if (quizResultInner) {
    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = "";
  }
  if (resultCover) {
    resultCover.classList.remove("show");
    resultCover.removeAttribute("src");
  }
  if (resultBlurb) resultBlurb.textContent = "";
  quizOverlay?.classList.remove("on");
}

function openQuiz() {
  _scrollYBeforeQuiz = window.scrollY || 0;
  enterQuizAudioMode();
  resetQuizUI();
  document.body.classList.add("quiz-open");
  quizScreen?.setAttribute("aria-hidden", "false");
  setTimeout(() => {
    if (quizScreen) quizScreen.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, 0);
}

function closeQuiz() {
  document.body.classList.remove("quiz-open");
  quizScreen?.setAttribute("aria-hidden", "true");
  stopResultAudio();
  setTimeout(() => {
    window.scrollTo({ top: _scrollYBeforeQuiz, behavior: "auto" });
  }, 0);
  exitQuizAudioMode();
}

function computeQuizResult() {
  if (!quizForm) return { error: "Quiz not found." };
  const guestName = (guestNameInput?.value || "").trim();
  if (!guestName) return { error: "Enter your name first." };
  const data = new FormData(quizForm);
  for (let i = 1; i <= 6; i++) {
    if (!data.get("q" + i)) return { error: "Answer all 6 questions first." };
  }
  const scores = Object.fromEntries(SONG_KEYS.map(k => [k, 0]));
  for (const [key, value] of data.entries()) {
    if (key === "guestName") continue;
    if (scores[value] !== undefined) scores[value] += 1;
  }
  const max = Math.max(...Object.values(scores));
  const top = Object.keys(scores).filter(k => scores[k] === max);
  const chosen = top[Math.floor(Math.random() * top.length)];
  return { chosen, guestName };
}

function playResultSong(songKey) {
  music?.pause();
  if (resultCover) {
    resultCover.src = `${songKey}.jpg`;
    resultCover.classList.add("show");
  }
  if (resultAudio) {
    resultAudio.pause();
    resultAudio.currentTime = 0;
    resultAudio.src = `${songKey}.mp3`;
    resultAudio.load();
    resultAudio.play().catch(() => {});
  }
}

function revealQuizResult(songKey, guestName) {
  if (!quizResult || !quizResultInner) return;
  quizResult.style.display = "block";
  quizResultInner.classList.remove("show");
  quizResultInner.innerHTML = `<h2>${guestName}, you are <span>${SONG_PRETTY[songKey] || "a Mystery Track"}</span></h2>`;
  if (resultBlurb) resultBlurb.textContent = SONG_BLURB[songKey] || "";
  if (quizOverlay) {
    quizOverlay.classList.add("on");
    setTimeout(() => quizOverlay.classList.remove("on"), 900);
  }
  requestAnimationFrame(() => quizResultInner.classList.add("show"));
  playResultSong(songKey);
  
  // Auto-scroll to show full result
  const scrollToFullResult = () => {
    quizResult.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => {
      window.scrollBy({ top: 140, left: 0, behavior: "smooth" });
    }, 350);
    setTimeout(() => {
      window.scrollBy({ top: 80, left: 0, behavior: "smooth" });
    }, 900);
  };
  setTimeout(scrollToFullResult, 180);
  if (resultCover) {
    resultCover.onload = () => setTimeout(scrollToFullResult, 80);
  }
}

/* ---------------- QUIZ EVENT LISTENERS ---------------- */
openQuizBtn?.addEventListener("click", openQuiz);
quizBackBtn?.addEventListener("click", closeQuiz);
quizCloseBtn?.addEventListener("click", closeQuiz);

quizRetryBtn?.addEventListener("click", () => {
  resetQuizUI();
  stopResultAudio();
  if (quizScreen) quizScreen.scrollTop = 0;
});

quizFinishBtn?.addEventListener("click", () => {
  const res = computeQuizResult();
  if (res.error) {
    if (!quizResult || !quizResultInner) return;
    quizResult.style.display = "block";
    quizResultInner.classList.remove("show");
    quizResultInner.innerHTML = `<h2>Hold up</h2><p>${res.error}</p>`;
    if (resultBlurb) resultBlurb.textContent = "";
    requestAnimationFrame(() => quizResultInner.classList.add("show"));
    setTimeout(() => quizResult.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    return;
  }
  revealQuizResult(res.chosen, res.guestName);
});
