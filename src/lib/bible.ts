export type Testament = "OT" | "NT";

export type BookMeta = {
  id: number;
  koName: string;
  koAbbr: string;
  enName: string;
  enAbbr: string;
  testament: Testament;
  chapterCount: number;
  verseCounts: number[];
};

export type BookData = {
  id: number;
  koName: string;
  koAbbr: string;
  enName: string;
  enAbbr: string;
  testament: Testament;
  chapters: string[][];
};

export type VerseRef = { book: number; chapter: number; verse: number };

export type VerseHit = VerseRef & { text: string };

let indexCache: BookMeta[] | null = null;
const bookCache = new Map<number, BookData>();

export async function loadIndex(): Promise<BookMeta[]> {
  if (indexCache) return indexCache;
  const res = await fetch("/bible/index.json");
  if (!res.ok) throw new Error("Failed to load bible index");
  indexCache = (await res.json()) as BookMeta[];
  return indexCache;
}

export async function loadBook(bookId: number): Promise<BookData> {
  const cached = bookCache.get(bookId);
  if (cached) return cached;
  const res = await fetch(`/bible/books/${bookId}.json`);
  if (!res.ok) throw new Error(`Failed to load book ${bookId}`);
  const data = (await res.json()) as BookData;
  bookCache.set(bookId, data);
  return data;
}

export function refToKey(ref: VerseRef): string {
  return `${ref.book}.${ref.chapter}.${ref.verse}`;
}

export function keyToRef(key: string): VerseRef {
  const [book, chapter, verse] = key.split(".").map(Number);
  return { book, chapter, verse };
}

export function formatRef(meta: BookMeta, chapter: number, verse?: number): string {
  if (verse === undefined) return `${meta.koName} ${chapter}장`;
  return `${meta.koName} ${chapter}:${verse}`;
}

export function formatRefShort(meta: BookMeta, chapter: number, verse?: number): string {
  if (verse === undefined) return `${meta.koAbbr}${chapter}`;
  return `${meta.koAbbr}${chapter}:${verse}`;
}
