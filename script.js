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

const TARGET_FREQ = 103.5;

// Easier tuning (mobile-friendly)
const SUCCESS_TOLERANCE = 0.12; // still the "success" window
const STATIC_FULL_AT = 1.6;

// Drag sensitivity (bigger = faster turning)
const DRAG_SENSITIVITY = 0.03; // MHz per pixel drag

const FREQ_MIN = 88.0;
const FREQ_MAX = 108.0;

// --- SNAP SETTINGS ---
const SNAP_RANGE = 0.20;        // within ±0.20 of 103.5, start "locking"
const SNAP_STRENGTH = 0.18;     // 0..1 : higher = more pull per move/frame
const SNAP_MAX_STEP = 0.08;     // max MHz pulled per update (keeps it gentle)

let musicStarted = false;
let tuned = false;

// For knob dragging
let dragging = false;
let lastX = 0;
let currentFreq = parseFloat(dialInput?.value || "99.5");

// Prevent touch scrolling while locked (mobile)
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

  // gentle fade in
  const fade = setInterval(() => {
    if (music.volume < 0.6) {
      music.volume = Math.min(0.6, music.volume + 0.05);
    } else {
      clearInterval(fade);
    }
  }, 180);
}

/* ---------------- HELPERS ---------------- */
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

// keeps it to 0.1 steps like a real radio readout
function quantizeToStep(v, step = 0.1) {
  return Math.round(v / step) * step;
}

/* ---------------- SNAP LOGIC ---------------- */
function applySoftSnap(freq) {
  // If already tuned, do nothing
  if (tuned) return freq;

  const dist = TARGET_FREQ - freq;
  const abs = Math.abs(dist);

  // Only snap in a close range
  if (abs > SNAP_RANGE) return freq;

  // Pull a portion of the remaining distance
  let pull = dist * SNAP_STRENGTH;

  // Clamp the pull so it doesn't jump too hard
  pull = clamp(pull, -SNAP_MAX_STEP, SNAP_MAX_STEP);

  return freq + pull;
}

/* ---------------- RADIO UI ---------------- */
function setFreq(freq) {
  let next = clamp(freq, FREQ_MIN, FREQ_MAX);

  // Soft snap toward target if close
  next = applySoftSnap(next);

  // Keep 0.1 step increments (matches your UI/slider)
  next = quantizeToStep(next, 0.1);

  currentFreq = next;
  if (dialInput) dialInput.value = currentFreq.toFixed(1);

  updateRadioUI(currentFreq);
}

function updateRadioUI(freq) {
  if (!freqValue || !dialKnob || !radioNeedle || !radioGame) return;

  const f = Math.round(freq * 10) / 10;
  freqValue.textContent = f.toFixed(1);

  // Knob rotation
  const knobDeg = mapRange(f, FREQ_MIN, FREQ_MAX, -140, 140);
  dialKnob.style.transform = `rotate(${knobDeg}deg)`;

  // Needle position
  const needlePct = mapRange(f, FREQ_MIN, FREQ_MAX, 0, 100);
  radioNeedle.style.left = `${needlePct}%`;

  // Static intensity based on distance
  const dist = Math.abs(f - TARGET_FREQ);
  const staticAmt = clamp(dist / STATIC_FULL_AT, 0, 1);

  radioGame.style.setProperty("--static", staticAmt.toFixed(3));
  radioGame.style.setProperty("--glow", (1 - staticAmt).toFixed(3));

  if (tuned) return;

  if (dist <= SUCCESS_TOLERANCE) {
    onTuneSuccess();
  } else {
    if (!radioMessage) return;

    // Friendlier messaging near target
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

  // Force it perfectly
  currentFreq = TARGET_FREQ;
  if (dialInput) dialInput.value = TARGET_FREQ.toFixed(1);
  if (freqValue) freqValue.textContent = TARGET_FREQ.toFixed(1);

  if (radioMessage) radioMessage.textContent = "103.5 Dawn FM — You’re tuned in.";

  // Show tuned text
  if (afterTuned) {
    afterTuned.setAttribute("aria-hidden", "false");
    afterTuned.classList.add("show");
  }

  // Start fullscreen radio wave flood
  setTimeout(() => {
    if (waveFlood) {
      waveFlood.setAttribute("aria-hidden", "false");
      waveFlood.classList.add("go");
    }
  }, 250);

  // Invite begins appearing slowly / glitching
  setTimeout(() => {
    if (inviteReveal) {
      inviteReveal.setAttribute("aria-hidden", "false");
      inviteReveal.classList.add("reveal");
    }
  }, 650);

  // After flood + reveal moment, unlock scroll
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

/* ---------------- SMOOTH KNOB DRAG (mobile-friendly) ---------------- */
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

  // keep pointer captured on desktop
  if (evt.pointerId && dialWrap?.setPointerCapture) {
    try { dialWrap.setPointerCapture(evt.pointerId); } catch {}
  }
}

function moveDrag(evt) {
  if (!dragging || tuned) return;

  const x = getClientX(evt);
  const dx = x - lastX;
  lastX = x;

  // Drag right = increase frequency, drag left = decrease
  const next = currentFreq + (dx * DRAG_SENSITIVITY);
  setFreq(next);
}

function endDrag() {
  if (!dragging) return;
  dragging = false;
  dialWrap?.classList.remove("dragging");
}

if (dialWrap) {
  // Pointer events (best for modern devices)
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

  // Touch fallback
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

/* ---------------- FINISH: enable scroll from Page 2 -> end ---------------- */
function finishGame() {
  document.body.classList.remove("locked");
  document.body.classList.add("scroll-mode");

  const page2 = document.getElementById("page2");
  setTimeout(() => {
    page2?.scrollIntoView({ behavior: "smooth" });
  }, 250);
}
