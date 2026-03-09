import type { GameState, MatchedPair, RoundConfig } from "./types";

export class Game {
  private state: GameState;
  private rounds: RoundConfig[];
  onChange: () => void = () => {};

  constructor(rounds: RoundConfig[]) {
    this.rounds = rounds;
    this.state = {
      currentRound: 0,
      totalRounds: rounds.length,
      matchedPairs: [],
      selectedLetter: null,
    };
  }

  getState(): Readonly<GameState> {
    return this.state;
  }

  getRounds(): readonly RoundConfig[] {
    return this.rounds;
  }

  getCurrentRound(): RoundConfig {
    return this.rounds[this.state.currentRound];
  }

  selectLetter(letter: string) {
    if (this.state.matchedPairs.some((p) => p.letter === letter)) return;
    this.state.selectedLetter = letter;
    this.onChange();
  }

  clearSelection() {
    this.state.selectedLetter = null;
    this.onChange();
  }

  attemptMatch(letter: string, word: string): boolean {
    const round = this.getCurrentRound();
    const item = round.items.find((i) => i.letter === letter && i.word === word);
    if (item) {
      this.state.matchedPairs.push({ letter, word });
      this.state.selectedLetter = null;
      this.onChange();
      return true;
    }
    this.state.selectedLetter = null;
    this.onChange();
    return false;
  }

  isRoundComplete(): boolean {
    return this.state.matchedPairs.length === this.getCurrentRound().items.length;
  }

  nextRound(): boolean {
    if (this.state.currentRound >= this.rounds.length - 1) return false;
    this.state.currentRound++;
    this.state.matchedPairs = [];
    this.state.selectedLetter = null;
    this.onChange();
    return true;
  }

  isGameComplete(): boolean {
    return (
      this.state.currentRound === this.rounds.length - 1 &&
      this.isRoundComplete()
    );
  }
}
