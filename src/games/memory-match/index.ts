import { ALL_PAIRS, PAIR_COUNT, COLUMNS, type CardPair } from "./data";
import { playCorrect, playError, playVictory, playSnap } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const baseUrl = document.getElementById("game-data")!.dataset.base || "/";
const feedbackEl = document.getElementById("feedback")!;
const cardGrid = document.getElementById("card-grid")!;
const levelIndicator = document.getElementById("level-indicator")!;
const gameArea = document.getElementById("game-area")!;
const movesEl = document.getElementById("moves-count")!;
const pairsEl = document.getElementById("pairs-count")!;

interface Card {
  id: number;
  pairId: string;
  display: string;
  flipped: boolean;
  matched: boolean;
  el: HTMLElement;
}

let cards: Card[] = [];
let flippedCards: Card[] = [];
let moves = 0;
let matchedCount = 0;
let locked = false;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createCardEl(card: Card): HTMLElement {
  const el = document.createElement("button");
  el.className = "memory-card";
  el.dataset.cardId = String(card.id);
  el.innerHTML =
    `<div class="card-inner">` +
    `<div class="card-front"><span class="card-back">?</span></div>` +
    `<div class="card-back-face"><span class="card-face">${card.display}</span></div>` +
    `</div>`;
  return el;
}

function flipCard(card: Card) {
  card.el.classList.add("flipped");
}

function unflipCard(card: Card) {
  card.el.classList.add("unflipping");
  card.el.classList.remove("flipped");
  setTimeout(() => card.el.classList.remove("unflipping"), 400);
}

function markCardMatched(card: Card) {
  card.el.classList.add("matched");
}

function buildCards(pairs: CardPair[]): Card[] {
  let id = 0;
  const result: Card[] = [];
  for (const pair of pairs) {
    for (let i = 0; i < 2; i++) {
      const card: Card = { id: id++, pairId: pair.id, display: pair.display, flipped: false, matched: false, el: null! };
      card.el = createCardEl(card);
      result.push(card);
    }
  }
  return shuffle(result);
}

function startGame() {
  const pairs = shuffle(ALL_PAIRS).slice(0, PAIR_COUNT);

  cards = buildCards(pairs);
  flippedCards = [];
  moves = 0;
  matchedCount = 0;
  locked = false;

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  levelIndicator.textContent = `${PAIR_COUNT} זוגות`;
  movesEl.textContent = `מהלכים: 0`;
  pairsEl.textContent = `זוגות: 0 / ${PAIR_COUNT}`;

  cardGrid.style.gridTemplateColumns = `repeat(${COLUMNS}, 1fr)`;
  cardGrid.innerHTML = "";
  for (const card of cards) {
    cardGrid.appendChild(card.el);
  }
}

cardGrid.addEventListener("click", (e) => {
  if (locked) return;

  const btn = (e.target as HTMLElement).closest<HTMLElement>(".memory-card");
  if (!btn) return;

  const cardId = Number(btn.dataset.cardId);
  const card = cards.find((c) => c.id === cardId);
  if (!card || card.flipped || card.matched) return;

  playSnap();
  card.flipped = true;
  flippedCards.push(card);
  flipCard(card);

  if (flippedCards.length === 2) {
    locked = true;
    moves++;
    movesEl.textContent = `מהלכים: ${moves}`;

    const [first, second] = flippedCards;

    if (first.pairId === second.pairId) {
      setTimeout(() => {
        playCorrect();
        first.matched = true;
        second.matched = true;
        matchedCount++;
        pairsEl.textContent = `זוגות: ${matchedCount} / ${PAIR_COUNT}`;
        markCardMatched(first);
        markCardMatched(second);
        flippedCards = [];
        locked = false;

        if (matchedCount === PAIR_COUNT) {
          markCompleted("memory-match");
          playVictory();
          gameArea.style.display = "none";
          levelIndicator.style.display = "none";
          showVictoryBanner(feedbackEl, "כל הכבוד!", `סיימתם ב-${moves} מהלכים!`);
          spawnConfetti();
          setTimeout(() => { window.location.href = baseUrl; }, 5000);
        }
      }, 400);
    } else {
      setTimeout(() => {
        playError();
        first.flipped = false;
        second.flipped = false;
        unflipCard(first);
        unflipCard(second);
        flippedCards = [];
        locked = false;
      }, 900);
    }
  }
});

startGame();
