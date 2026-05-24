import type { VerseRef } from "./bible";

// Curated popular verses for 오늘의 말씀 (deterministic daily rotation).
// Book IDs: 1=창세기 ... 66=요한계시록.
export const DAILY_POOL: VerseRef[] = [
  { book: 19, chapter: 23, verse: 1 },
  { book: 19, chapter: 23, verse: 4 },
  { book: 19, chapter: 46, verse: 1 },
  { book: 19, chapter: 119, verse: 105 },
  { book: 19, chapter: 121, verse: 1 },
  { book: 19, chapter: 121, verse: 2 },
  { book: 19, chapter: 1, verse: 1 },
  { book: 19, chapter: 27, verse: 1 },
  { book: 19, chapter: 37, verse: 4 },
  { book: 19, chapter: 37, verse: 5 },
  { book: 19, chapter: 90, verse: 12 },
  { book: 20, chapter: 3, verse: 5 },
  { book: 20, chapter: 3, verse: 6 },
  { book: 20, chapter: 16, verse: 3 },
  { book: 20, chapter: 16, verse: 9 },
  { book: 23, chapter: 40, verse: 31 },
  { book: 23, chapter: 41, verse: 10 },
  { book: 23, chapter: 43, verse: 2 },
  { book: 23, chapter: 53, verse: 5 },
  { book: 23, chapter: 55, verse: 8 },
  { book: 23, chapter: 55, verse: 9 },
  { book: 24, chapter: 29, verse: 11 },
  { book: 24, chapter: 33, verse: 3 },
  { book: 25, chapter: 3, verse: 22 },
  { book: 25, chapter: 3, verse: 23 },
  { book: 40, chapter: 5, verse: 3 },
  { book: 40, chapter: 5, verse: 4 },
  { book: 40, chapter: 5, verse: 6 },
  { book: 40, chapter: 5, verse: 16 },
  { book: 40, chapter: 6, verse: 33 },
  { book: 40, chapter: 7, verse: 7 },
  { book: 40, chapter: 11, verse: 28 },
  { book: 40, chapter: 11, verse: 29 },
  { book: 40, chapter: 22, verse: 37 },
  { book: 40, chapter: 22, verse: 39 },
  { book: 40, chapter: 28, verse: 20 },
  { book: 43, chapter: 1, verse: 1 },
  { book: 43, chapter: 3, verse: 16 },
  { book: 43, chapter: 14, verse: 6 },
  { book: 43, chapter: 14, verse: 27 },
  { book: 43, chapter: 15, verse: 5 },
  { book: 43, chapter: 16, verse: 33 },
  { book: 45, chapter: 5, verse: 8 },
  { book: 45, chapter: 8, verse: 28 },
  { book: 45, chapter: 8, verse: 38 },
  { book: 45, chapter: 12, verse: 2 },
  { book: 45, chapter: 12, verse: 12 },
  { book: 46, chapter: 13, verse: 4 },
  { book: 46, chapter: 13, verse: 13 },
  { book: 46, chapter: 10, verse: 13 },
  { book: 47, chapter: 5, verse: 17 },
  { book: 47, chapter: 12, verse: 9 },
  { book: 48, chapter: 5, verse: 22 },
  { book: 49, chapter: 2, verse: 8 },
  { book: 50, chapter: 4, verse: 6 },
  { book: 50, chapter: 4, verse: 7 },
  { book: 50, chapter: 4, verse: 13 },
  { book: 55, chapter: 1, verse: 7 },
  { book: 58, chapter: 11, verse: 1 },
  { book: 58, chapter: 12, verse: 1 },
  { book: 58, chapter: 13, verse: 8 },
  { book: 59, chapter: 1, verse: 5 },
  { book: 60, chapter: 5, verse: 7 },
  { book: 62, chapter: 4, verse: 7 },
  { book: 62, chapter: 4, verse: 8 },
  { book: 62, chapter: 4, verse: 19 },
  { book: 66, chapter: 3, verse: 20 },
  { book: 66, chapter: 21, verse: 4 },
];

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

export function dailyVerseRef(date = new Date()): VerseRef {
  const idx = hashString(todayKey(date)) % DAILY_POOL.length;
  return DAILY_POOL[idx];
}

export function randomVerseRefFromPool(): VerseRef {
  return DAILY_POOL[Math.floor(Math.random() * DAILY_POOL.length)];
}
