"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { keyToRef, loadBook, loadIndex, type BookData, type BookMeta } from "@/lib/bible";
import { useHydrated, useLocalStorage } from "@/lib/storage";
import { BookmarkIcon, ChevronRightIcon, StarFilledIcon } from "@/lib/icons";

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
    return <div className="text-[color:var(--muted)] pt-8 text-center">불러오는 중…</div>;
  }

  return (
    <div className="space-y-5 fade-up">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">보관함</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">
          저장한 구절과 메모
        </p>
      </header>

      <div className="inline-flex gap-1 rounded-full bg-[color:var(--bg-elev)] p-1 border border-[color:var(--border)]">
        <button
          onClick={() => setTab("favorites")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
            tab === "favorites"
              ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
              : "text-[color:var(--muted)]"
          }`}
        >
          즐겨찾기 {favorites.length > 0 && `(${favorites.length})`}
        </button>
        <button
          onClick={() => setTab("notes")}
          className={`px-4 py-1.5 text-sm font-medium rounded-full transition ${
            tab === "notes"
              ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
              : "text-[color:var(--muted)]"
          }`}
        >
          메모 {Object.keys(notes).length > 0 && `(${Object.keys(notes).length})`}
        </button>
      </div>

      {keys.length === 0 ? (
        <div className="text-center py-16">
          <BookmarkIcon className="w-12 h-12 mx-auto text-[color:var(--muted)] opacity-40" />
          <p className="text-[color:var(--muted)] mt-4">
            {tab === "favorites"
              ? "아직 저장된 구절이 없습니다"
              : "아직 작성된 메모가 없습니다"}
          </p>
          <Link
            href="/read"
            className="inline-flex items-center gap-1 mt-3 text-sm font-semibold text-[color:var(--accent)]"
          >
            성경 읽으러 가기
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-[color:var(--muted)] pt-8 text-center">불러오는 중…</div>
      ) : (
        <div className="space-y-3">
          {entries.map((e) => (
            <article
              key={e.key}
              className="rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-4"
            >
              <div className="flex items-baseline justify-between mb-2">
                <Link
                  href={`/read?book=${e.book}&chapter=${e.chapter}#v${e.verse}`}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[color:var(--accent)] tracking-wider"
                >
                  <StarFilledIcon className="w-3 h-3" />
                  {e.bookName} {e.chapter}:{e.verse}
                </Link>
                <button
                  onClick={() =>
                    tab === "favorites" ? removeFavorite(e.key) : removeNote(e.key)
                  }
                  className="text-[11px] text-[color:var(--muted)] hover:text-red-500 active:text-red-600 transition"
                >
                  삭제
                </button>
              </div>
              <p className="verse-text text-[15px] leading-relaxed text-[color:var(--fg)]">
                {e.text}
              </p>
              {e.note && (
                <div className="mt-3 pt-3 border-t border-[color:var(--border)]">
                  <p className="text-[11px] uppercase tracking-wider text-[color:var(--muted)] font-semibold mb-1">
                    메모
                  </p>
                  <p className="text-sm whitespace-pre-wrap text-[color:var(--fg-soft)] leading-relaxed">
                    {e.note}
                  </p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
