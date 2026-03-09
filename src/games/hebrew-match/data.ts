import type { LetterData, RoundConfig } from "./types";

const ALL_LETTERS: LetterData[] = [
  { letter: "א", name: "alef", emoji: "🦁", word: "אריה" },
  { letter: "ב", name: "bet", emoji: "🏠", word: "בית" },
  { letter: "ג", name: "gimel", emoji: "🐪", word: "גמל" },
  { letter: "ד", name: "dalet", emoji: "🐟", word: "דג" },
  { letter: "ה", name: "he", emoji: "⛰️", word: "הר" },
  { letter: "ו", name: "vav", emoji: "🌹", word: "ורד" },
  { letter: "ז", name: "zayin", emoji: "🫒", word: "זית" },
  { letter: "ח", name: "chet", emoji: "🐱", word: "חתול" },
  { letter: "ט", name: "tet", emoji: "🏰", word: "טירה" },
  { letter: "י", name: "yod", emoji: "🌙", word: "ירח" },
  { letter: "כ", name: "kaf", emoji: "⭐", word: "כוכב" },
  { letter: "ל", name: "lamed", emoji: "🍋", word: "לימון" },
  { letter: "מ", name: "mem", emoji: "🔑", word: "מפתח" },
  { letter: "נ", name: "nun", emoji: "🐍", word: "נחש" },
  { letter: "ס", name: "samekh", emoji: "📖", word: "ספר" },
  { letter: "ע", name: "ayin", emoji: "🌳", word: "עץ" },
  { letter: "פ", name: "pe", emoji: "🐘", word: "פיל" },
  { letter: "צ", name: "tsade", emoji: "🐢", word: "צב" },
  { letter: "ק", name: "qof", emoji: "🐒", word: "קוף" },
  { letter: "ר", name: "resh", emoji: "🤖", word: "רובוט" },
  { letter: "ש", name: "shin", emoji: "☀️", word: "שמש" },
  { letter: "ת", name: "tav", emoji: "🍎", word: "תפוח" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildRounds(): RoundConfig[] {
  const shuffled = shuffle(ALL_LETTERS);
  const rounds: RoundConfig[] = [];
  for (let i = 0; i < shuffled.length; i += 4) {
    rounds.push({ items: shuffled.slice(i, i + 4) });
  }
  return rounds;
}
