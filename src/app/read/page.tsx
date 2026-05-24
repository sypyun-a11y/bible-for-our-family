"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  loadBook,
  loadIndex,
  type BookData,
  type BookMeta,
} from "@/lib/bible";
import { useLocalStorage, useHydrated } from "@/lib/storage";

function ReadInner() {
  const router = useRouter();
  const params = useSearchParams();
  const hydrated = useHydrated();
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [book, setBook] = useState<BookData | null>(null);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [notes, setNotes] = useLocalStorage<Record<string, string>>("notes", {});
  const [lastRead, setLastRead] = useLocalStorage<{ book: number; chapter: number } | null>(
    "lastRead",
    null,
  );

  const bookId = Number(params.get("book") ?? "0");
  const chapter = Number(params.get("chapter") ?? "0");
  const bookMeta = index.find((m) => m.id === bookId) ?? null;

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  useEffect(() => {
    if (!bookId || !chapter) return;
    loadBook(bookId).then(setBook);
  }, [bookId, chapter]);

  useEffect(() => {
    if (bookId && chapter) {
      setLastRead({ book: bookId, chapter });
    }
  }, [bookId, chapter, setLastRead]);

  const verses = useMemo(() => {
    if (!book || !chapter) return [];
    return book.chapters[chapter - 1] ?? [];
  }, [book, chapter]);

  if (!bookId || !chapter) {
    return <BookPicker index={index} lastRead={lastRead} />;
  }

  if (!bookMeta || !book) {
    return <div className="text-[color:var(--muted)]">불러오는 중…</div>;
  }

  const prev = previousChapter(bookMeta, chapter, index);
  const next = nextChapter(bookMeta, chapter, index);

  const toggleFav = (verseIdx: number) => {
    const key = `${bookId}.${chapter}.${verseIdx + 1}`;
    setFavorites((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const updateNote = (verseIdx: number, value: string) => {
    const key = `${bookId}.${chapter}.${verseIdx + 1}`;
    setNotes((prev) => {
      const copy = { ...prev };
      if (value.trim() === "") delete copy[key];
      else copy[key] = value;
      return copy;
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/read")}
          className="text-sm text-[color:var(--accent)] font-medium"
        >
          ← 목차
        </button>
        <div className="text-center">
          <p className="text-xs text-[color:var(--muted)]">{bookMeta.enName}</p>
          <h1 className="text-xl font-bold tracking-tight">
            {bookMeta.koName} {chapter}장
          </h1>
        </div>
        <select
          value={chapter}
          onChange={(e) =>
            router.push(`/read?book=${bookId}&chapter=${e.target.value}`)
          }
          className="text-sm bg-transparent border border-[color:var(--border)] rounded-md px-2 py-1"
        >
          {Array.from({ length: bookMeta.chapterCount }, (_, i) => i + 1).map((c) => (
            <option key={c} value={c}>
              {c}장
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {verses.map((text, i) => {
          const key = `${bookId}.${chapter}.${i + 1}`;
          const isFav = hydrated && favorites.includes(key);
          const note = hydrated ? notes[key] : undefined;
          return (
            <article
              key={i}
              id={`v${i + 1}`}
              className="group flex gap-3 scroll-mt-20"
            >
              <button
                onClick={() => toggleFav(i)}
                className={`flex-none w-8 text-right text-sm font-mono pt-1 ${
                  isFav ? "text-[color:var(--accent)]" : "text-[color:var(--muted)]"
                }`}
                aria-label={`${i + 1}절 ${isFav ? "즐겨찾기 해제" : "즐겨찾기"}`}
              >
                {isFav ? "★" : i + 1}
              </button>
              <div className="flex-1 min-w-0">
                <p className="verse-text text-base leading-relaxed">{text}</p>
                <NoteEditor
                  initial={note ?? ""}
                  onSave={(v) => updateNote(i, v)}
                />
              </div>
            </article>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-[color:var(--border)]">
        {prev ? (
          <Link
            href={`/read?book=${prev.book}&chapter=${prev.chapter}`}
            className="text-sm text-[color:var(--accent)] font-medium"
          >
            ← {prev.label}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/read?book=${next.book}&chapter=${next.chapter}`}
            className="text-sm text-[color:var(--accent)] font-medium ml-auto"
          >
            {next.label} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function NoteEditor({
  initial,
  onSave,
}: {
  initial: string;
  onSave: (v: string) => void;
}) {
  const [open, setOpen] = useState(initial.length > 0);
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
    setOpen(initial.length > 0);
  }, [initial]);

  return (
    <div className="mt-2">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-[color:var(--muted)] opacity-0 group-hover:opacity-100 transition"
        >
          + 메모
        </button>
      ) : (
        <div className="rounded-md bg-[color:var(--background)] border border-[color:var(--border)] p-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={() => onSave(value)}
            placeholder="메모를 적어보세요"
            rows={2}
            className="w-full bg-transparent text-sm resize-none focus:outline-none"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setValue("");
                onSave("");
                setOpen(false);
              }}
              className="text-xs text-[color:var(--muted)]"
            >
              삭제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BookPicker({
  index,
  lastRead,
}: {
  index: BookMeta[];
  lastRead: { book: number; chapter: number } | null;
}) {
  const ot = index.filter((b) => b.testament === "OT");
  const nt = index.filter((b) => b.testament === "NT");

  return (
    <div className="space-y-6">
      {lastRead && (
        <Link
          href={`/read?book=${lastRead.book}&chapter=${lastRead.chapter}`}
          className="block rounded-xl bg-[color:var(--card)] border border-[color:var(--accent)] p-4"
        >
          <p className="text-xs text-[color:var(--accent)] font-medium">이어서 읽기</p>
          <p className="font-semibold mt-1">
            {index.find((b) => b.id === lastRead.book)?.koName} {lastRead.chapter}장
          </p>
        </Link>
      )}

      <section>
        <h2 className="text-sm font-semibold text-[color:var(--muted)] mb-3">
          구약 (39권)
        </h2>
        <BookGrid books={ot} />
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[color:var(--muted)] mb-3">
          신약 (27권)
        </h2>
        <BookGrid books={nt} />
      </section>
    </div>
  );
}

function BookGrid({ books }: { books: BookMeta[] }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {books.map((b) => (
        <Link
          key={b.id}
          href={`/read?book=${b.id}&chapter=1`}
          className="rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] p-3 text-center hover:border-[color:var(--accent)] transition"
        >
          <p className="font-medium text-sm">{b.koName}</p>
          <p className="text-xs text-[color:var(--muted)] mt-0.5">
            {b.chapterCount}장
          </p>
        </Link>
      ))}
    </div>
  );
}

function previousChapter(
  meta: BookMeta,
  chapter: number,
  index: BookMeta[],
): { book: number; chapter: number; label: string } | null {
  if (chapter > 1) {
    return { book: meta.id, chapter: chapter - 1, label: `${meta.koName} ${chapter - 1}장` };
  }
  if (meta.id === 1) return null;
  const prev = index.find((b) => b.id === meta.id - 1);
  if (!prev) return null;
  return {
    book: prev.id,
    chapter: prev.chapterCount,
    label: `${prev.koName} ${prev.chapterCount}장`,
  };
}

function nextChapter(
  meta: BookMeta,
  chapter: number,
  index: BookMeta[],
): { book: number; chapter: number; label: string } | null {
  if (chapter < meta.chapterCount) {
    return { book: meta.id, chapter: chapter + 1, label: `${meta.koName} ${chapter + 1}장` };
  }
  if (meta.id === 66) return null;
  const next = index.find((b) => b.id === meta.id + 1);
  if (!next) return null;
  return { book: next.id, chapter: 1, label: `${next.koName} 1장` };
}

export default function ReadPage() {
  return (
    <Suspense fallback={<div className="text-[color:var(--muted)]">불러오는 중…</div>}>
      <ReadInner />
    </Suspense>
  );
}
