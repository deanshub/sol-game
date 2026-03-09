export function showVictoryBanner(feedbackEl: HTMLElement, message: string, subtitle: string) {
  feedbackEl.className = "feedback victory";
  feedbackEl.innerHTML =
    `<div class="victory-banner">` +
    `<div class="victory-star">&#11088;</div>` +
    `<div class="victory-text">${message}</div>` +
    `<div class="victory-sub">${subtitle}</div>` +
    `</div>`;
}

export function spawnConfetti() {
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
