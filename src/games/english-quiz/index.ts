import { LEVELS } from "./data";
import { playCorrect, playError, playVictory, playRoundComplete } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const baseUrl = document.getElementById("game-data")!.dataset.base || "/";
const feedbackEl = document.getElementById("feedback")!;
const optionsEl = document.getElementById("options")!;
const levelIndicator = document.getElementById("level-indicator")!;
const progressEl = document.getElementById("progress")!;
const gameArea = document.getElementById("game-area")!;
const soundBtn = document.getElementById("sound-btn")!;
const soundLabel = document.getElementById("sound-label")!;

let currentLevel = 0;
let waiting = false;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speakWord(word: string) {
  speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  utterance.rate = 0.85;
  utterance.pitch = 1.1;
  speechSynthesis.speak(utterance);
}

function showLevel() {
  const level = LEVELS[currentLevel];
  waiting = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";

  levelIndicator.textContent = `שלב ${currentLevel + 1} מתוך ${LEVELS.length}`;
  progressEl.textContent = "";
  soundLabel.textContent = "הקשיבו למילה";

  // Render shuffled image options
  optionsEl.innerHTML = "";
  const shuffled = shuffle(level.options);
  for (const emoji of shuffled) {
    const btn = document.createElement("button");
    btn.className = "image-option";
    btn.textContent = emoji;
    btn.dataset.emoji = emoji;
    optionsEl.appendChild(btn);
  }

  // Auto-play the word after a short delay
  setTimeout(() => speakWord(level.word), 400);
}

// Replay button
soundBtn.addEventListener("click", () => {
  speakWord(LEVELS[currentLevel].word);
  soundBtn.classList.add("playing");
  setTimeout(() => soundBtn.classList.remove("playing"), 600);
});

// Option clicks
optionsEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(".image-option");
  if (!btn || waiting) return;
  waiting = true;

  const level = LEVELS[currentLevel];
  const picked = btn.dataset.emoji!;

  if (picked === level.correctEmoji) {
    playCorrect();
    btn.classList.add("correct");

    setTimeout(() => {
      if (currentLevel >= LEVELS.length - 1) {
        // Game complete
        markCompleted("english-quiz");
        playVictory();
        gameArea.style.display = "none";
        levelIndicator.style.display = "none";
        showVictoryBanner(feedbackEl, "!Great job", "סיימתם את כל השלבים!");
        spawnConfetti();
        setTimeout(() => { window.location.href = baseUrl; }, 5000);
      } else {
        playRoundComplete();
        currentLevel++;
        showLevel();
      }
    }, 800);
  } else {
    playError();
    btn.classList.add("wrong");

    // Highlight the correct answer
    optionsEl.querySelectorAll<HTMLElement>(".image-option").forEach((b) => {
      if (b.dataset.emoji === level.correctEmoji) b.classList.add("correct");
    });

    setTimeout(() => {
      showLevel();
    }, 1500);
  }
});

showLevel();
