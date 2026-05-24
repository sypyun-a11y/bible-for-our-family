"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { keyToRef, loadBook, loadIndex, type BookData, type BookMeta } from "@/lib/bible";
import { useHydrated, useLocalStorage } from "@/lib/storage";

type Entry = {
  key: string;
  book: number;
  chapter: number;
  verse: number;
  text: string;
  bookName: string;
  note?: string;
};

export default function SavedPage() {
  const hydrated = useHydrated();
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("notes", {});
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [books, setBooks] = useState<Map<number, BookData>>(new Map());
  const [tab, setTab] = useState<"favorites" | "notes">("favorites");

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const keys = useMemo(() => {
    if (!hydrated) return [];
    return tab === "favorites" ? favorites : Object.keys(notes);
  }, [tab, favorites, notes, hydrated]);

  useEffect(() => {
    if (keys.length === 0) return;
    const needed = new Set(keys.map((k) => Number(k.split(".")[0])));
    const missing = [...needed].filter((id) => !books.has(id));
    if (missing.length === 0) return;
    Promise.all(missing.map((id) => loadBook(id))).then((loaded) => {
      setBooks((prev) => {
        const next = new Map(prev);
        for (const b of loaded) next.set(b.id, b);
        return next;
      });
    });
  }, [keys, books]);

  const entries: Entry[] = useMemo(() => {
    const result: Entry[] = [];
    for (const key of keys) {
      const ref = keyToRef(key);
      const book = books.get(ref.book);
      const meta = index.find((m) => m.id === ref.book);
      if (!book || !meta) continue;
      const text = book.chapters[ref.chapter - 1]?.[ref.verse - 1];
      if (!text) continue;
      result.push({
        key,
        ...ref,
        text,
        bookName: meta.koName,
        note: notes[key],
      });
    }
    return result;
  }, [keys, books, index, notes]);

  const removeFavorite = (key: string) => {
    setFavorites((prev) => prev.filter((k) => k !== key));
  };

  const removeNote = (key: string) => {
    setNotes((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  if (!hydrated) {
    return <div className="text-[color:var(--muted)]">불러오는 중…</div>;
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">보관함</h1>
      </header>

      <div className="flex gap-1 rounded-full bg-[color:var(--card)] p-1 border border-[color:var(--border)] w-fit">
        <button
          onClick={() => setTab("favorites")}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            tab === "favorites"
              ? "bg-[color:var(--accent)] text-white"
              : "text-[color:var(--muted)]"
          }`}
        >
          즐겨찾기 {favorites.length > 0 && `(${favorites.length})`}
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`px-4 py-1.5 text-sm rounded-full transition ${
            tab === "notes"
              ? "bg-[color:var(--accent)] text-white"
              : "text-[color:var(--muted)]"
          }`}
        >
          메모 {Object.keys(notes).length > 0 && `(${Object.keys(notes).length})`}
        </button>
      </div>

      {keys.length === 0 ? (
        <p className="text-center text-[color:var(--muted)] py-12">
          {tab === "favorites"
            ? "아직 저장된 구절이 없습니다."
            : "아직 작성된 메모가 없습니다."}
        </p>
      ) : entries.length === 0 ? (
        <div className="text-[color:var(--muted)]">불러오는 중…</div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <article
              key={e.key}
              className="rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4"
            >
              <div className="flex items-baseline justify-between mb-2">
                <Link
                  href={`/read?book=${e.book}&chapter=${e.chapter}#v${e.verse}`}
                  className="text-xs text-[color:var(--accent)] font-medium hover:underline"
                >
                  {e.bookName} {e.chapter}:{e.verse}
                </Link>
                <button
                  onClick={() =>
                    tab === "favorites" ? removeFavorite(e.key) : removeNote(e.key)
                  }
                  className="text-xs text-[color:var(--muted)] hover:text-red-500"
                >
                  삭제
                </button>
              </div>
              <p className="verse-text text-base leading-relaxed">{e.text}</p>
              {e.note && (
                <div className="mt-3 pt-3 border-t border-[color:var(--border)]">
                  <p className="text-xs text-[color:var(--muted)] mb-1">메모</p>
                  <p className="text-sm whitespace-pre-wrap">{e.note}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
