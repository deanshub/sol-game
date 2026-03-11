export interface Level {
  word: string;
  correctEmoji: string;
  options: string[];
}

// 10 levels, gradually harder.
// Easy (1-3): very common objects, visually distinct distractors
// Medium (4-7): less obvious words, some same-category distractors
// Hard (8-10): similar-sounding or trickier words, closer distractors
export const LEVELS: Level[] = [
  // --- Easy ---
  {
    word: "cat",
    correctEmoji: "🐱",
    options: ["🐱", "🚗", "🌳", "⭐", "📚"],
  },
  {
    word: "sun",
    correctEmoji: "☀️",
    options: ["☀️", "🐟", "🏠", "🎈", "👟"],
  },
  {
    word: "apple",
    correctEmoji: "🍎",
    options: ["🍎", "🐶", "✈️", "🎵", "🪑"],
  },
  // --- Medium ---
  {
    word: "umbrella",
    correctEmoji: "☂️",
    options: ["☂️", "🌈", "🧢", "🧤", "👜"],
  },
  {
    word: "butterfly",
    correctEmoji: "🦋",
    options: ["🦋", "🐝", "🐛", "🕷️", "🐞"],
  },
  {
    word: "guitar",
    correctEmoji: "🎸",
    options: ["🎸", "🎺", "🥁", "🎹", "🎻"],
  },
  {
    word: "rocket",
    correctEmoji: "🚀",
    options: ["🚀", "✈️", "🚁", "🛸", "🎆"],
  },
  // --- Hard ---
  {
    word: "crown",
    correctEmoji: "👑",
    options: ["👑", "🤡", "🦀", "🌽", "🖍️"],
  },
  {
    word: "globe",
    correctEmoji: "🌍",
    options: ["🌍", "🔮", "🏀", "🧅", "🫧"],
  },
  {
    word: "anchor",
    correctEmoji: "⚓",
    options: ["⚓", "🔗", "🪝", "⛏️", "🗡️"],
  },
];
