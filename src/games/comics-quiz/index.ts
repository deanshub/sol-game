import { playCorrect, playError, playVictory, playRoundComplete } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";
import { buildComics } from "./data";

const dataEl = document.getElementById("game-data")!;
const baseUrl = dataEl.dataset.base || "/";
const COMICS = buildComics(baseUrl);

const feedbackEl = document.getElementById("feedback")!;
const gameArea = document.getElementById("game-area")!;
const levelIndicator = document.getElementById("level-indicator")!;

let currentLevel = 0;
let waiting = false;

function startLevel() {
  const comic = COMICS[currentLevel];
  waiting = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  gameArea.style.display = "";
  levelIndicator.textContent = `\u05E1\u05D9\u05E4\u05D5\u05E8 ${currentLevel + 1} \u05DE\u05EA\u05D5\u05DA ${COMICS.length}`;

  gameArea.innerHTML = "";

  const title = document.createElement("h2");
  title.className = "comic-title";
  title.textContent = comic.title;
  gameArea.appendChild(title);

  // Single comic image
  const img = document.createElement("img");
  img.className = "comic-image";
  img.src = comic.image;
  img.alt = comic.title;
  gameArea.appendChild(img);

  // Question section
  const questionSection = document.createElement("div");
  questionSection.className = "comic-question-section";
  gameArea.appendChild(questionSection);

  const questionText = document.createElement("div");
  questionText.className = "comic-question-text";
  questionText.textContent = comic.question;
  questionSection.appendChild(questionText);

  const optionsGrid = document.createElement("div");
  optionsGrid.className = "comic-options";
  questionSection.appendChild(optionsGrid);

  comic.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "comic-option-btn";
    btn.textContent = opt;
    btn.dataset.index = String(i);
    optionsGrid.appendChild(btn);
  });

  optionsGrid.addEventListener("click", (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>(".comic-option-btn");
    if (!btn || waiting) return;
    waiting = true;

    const idx = Number(btn.dataset.index);

    if (idx === comic.correctIndex) {
      playCorrect();
      btn.classList.add("correct");

      setTimeout(() => {
        if (currentLevel >= COMICS.length - 1) {
          markCompleted("comics-quiz");
          playVictory();
          gameArea.style.display = "none";
          levelIndicator.style.display = "none";
          showVictoryBanner(feedbackEl, "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3!", "\u05E7\u05E8\u05D0\u05EA\u05DD \u05D0\u05EA \u05DB\u05DC \u05D4\u05E1\u05D9\u05E4\u05D5\u05E8\u05D9\u05DD!");
          spawnConfetti();
          setTimeout(() => { window.location.href = baseUrl; }, 5000);
        } else {
          playRoundComplete();
          feedbackEl.textContent = "\u05E0\u05DB\u05D5\u05DF! \u05E2\u05D5\u05D1\u05E8\u05D9\u05DD \u05DC\u05E1\u05D9\u05E4\u05D5\u05E8 \u05D4\u05D1\u05D0...";
          setTimeout(() => {
            currentLevel++;
            startLevel();
          }, 1500);
        }
      }, 800);
    } else {
      playError();
      btn.classList.add("wrong");
      optionsGrid.querySelectorAll<HTMLElement>(".comic-option-btn").forEach((b) => {
        if (Number(b.dataset.index) === comic.correctIndex) b.classList.add("correct");
      });

      setTimeout(() => {
        waiting = false;
        optionsGrid.querySelectorAll(".comic-option-btn").forEach((b) => {
          b.classList.remove("wrong", "correct");
        });
      }, 1500);
    }
  });
}

startLevel();
