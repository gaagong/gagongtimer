const RADIUS = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const timeDisplay = document.getElementById("timeDisplay");
const statusText = document.getElementById("statusText");
const ringProgress = document.getElementById("ringProgress");
const startPauseBtn = document.getElementById("startPauseBtn");
const resetBtn = document.getElementById("resetBtn");
const presetBtns = document.querySelectorAll(".preset-btn");

ringProgress.style.strokeDasharray = `${CIRCUMFERENCE}`;
ringProgress.style.strokeDashoffset = "0";

let totalSeconds = 15 * 60;
let remainingSeconds = totalSeconds;
let intervalId = null;
let isRunning = false;

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function updateDisplay() {
  timeDisplay.textContent = formatTime(remainingSeconds);
  const progressRatio = remainingSeconds / totalSeconds;
  ringProgress.style.strokeDashoffset = `${CIRCUMFERENCE * (1 - progressRatio)}`;
}

function setPreset(minutes, btn) {
  pauseTimer();
  totalSeconds = minutes * 60;
  remainingSeconds = totalSeconds;
  updateDisplay();
  statusText.textContent = "준비됐어요. 시작을 눌러주세요.";
  presetBtns.forEach((b) => b.classList.remove("active"));
  if (btn) btn.classList.add("active");
  startPauseBtn.textContent = "시작";
}

function tick() {
  remainingSeconds -= 1;
  updateDisplay();
  if (remainingSeconds <= 0) {
    finishTimer();
  }
}

function startTimer() {
  if (remainingSeconds <= 0) return;
  isRunning = true;
  startPauseBtn.textContent = "일시정지";
  statusText.textContent = "집중하는 중이에요. 화이팅!";
  intervalId = setInterval(tick, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(intervalId);
  intervalId = null;
  startPauseBtn.textContent = "계속하기";
}

function finishTimer() {
  clearInterval(intervalId);
  intervalId = null;
  isRunning = false;
  remainingSeconds = 0;
  updateDisplay();
  startPauseBtn.textContent = "시작";
  statusText.textContent = "수고하셨어요! 타이머가 끝났습니다.";
  playChime();
}

function resetTimer() {
  pauseTimer();
  remainingSeconds = totalSeconds;
  updateDisplay();
  startPauseBtn.textContent = "시작";
  statusText.textContent = "준비됐어요. 시작을 눌러주세요.";
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.22);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + i * 0.22 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.22 + 0.6);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.22);
      osc.stop(ctx.currentTime + i * 0.22 + 0.6);
    });
  } catch (e) {
    // audio not available, ignore
  }
}

presetBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const minutes = Number(btn.dataset.minutes);
    setPreset(minutes, btn);
  });
});

startPauseBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
    statusText.textContent = "잠시 쉬어가요.";
  } else {
    startTimer();
  }
});

resetBtn.addEventListener("click", resetTimer);

updateDisplay();
