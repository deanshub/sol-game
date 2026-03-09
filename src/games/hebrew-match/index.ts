import { Game } from "./game";
import { Renderer } from "./renderer";
import { buildRounds } from "./data";
import { playCorrect, playError, playRoundComplete, playVictory } from "./sounds";

const rounds = buildRounds();
const game = new Game(rounds);
const renderer = new Renderer();

let isDrawing = false;

function renderCurrentRound() {
  const state = game.getState();
  renderer.renderRound(game.getCurrentRound(), state.currentRound, state.totalRounds);
}

game.onChange = () => {
  const state = game.getState();
  renderer.setSelected(state.selectedLetter);
};

renderCurrentRound();

const gameArea = document.getElementById("game-area")!;

gameArea.addEventListener("pointerdown", (e) => {
  const target = (e.target as HTMLElement).closest<HTMLElement>(".letter-card");
  if (!target || target.classList.contains("matched")) return;

  const letter = target.dataset.letter!;
  game.selectLetter(letter);
  renderer.startLine(letter);
  isDrawing = true;

  (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
});

document.addEventListener("pointermove", (e) => {
  if (!isDrawing) return;
  renderer.updateLine(e.clientX, e.clientY);
});

document.addEventListener("pointerup", (e) => {
  if (!isDrawing) return;
  isDrawing = false;

  const state = game.getState();
  const selectedLetter = state.selectedLetter;
  if (!selectedLetter) {
    renderer.clearTempLine();
    return;
  }

  const elUnder = document.elementFromPoint(e.clientX, e.clientY);
  const pictureCard = elUnder?.closest<HTMLElement>(".picture-card");

  if (pictureCard && !pictureCard.classList.contains("matched")) {
    const word = pictureCard.dataset.word!;
    const correct = game.attemptMatch(selectedLetter, word);

    if (correct) {
      playCorrect();
      renderer.finalizeLine(selectedLetter, word);
      renderer.markMatched(selectedLetter, word);
      renderer.flashCorrect(word);

      if (game.isGameComplete()) {
        playVictory();
        renderer.showVictory();
        const base = document.getElementById("base-url")?.dataset.base || "/";
        setTimeout(() => { window.location.href = base; }, 5000);
      } else if (game.isRoundComplete()) {
        playRoundComplete();
        renderer.showRoundComplete();
        setTimeout(() => {
          game.nextRound();
          renderCurrentRound();
        }, 1200);
      }
    } else {
      playError();
      renderer.clearTempLine();
      renderer.flashError(word);
    }
  } else {
    renderer.clearTempLine();
    game.clearSelection();
  }
});
