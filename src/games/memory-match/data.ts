export interface CardPair {
  display: string;
  id: string;
}

// 15 pairs (30 cards) — 5 columns x 6 rows
// Half emojis, quarter Hebrew letters, quarter English letters
// Each pair = two identical cards
export const ALL_PAIRS: CardPair[] = [
  // Emojis (8 pairs)
  { display: "🦁", id: "lion" },
  { display: "🏠", id: "house" },
  { display: "🐱", id: "cat" },
  { display: "🐶", id: "dog" },
  { display: "🌹", id: "rose" },
  { display: "⭐", id: "star" },
  { display: "🚀", id: "rocket" },
  { display: "🦋", id: "butterfly" },
  // Hebrew letters (4 pairs)
  { display: "א", id: "alef" },
  { display: "ב", id: "bet" },
  { display: "ג", id: "gimel" },
  { display: "ד", id: "dalet" },
  // English letters (3 pairs)
  { display: "A", id: "A" },
  { display: "B", id: "B" },
  { display: "C", id: "C" },
];

export const PAIR_COUNT = 15;
export const COLUMNS = 5; // 30 cards in 5 columns x 6 rows
