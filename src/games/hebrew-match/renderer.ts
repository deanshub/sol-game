import type { RoundConfig, LetterData, Point } from "./types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export class Renderer {
  private lettersCol: HTMLElement;
  private picturesCol: HTMLElement;
  private svg: SVGSVGElement;
  private feedbackEl: HTMLElement;
  private roundIndicator: HTMLElement;
  private tempLine: SVGLineElement | null = null;

  constructor() {
    this.lettersCol = document.getElementById("letters-column")!;
    this.picturesCol = document.getElementById("pictures-column")!;
    this.svg = document.getElementById("lines-overlay") as unknown as SVGSVGElement;
    this.feedbackEl = document.getElementById("feedback")!;
    this.roundIndicator = document.getElementById("round-indicator")!;
  }

  renderRound(round: RoundConfig, currentRound: number, totalRounds: number) {
    this.lettersCol.innerHTML = "";
    this.picturesCol.innerHTML = "";
    this.svg.innerHTML = "";
    this.feedbackEl.textContent = "";
    this.feedbackEl.className = "feedback";
    this.tempLine = null;

    this.roundIndicator.textContent = `סיבוב ${currentRound + 1} מתוך ${totalRounds}`;

    for (const item of round.items) {
      const card = document.createElement("div");
      card.className = "card letter-card";
      card.dataset.letter = item.letter;
      card.textContent = item.letter;
      this.lettersCol.appendChild(card);
    }

    const shuffled = shuffle(round.items);
    for (const item of shuffled) {
      const card = document.createElement("div");
      card.className = "card picture-card";
      card.dataset.word = item.word;
      card.innerHTML = `<span class="picture-emoji">${item.emoji}</span><span class="picture-label">${item.word}</span>`;
      this.picturesCol.appendChild(card);
    }
  }

  getLetterCard(letter: string): HTMLElement | null {
    return this.lettersCol.querySelector(`[data-letter="${letter}"]`);
  }

  getPictureCard(word: string): HTMLElement | null {
    return this.picturesCol.querySelector(`[data-word="${word}"]`);
  }

  setSelected(letter: string | null) {
    this.lettersCol.querySelectorAll(".card").forEach((c) => c.classList.remove("selected"));
    if (letter) {
      this.getLetterCard(letter)?.classList.add("selected");
    }
  }

  markMatched(letter: string, word: string) {
    this.getLetterCard(letter)?.classList.add("matched");
    this.getPictureCard(word)?.classList.add("matched");
  }

  private svgPoint(el: HTMLElement): Point {
    const svgRect = this.svg.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    return {
      x: elRect.left + elRect.width / 2 - svgRect.left,
      y: elRect.top + elRect.height / 2 - svgRect.top,
    };
  }

  startLine(letter: string) {
    const card = this.getLetterCard(letter);
    if (!card) return;
    const p = this.svgPoint(card);
    this.tempLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
    this.tempLine.classList.add("line-temp");
    this.tempLine.setAttribute("x1", String(p.x));
    this.tempLine.setAttribute("y1", String(p.y));
    this.tempLine.setAttribute("x2", String(p.x));
    this.tempLine.setAttribute("y2", String(p.y));
    this.svg.appendChild(this.tempLine);
  }

  updateLine(clientX: number, clientY: number) {
    if (!this.tempLine) return;
    const svgRect = this.svg.getBoundingClientRect();
    this.tempLine.setAttribute("x2", String(clientX - svgRect.left));
    this.tempLine.setAttribute("y2", String(clientY - svgRect.top));
  }

  finalizeLine(letter: string, word: string) {
    const letterCard = this.getLetterCard(letter);
    const pictureCard = this.getPictureCard(word);
    if (!letterCard || !pictureCard) {
      this.clearTempLine();
      return;
    }

    const p1 = this.svgPoint(letterCard);
    const p2 = this.svgPoint(pictureCard);

    this.clearTempLine();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.classList.add("line-permanent");
    line.setAttribute("x1", String(p1.x));
    line.setAttribute("y1", String(p1.y));
    line.setAttribute("x2", String(p2.x));
    line.setAttribute("y2", String(p2.y));
    this.svg.appendChild(line);
  }

  clearTempLine() {
    if (this.tempLine) {
      this.tempLine.remove();
      this.tempLine = null;
    }
  }

  flashCorrect(word: string) {
    const card = this.getPictureCard(word);
    if (!card) return;
    card.classList.add("correct-flash");
    card.addEventListener("animationend", () => card.classList.remove("correct-flash"), { once: true });
  }

  flashError(word: string) {
    const card = this.getPictureCard(word);
    if (!card) return;
    card.classList.add("error-flash");
    card.addEventListener("animationend", () => card.classList.remove("error-flash"), { once: true });
  }

  showRoundComplete() {
    this.feedbackEl.textContent = "כל הכבוד! עוברים לסיבוב הבא...";
  }

  showVictory() {
    // Hide game area
    const gameArea = document.getElementById("game-area")!;
    gameArea.style.display = "none";
    this.roundIndicator.style.display = "none";

    // Show banner
    this.feedbackEl.className = "feedback victory";
    this.feedbackEl.innerHTML =
      `<div class="victory-banner">` +
      `<div class="victory-star">&#11088;</div>` +
      `<div class="victory-text">&#1499;&#1500; &#1492;&#1499;&#1489;&#1493;&#1491;!</div>` +
      `<div class="victory-sub">&#1505;&#1497;&#1497;&#1502;&#1514;&#1501; &#1488;&#1514; &#1499;&#1500; &#1492;&#1505;&#1497;&#1489;&#1493;&#1489;&#1497;&#1501;!</div>` +
      `</div>`;

    // Confetti
    this.spawnConfetti();
  }

  private spawnConfetti() {
    const container = document.createElement("div");
    container.className = "confetti-container";
    document.body.appendChild(container);

    const colors = ["#ff6b6b", "#ffd93d", "#6bcb77", "#4d96ff", "#ff6ec7", "#a66cff"];
    const shapes = ["square", "circle"];

    for (let i = 0; i < 80; i++) {
      const piece = document.createElement("div");
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 2 + Math.random() * 2;
      const size = 8 + Math.random() * 8;

      piece.className = `confetti-piece confetti-${shape}`;
      piece.style.cssText =
        `left:${left}%;` +
        `background:${color};` +
        `width:${size}px;height:${size}px;` +
        `animation-delay:${delay}s;` +
        `animation-duration:${duration}s;`;
      container.appendChild(piece);
    }
  }
}
