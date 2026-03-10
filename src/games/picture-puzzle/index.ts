import { playCorrect, playError, playVictory, playSnap, playRoundComplete } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";
import { markCompleted } from "../../shared/progress";

const LEVELS = [3, 4, 5];

const dataEl = document.getElementById("puzzle-data")!;
const images: string[] = JSON.parse(dataEl.dataset.images!);
const baseUrl = dataEl.dataset.base || "/";

if (images.length === 0) {
  document.getElementById("feedback")!.textContent = "No images found in /images/puzzle/";
  throw new Error("No puzzle images");
}

const feedbackEl = document.getElementById("feedback")!;
const wrapperEl = document.getElementById("puzzle-wrapper")!;
const levelIndicator = document.getElementById("level-indicator")!;

let currentLevel = 0;
const usedImages = new Set<string>();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandomImage(): string {
  const available = images.filter((img) => !usedImages.has(img));
  if (available.length === 0) usedImages.clear();
  const pool = available.length > 0 ? available : images;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  usedImages.add(pick);
  return pick;
}

function startLevel() {
  const grid = LEVELS[currentLevel];
  const imageUrl = pickRandomImage();

  feedbackEl.textContent = "";
  feedbackEl.className = "feedback";
  wrapperEl.style.display = "";
  levelIndicator.textContent = `\u05E9\u05DC\u05D1 ${currentLevel + 1} \u05DE\u05EA\u05D5\u05DA ${LEVELS.length} (${grid}x${grid})`;

  preloadAndShow(imageUrl, grid);
}

function preloadAndShow(imageUrl: string, grid: number) {
  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    const preview = document.createElement("img");
    preview.src = imageUrl;
    preview.className = "puzzle-preview";
    preview.alt = "puzzle image";

    const label = document.createElement("div");
    label.className = "puzzle-preview-label";
    label.textContent = "\u05D4\u05E1\u05EA\u05DB\u05DC\u05D5 \u05E2\u05DC \u05D4\u05EA\u05DE\u05D5\u05E0\u05D4...";

    wrapperEl.innerHTML = "";
    wrapperEl.appendChild(preview);
    wrapperEl.appendChild(label);

    setTimeout(() => {
      wrapperEl.innerHTML = "";
      buildGame(imageUrl, grid);
    }, 2500);
  };
  img.onerror = () => {
    feedbackEl.textContent = "Failed to load image";
  };
}

function applyBg(el: HTMLElement, index: number, grid: number, imageUrl: string, totalSize: number) {
  const pieceSize = totalSize / grid;
  const col = index % grid;
  const row = Math.floor(index / grid);
  el.style.backgroundImage = `url(${imageUrl})`;
  el.style.backgroundSize = `${totalSize}px ${totalSize}px`;
  el.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
}

function buildGame(imageUrl: string, grid: number) {
  const total = grid * grid;
  const placed = new Set<number>();

  const counter = document.createElement("div");
  counter.className = "puzzle-counter";
  wrapperEl.appendChild(counter);

  const board = document.createElement("div");
  board.className = "puzzle-board";
  board.style.gridTemplateColumns = `repeat(${grid}, 1fr)`;
  board.style.gridTemplateRows = `repeat(${grid}, 1fr)`;
  wrapperEl.appendChild(board);

  const tray = document.createElement("div");
  tray.className = "puzzle-tray";
  wrapperEl.appendChild(tray);

  for (let i = 0; i < total; i++) {
    const slot = document.createElement("div");
    slot.className = "puzzle-slot";
    slot.dataset.slot = String(i);
    board.appendChild(slot);
  }

  const indices = shuffle(Array.from({ length: total }, (_, i) => i));
  for (const idx of indices) {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";
    piece.dataset.index = String(idx);
    tray.appendChild(piece);
  }

  counter.textContent = `0 / ${total}`;

  // Apply backgrounds after layout
  requestAnimationFrame(() => {
    const trayPiece = tray.querySelector<HTMLElement>(".puzzle-piece");
    if (!trayPiece) return;
    const pieceW = trayPiece.offsetWidth;
    const trayBgTotal = pieceW * grid;

    tray.querySelectorAll<HTMLElement>(".puzzle-piece").forEach((p) => {
      applyBg(p, Number(p.dataset.index), grid, imageUrl, trayBgTotal);
    });
  });

  // --- Pointer drag & drop ---
  let dragPiece: HTMLElement | null = null;
  let dragClone: HTMLElement | null = null;
  let currentDragIndex: number | null = null;
  let offsetX = 0;
  let offsetY = 0;

  function onPointerDown(e: PointerEvent) {
    const piece = (e.target as HTMLElement).closest<HTMLElement>(".puzzle-piece");
    if (!piece || piece.classList.contains("placed")) return;

    currentDragIndex = Number(piece.dataset.index);
    dragPiece = piece;
    piece.classList.add("dragging");

    dragClone = piece.cloneNode(true) as HTMLElement;
    dragClone.classList.remove("dragging");
    dragClone.style.position = "fixed";
    dragClone.style.zIndex = "999";
    dragClone.style.pointerEvents = "none";
    dragClone.style.width = piece.offsetWidth + "px";
    dragClone.style.height = piece.offsetHeight + "px";

    const rect = piece.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    dragClone.style.left = (e.clientX - offsetX) + "px";
    dragClone.style.top = (e.clientY - offsetY) + "px";

    document.body.appendChild(dragClone);
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!dragClone) return;
    dragClone.style.left = (e.clientX - offsetX) + "px";
    dragClone.style.top = (e.clientY - offsetY) + "px";

    board.querySelectorAll(".puzzle-slot").forEach((s) => s.classList.remove("drag-over"));
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el?.closest<HTMLElement>(".puzzle-slot");
    if (slot && !slot.classList.contains("filled")) {
      slot.classList.add("drag-over");
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (!dragClone || currentDragIndex === null || !dragPiece) return;

    dragClone.remove();
    dragClone = null;
    board.querySelectorAll(".puzzle-slot").forEach((s) => s.classList.remove("drag-over"));

    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el?.closest<HTMLElement>(".puzzle-slot");

    if (slot && !slot.classList.contains("filled")) {
      const slotIdx = Number(slot.dataset.slot);

      if (slotIdx === currentDragIndex) {
        playSnap();
        placed.add(slotIdx);

        const placedPiece = document.createElement("div");
        placedPiece.className = "puzzle-piece placed";
        placedPiece.dataset.index = String(currentDragIndex);
        const slotW = slot.offsetWidth;
        applyBg(placedPiece, currentDragIndex, grid, imageUrl, slotW * grid);

        slot.classList.add("filled");
        slot.appendChild(placedPiece);
        dragPiece.remove();

        counter.textContent = `${placed.size} / ${total}`;

        if (placed.size === total) {
          cleanup();
          if (currentLevel < LEVELS.length - 1) {
            // Next level
            playRoundComplete();
            feedbackEl.textContent = "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3! \u05E2\u05D5\u05D1\u05E8\u05D9\u05DD \u05DC\u05E9\u05DC\u05D1 \u05D4\u05D1\u05D0...";
            setTimeout(() => {
              currentLevel++;
              startLevel();
            }, 1500);
          } else {
            // Game complete
            markCompleted("picture-puzzle");
            playVictory();
            wrapperEl.style.display = "none";
            levelIndicator.style.display = "none";
            showVictoryBanner(feedbackEl, "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3!", "\u05E1\u05D9\u05D9\u05DE\u05EA\u05DD \u05D0\u05EA \u05DB\u05DC \u05D4\u05E4\u05D0\u05D6\u05DC\u05D9\u05DD!");
            spawnConfetti();
            setTimeout(() => { window.location.href = baseUrl; }, 5000);
          }
        } else {
          playCorrect();
        }
      } else {
        playError();
        dragPiece.classList.remove("dragging");
        dragPiece.classList.add("error-flash");
        dragPiece.addEventListener("animationend", () => {
          dragPiece!.classList.remove("error-flash");
        }, { once: true });
      }
    } else {
      dragPiece.classList.remove("dragging");
    }

    dragPiece = null;
    currentDragIndex = null;
  }

  tray.addEventListener("pointerdown", onPointerDown);
  document.addEventListener("pointermove", onPointerMove);
  document.addEventListener("pointerup", onPointerUp);

  function cleanup() {
    tray.removeEventListener("pointerdown", onPointerDown);
    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
  }
}

startLevel();
