import { LEVELS, type MazeLevel } from "./data";
import { playCorrect, playSnap, playError, playVictory } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const baseUrl = document.getElementById("game-data")!.dataset.base || "/";
const feedbackEl = document.getElementById("feedback")!;
const gameArea = document.getElementById("game-area")!;
const levelIndicator = document.getElementById("level-indicator")!;
const mazeContainer = document.getElementById("maze-grid")!;
const wordDisplay = document.getElementById("word-display")!;
const progressEl = document.getElementById("progress")!;

let currentLevel = 0;
let playerRow = 0;
let playerCol = 0;
let collectedLetters: string[] = [];
let letterCells: Map<string, string> = new Map(); // "row,col" -> letter
let level: MazeLevel;
let moving = false;

function cellKey(r: number, c: number) {
  return `${r},${c}`;
}

function renderMaze() {
  level = LEVELS[currentLevel];
  collectedLetters = [];
  letterCells = new Map();
  moving = false;

  levelIndicator.textContent = `שלב ${currentLevel + 1} / ${LEVELS.length}`;
  progressEl.textContent = `מצאו את הדרך ואספו: ${level.word}`;

  const grid = level.grid;
  const rows = grid.length;
  const cols = grid[0].length;

  // Find start, letters
  let letterIdx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 2) {
        playerRow = r;
        playerCol = c;
      }
      if (grid[r][c] === 4) {
        letterCells.set(cellKey(r, c), level.letters[letterIdx++]);
      }
    }
  }

  mazeContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  mazeContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  mazeContainer.innerHTML = "";

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "maze-cell";
      cell.dataset.r = String(r);
      cell.dataset.c = String(c);

      const v = grid[r][c];
      if (v === 1) {
        cell.classList.add("wall");
      } else if (v === 3) {
        cell.classList.add("exit");
        cell.dataset.label = "🚪";
      } else if (v === 4) {
        cell.classList.add("letter");
        cell.dataset.label = letterCells.get(cellKey(r, c))!;
      }

      if (r === playerRow && c === playerCol) {
        cell.classList.add("player");
      }

      mazeContainer.appendChild(cell);
    }
  }

  updateWordDisplay();
}

function updateWordDisplay() {
  const chars = level.word.split("");
  wordDisplay.innerHTML = chars
    .map((ch, i) => {
      const collected = i < collectedLetters.length;
      return `<span class="word-letter ${collected ? "collected" : ""}">${collected ? collectedLetters[i] : "?"}</span>`;
    })
    .join("");
}

function getCell(r: number, c: number): HTMLElement | null {
  return mazeContainer.querySelector(`[data-r="${r}"][data-c="${c}"]`);
}

function movePlayer(dr: number, dc: number) {
  if (moving) return;

  const nr = playerRow + dr;
  const nc = playerCol + dc;
  const grid = level.grid;

  if (nr < 0 || nr >= grid.length || nc < 0 || nc >= grid[0].length) return;
  if (grid[nr][nc] === 1) return;

  moving = true;

  // Remove player from old cell
  const oldCell = getCell(playerRow, playerCol);
  if (oldCell) oldCell.classList.remove("player");

  playerRow = nr;
  playerCol = nc;

  // Add player to new cell
  const newCell = getCell(nr, nc);
  if (newCell) newCell.classList.add("player");

  // Check for letter pickup
  const key = cellKey(nr, nc);
  if (letterCells.has(key)) {
    const letter = letterCells.get(key)!;
    const expectedIdx = collectedLetters.length;
    const expectedLetter = level.letters[expectedIdx];

    if (letter === expectedLetter && expectedIdx < level.letters.length) {
      collectedLetters.push(letter);
      letterCells.delete(key);
      if (newCell) {
        newCell.classList.remove("letter");
        delete newCell.dataset.label;
      }
      playCorrect();
      updateWordDisplay();
    }
  }

  // Check for exit
  if (grid[nr][nc] === 3) {
    if (collectedLetters.length === level.letters.length) {
      // Level complete
      setTimeout(() => {
        currentLevel++;
        if (currentLevel >= LEVELS.length) {
          // Game complete
          markCompleted("maze");
          playVictory();
          gameArea.style.display = "none";
          levelIndicator.style.display = "none";
          showVictoryBanner(feedbackEl, "כל הכבוד!", `עברתם את כל ${LEVELS.length} המבוכים!`);
          spawnConfetti();
          setTimeout(() => { window.location.href = baseUrl; }, 5000);
        } else {
          playCorrect();
          renderMaze();
        }
        moving = false;
      }, 300);
      return;
    } else {
      // Not all letters collected
      playError();
      feedbackEl.textContent = "אספו את כל האותיות לפני היציאה!";
      feedbackEl.className = "feedback error";
      setTimeout(() => {
        feedbackEl.textContent = "";
        feedbackEl.className = "feedback";
      }, 1500);
    }
  } else {
    playSnap();
  }

  moving = false;
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  switch (e.key) {
    case "ArrowUp":
    case "w":
      e.preventDefault();
      movePlayer(-1, 0);
      break;
    case "ArrowDown":
    case "s":
      e.preventDefault();
      movePlayer(1, 0);
      break;
    case "ArrowLeft":
    case "a":
      e.preventDefault();
      movePlayer(0, -1);
      break;
    case "ArrowRight":
    case "d":
      e.preventDefault();
      movePlayer(0, 1);
      break;
  }
});

// Arrow button controls
document.getElementById("btn-up")!.addEventListener("click", () => movePlayer(-1, 0));
document.getElementById("btn-down")!.addEventListener("click", () => movePlayer(1, 0));
document.getElementById("btn-left")!.addEventListener("click", () => movePlayer(0, -1));
document.getElementById("btn-right")!.addEventListener("click", () => movePlayer(0, 1));

// Swipe controls
let touchStartX = 0;
let touchStartY = 0;

mazeContainer.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

mazeContainer.addEventListener("touchend", (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  const minSwipe = 30;

  if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

  if (Math.abs(dx) > Math.abs(dy)) {
    movePlayer(0, dx > 0 ? 1 : -1);
  } else {
    movePlayer(dy > 0 ? 1 : -1, 0);
  }
});

renderMaze();
