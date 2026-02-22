const startBtn = document.getElementById("startBtn");
const music = document.getElementById("bgMusic");

// Radio game elements
const radioGame = document.getElementById("radioGame");
const dialInput = document.getElementById("dialInput");
const dialKnob = document.getElementById("dialKnob");
const radioNeedle = document.getElementById("radioNeedle");
const freqValue = document.getElementById("freqValue");
const radioMessage = document.getElementById("radioMessage");
const afterTuned = document.getElementById("afterTuned");
const inviteReveal = document.getElementById("inviteReveal");

const TARGET_FREQ = 103.5;
const SUCCESS_TOLERANCE = 0.05; // must land basically on 103.5
const STATIC_FULL_AT = 1.6;     // distance where static is max

let musicStarted = false;
let tuned = false;

// Prevent touch scrolling while locked (mobile)
function preventScroll(e) {
  if (document.body.classList.contains("locked")) {
    e.preventDefault();
  }
}
window.addEventListener("touchmove", preventScroll, { passive: false });

/* ---------------- PAGE NAV (only for Page0 -> Page1) ---------------- */
function showOnlyPage(pageNumber) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  const el = document.getElementById("page" + pageNumber);
  if (el) el.classList.add("active");
}

startBtn?.addEventListener("click", () => {
  showOnlyPage(1);
  startMusic();

  // Initialize radio UI
  const initial = parseFloat(dialInput?.value || "99.5");
  updateRadioUI(initial);
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

/* ---------------- RADIO GAME ---------------- */
function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  const t = (value - inMin) / (inMax - inMin);
  return outMin + t * (outMax - outMin);
}

function updateRadioUI(freq) {
  if (!freqValue || !dialKnob || !radioNeedle || !radioGame) return;

  const f = Math.round(freq * 10) / 10;
  freqValue.textContent = f.toFixed(1);

  // Knob rotation
  const knobDeg = mapRange(f, 88, 108, -140, 140);
  dialKnob.style.transform = `rotate(${knobDeg}deg)`;

  // Needle position across the scale
  const needlePct = mapRange(f, 88, 108, 0, 100);
  radioNeedle.style.left = `${needlePct}%`;

  // Static intensity based on distance from target
  const dist = Math.abs(f - TARGET_FREQ);
  const staticAmt = clamp(dist / STATIC_FULL_AT, 0, 1);

  // smaller static when close
  radioGame.style.setProperty("--static", staticAmt.toFixed(3));
  radioGame.style.setProperty("--glow", (1 - staticAmt).toFixed(3));

  if (tuned) return;

  if (dist <= SUCCESS_TOLERANCE) {
    onTuneSuccess();
  } else {
    // Message updates
    if (!radioMessage) return;
    if (dist < 0.25) {
      radioMessage.textContent = "Almost… hold it steady";
    } else if (dist < 0.8) {
      radioMessage.textContent = "Close… keep tuning";
    } else {
      radioMessage.textContent = "STATIC… find 103.5";
    }
  }
}

function onTuneSuccess() {
  tuned = true;
  radioGame?.classList.add("tuned");
  dialInput?.setAttribute("disabled", "true");

  if (radioMessage) {
    radioMessage.textContent = "103.5 Dawn FM — You’re tuned in.";
  }

  // Show tuned text + begin reveal
  if (afterTuned) {
    afterTuned.setAttribute("aria-hidden", "false");
    afterTuned.classList.add("show");
  }

  setTimeout(() => {
    if (inviteReveal) {
      inviteReveal.setAttribute("aria-hidden", "false");
      inviteReveal.classList.add("reveal");
    }
  }, 700);

  // Unlock scroll and move to page 2 after the reveal moment
  setTimeout(() => {
    finishGame();
  }, 5600);
}

dialInput?.addEventListener("input", (e) => {
  const v = parseFloat(e.target.value);
  updateRadioUI(v);
});

/* ---------------- FINISH: enable scroll from Show Up to end ---------------- */
function finishGame() {
  document.body.classList.remove("locked");
  document.body.classList.add("scroll-mode");

  const page2 = document.getElementById("page2");
  setTimeout(() => {
    page2?.scrollIntoView({ behavior: "smooth" });
  }, 250);
}