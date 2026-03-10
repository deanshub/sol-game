import { playCorrect, playError, playVictory, playRoundComplete } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const TOTAL_LEVELS = 10;
const QUESTIONS_PER_LEVEL = 5;
const OPTIONS_COUNT = 4;

const baseUrl = document.getElementById("game-data")!.dataset.base || "/";
const feedbackEl = document.getElementById("feedback")!;
const questionEl = document.getElementById("question")!;
const optionsEl = document.getElementById("options")!;
const levelIndicator = document.getElementById("level-indicator")!;
const progressEl = document.getElementById("progress")!;
const gameArea = document.getElementById("game-area")!;

let currentLevel = 0;
let currentQuestion = 0;
let waiting = false;

interface Question {
  text: string;
  answer: number;
  options: number[];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(level: number): Question {
  let a: number, b: number, answer: number, op: string;

  if (level < 3) {
    // Addition, 1-10
    a = randInt(1, 9);
    b = randInt(1, 10 - a);
    op = "+";
    answer = a + b;
  } else if (level < 6) {
    // Subtraction, 1-10
    a = randInt(2, 10);
    b = randInt(1, a - 1);
    op = "-";
    answer = a - b;
  } else {
    // Mixed +/-, up to 30
    if (Math.random() < 0.5) {
      a = randInt(1, 25);
      b = randInt(1, 30 - a);
      op = "+";
      answer = a + b;
    } else {
      a = randInt(2, 30);
      b = randInt(1, a - 1);
      op = "-";
      answer = a - b;
    }
  }

  const text = `${a} ${op} ${b} = ?`;
  const options = generateOptions(answer, level < 6 ? 10 : 30);

  return { text, answer, options };
}

function generateOptions(answer: number, maxRange: number): number[] {
  const opts = new Set<number>([answer]);
  while (opts.size < OPTIONS_COUNT) {
    // Generate wrong answers close to the correct one
    const offset = randInt(1, Math.min(5, maxRange));
    const wrong = answer + (Math.random() < 0.5 ? offset : -offset);
    if (wrong >= 0 && wrong <= maxRange && !opts.has(wrong)) {
      opts.add(wrong);
    }
  }
  return shuffle([...opts]);
}

let questions: Question[] = [];

function startLevel() {
  currentQuestion = 0;
  questions = Array.from({ length: QUESTIONS_PER_LEVEL }, () => generateQuestion(currentLevel));

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  gameArea.style.display = "";

  const levelType = currentLevel < 3 ? "חיבור" : currentLevel < 6 ? "חיסור" : "חיבור וחיסור";
  levelIndicator.textContent = `\u05E9\u05DC\u05D1 ${currentLevel + 1} \u05DE\u05EA\u05D5\u05DA ${TOTAL_LEVELS} — ${levelType}`;

  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  questionEl.textContent = q.text;
  progressEl.textContent = `\u05E9\u05D0\u05DC\u05D4 ${currentQuestion + 1} \u05DE\u05EA\u05D5\u05DA ${QUESTIONS_PER_LEVEL}`;
  optionsEl.innerHTML = "";
  waiting = false;

  for (const opt of q.options) {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = String(opt);
    btn.dataset.value = String(opt);
    optionsEl.appendChild(btn);
  }
}

optionsEl.addEventListener("click", (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLElement>(".option-btn");
  if (!btn || waiting) return;
  waiting = true;

  const value = Number(btn.dataset.value);
  const q = questions[currentQuestion];

  if (value === q.answer) {
    playCorrect();
    btn.classList.add("correct");

    setTimeout(() => {
      currentQuestion++;
      if (currentQuestion >= QUESTIONS_PER_LEVEL) {
        // Level complete
        if (currentLevel >= TOTAL_LEVELS - 1) {
          // Game complete
          markCompleted("math-quiz");
          playVictory();
          gameArea.style.display = "none";
          levelIndicator.style.display = "none";
          showVictoryBanner(feedbackEl, "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3!", "\u05E1\u05D9\u05D9\u05DE\u05EA\u05DD \u05D0\u05EA \u05DB\u05DC \u05D4\u05E9\u05DC\u05D1\u05D9\u05DD!");
          spawnConfetti();
          setTimeout(() => { window.location.href = baseUrl; }, 5000);
        } else {
          playRoundComplete();
          feedbackEl.textContent = "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3! \u05E2\u05D5\u05D1\u05E8\u05D9\u05DD \u05DC\u05E9\u05DC\u05D1 \u05D4\u05D1\u05D0...";
          setTimeout(() => {
            currentLevel++;
            startLevel();
          }, 1500);
        }
      } else {
        showQuestion();
      }
    }, 600);
  } else {
    playError();
    btn.classList.add("wrong");
    // Show correct answer
    optionsEl.querySelectorAll<HTMLElement>(".option-btn").forEach((b) => {
      if (Number(b.dataset.value) === q.answer) b.classList.add("correct");
    });

    setTimeout(() => {
      // Generate a new question for retry
      questions[currentQuestion] = generateQuestion(currentLevel);
      showQuestion();
    }, 1200);
  }
});

startLevel();
