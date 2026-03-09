import { playCorrect, playError, playVictory, playSnap } from "../../shared/sounds";
import { showVictoryBanner, spawnConfetti } from "../../shared/victory";

const GRID = 3;
const TOTAL = GRID * GRID;

const dataEl = document.getElementById("puzzle-data")!;
const images: string[] = JSON.parse(dataEl.dataset.images!);
const baseUrl = dataEl.dataset.base || "/";

if (images.length === 0) {
  document.getElementById("feedback")!.textContent = "No images found in /images/puzzle/";
  throw new Error("No puzzle images");
}

const imageUrl = images[Math.floor(Math.random() * images.length)];

const feedbackEl = document.getElementById("feedback")!;
const wrapperEl = document.getElementById("puzzle-wrapper")!;

const placed = new Set<number>();

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function applyBg(el: HTMLElement, index: number, totalSize: number) {
  const pieceSize = totalSize / GRID;
  const col = index % GRID;
  const row = Math.floor(index / GRID);
  el.style.backgroundImage = `url(${imageUrl})`;
  el.style.backgroundSize = `${totalSize}px ${totalSize}px`;
  el.style.backgroundPosition = `-${col * pieceSize}px -${row * pieceSize}px`;
}

function preloadAndStart() {
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
      buildGame();
    }, 2500);
  };
  img.onerror = () => {
    feedbackEl.textContent = "Failed to load image";
  };
}

function buildGame() {
  const counter = document.createElement("div");
  counter.className = "puzzle-counter";
  wrapperEl.appendChild(counter);

  const board = document.createElement("div");
  board.className = "puzzle-board";
  wrapperEl.appendChild(board);

  const tray = document.createElement("div");
  tray.className = "puzzle-tray";
  wrapperEl.appendChild(tray);

  // Create slots
  for (let i = 0; i < TOTAL; i++) {
    const slot = document.createElement("div");
    slot.className = "puzzle-slot";
    slot.dataset.slot = String(i);
    board.appendChild(slot);
  }

  // Create shuffled pieces in tray
  const indices = shuffle(Array.from({ length: TOTAL }, (_, i) => i));
  for (const idx of indices) {
    const piece = document.createElement("div");
    piece.className = "puzzle-piece";
    piece.dataset.index = String(idx);
    tray.appendChild(piece);
  }

  counter.textContent = `0 / ${TOTAL}`;

  // Wait a frame so layout is computed, then apply backgrounds using actual sizes
  requestAnimationFrame(() => {
    const trayPiece = tray.querySelector<HTMLElement>(".puzzle-piece");
    if (!trayPiece) return;
    const pieceW = trayPiece.offsetWidth;
    const trayBgTotal = pieceW * GRID;

    tray.querySelectorAll<HTMLElement>(".puzzle-piece").forEach((p) => {
      applyBg(p, Number(p.dataset.index), trayBgTotal);
    });
  });

  // --- Pointer drag & drop ---
  let dragPiece: HTMLElement | null = null;
  let dragClone: HTMLElement | null = null;
  let currentDragIndex: number | null = null;
  let offsetX = 0;
  let offsetY = 0;

  tray.addEventListener("pointerdown", (e) => {
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
  });

  document.addEventListener("pointermove", (e) => {
    if (!dragClone) return;
    dragClone.style.left = (e.clientX - offsetX) + "px";
    dragClone.style.top = (e.clientY - offsetY) + "px";

    board.querySelectorAll(".puzzle-slot").forEach((s) => s.classList.remove("drag-over"));
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const slot = el?.closest<HTMLElement>(".puzzle-slot");
    if (slot && !slot.classList.contains("filled")) {
      slot.classList.add("drag-over");
    }
  });

  document.addEventListener("pointerup", (e) => {
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
        // Use slot's actual size so pieces tile to the full board
        const slotW = slot.offsetWidth;
        const slotH = slot.offsetHeight;
        applyBg(placedPiece, currentDragIndex, slotW * GRID);

        slot.classList.add("filled");
        slot.appendChild(placedPiece);
        dragPiece.remove();

        counter.textContent = `${placed.size} / ${TOTAL}`;

        if (placed.size === TOTAL) {
          playVictory();
          wrapperEl.style.display = "none";
          showVictoryBanner(feedbackEl, "\u05DB\u05DC \u05D4\u05DB\u05D1\u05D5\u05D3!", "\u05D4\u05E8\u05DB\u05D1\u05EA\u05DD \u05D0\u05EA \u05D4\u05E4\u05D0\u05D6\u05DC!");
          spawnConfetti();
          setTimeout(() => { window.location.href = baseUrl; }, 5000);
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
  });
}

preloadAndStart();
