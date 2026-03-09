export interface LetterData {
  letter: string;
  name: string;
  emoji: string;
  word: string;
}

export interface RoundConfig {
  items: LetterData[];
}

export interface MatchedPair {
  letter: string;
  word: string;
}

export interface GameState {
  currentRound: number;
  totalRounds: number;
  matchedPairs: MatchedPair[];
  selectedLetter: string | null;
}

export interface Point {
  x: number;
  y: number;
}
