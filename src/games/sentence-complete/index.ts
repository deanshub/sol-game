import { QUESTIONS } from "./data";
import { playCorrect, playError, playVictory } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const baseUrl = document.getElementById("game-data")!.dataset.base || "/";
const feedbackEl = document.getElementById("feedback")!;
const gameArea = document.getElementById("game-area")!;
const levelIndicator = document.getElementById("level-indicator")!;
const sentenceEl = document.getElementById("sentence")!;
const optionsEl = document.getElementById("options")!;
const progressEl = document.getElementById("progress")!;

let currentQuestion = 0;
let waiting = false;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function showQuestion() {
  const q = QUESTIONS[currentQuestion];
  waiting = false;

  progressEl.textContent = `שאלה ${currentQuestion + 1} מתוך ${QUESTIONS.length}`;

  // Render sentence with blank highlighted
  const parts = q.sentence.split("___");
  sentenceEl.innerHTML = parts.join('<span class="blank">___</span>');

  optionsEl.innerHTML = "";
  const shuffled = shuffle(q.options);
  for (const opt of shuffled) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt;
    btn.dataset.value = opt;
    optionsEl.appendChild(btn);
  }
}

optionsEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(".option-btn");
  if (!btn || waiting) return;
  waiting = true;

  const value = btn.dataset.value!;
  const q = QUESTIONS[currentQuestion];

  if (value === q.answer) {
    playCorrect();
    btn.classList.add("correct");

    // Fill in the blank with the answer
    const blankEl = sentenceEl.querySelector(".blank");
    if (blankEl) {
      blankEl.textContent = q.answer;
      blankEl.classList.add("filled");
    }

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion >= QUESTIONS.length) {
        // Game complete
        markCompleted("sentence-complete");
        playVictory();
        gameArea.style.display = "none";
        levelIndicator.style.display = "none";
        showVictoryBanner(feedbackEl, "כל הכבוד!", `סיימתם את כל ${QUESTIONS.length} המשפטים!`);
        spawnConfetti();
        setTimeout(() => { window.location.href = baseUrl; }, 5000);
      } else {
        showQuestion();
      }
    }, 800);
  } else {
    playError();
    btn.classList.add("wrong");

    // Show correct answer
    optionsEl.querySelectorAll<HTMLElement>(".option-btn").forEach((b) => {
      if (b.dataset.value === q.answer) b.classList.add("correct");
    });

    setTimeout(() => {
      showQuestion();
    }, 1200);
  }
});

levelIndicator.textContent = "השלם את המשפט";
showQuestion();
