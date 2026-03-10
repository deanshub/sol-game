const STORAGE_KEY = "sol-game-completed";

function getCompleted(): Set<string> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? new Set(JSON.parse(data)) : new Set();
  } catch {
    return new Set();
  }
}

export function markCompleted(gameId: string) {
  const completed = getCompleted();
  completed.add(gameId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
}

export function isCompleted(gameId: string): boolean {
  return getCompleted().has(gameId);
}
