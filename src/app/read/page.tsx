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
import { useReaderFontScale } from "@/lib/reader-settings";
import {
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  MinusIcon,
  PlusIcon,
  StarFilledIcon,
  StarIcon,
} from "@/lib/icons";

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
  const [openVerse, setOpenVerse] = useState<number | null>(null);
  const { index: scaleIdx, inc, dec, canInc, canDec } = useReaderFontScale();

  const bookId = Number(params.get("book") ?? "0");
  const chapter = Number(params.get("chapter") ?? "0");
  const bookMeta = index.find((m) => m.id === bookId) ?? null;

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  useEffect(() => {
    if (!bookId || !chapter) return;
    loadBook(bookId).then(setBook);
    setOpenVerse(null);
  }, [bookId, chapter]);

  useEffect(() => {
    if (bookId && chapter) setLastRead({ book: bookId, chapter });
  }, [bookId, chapter, setLastRead]);

  const verses = useMemo(() => {
    if (!book || !chapter) return [];
    return book.chapters[chapter - 1] ?? [];
  }, [book, chapter]);

  if (!bookId || !chapter) {
    return <BookPicker index={index} lastRead={lastRead} />;
  }

  if (!bookMeta || !book) {
    return <ReaderSkeleton />;
  }

  const prev = previousChapter(bookMeta, chapter, index);
  const next = nextChapter(bookMeta, chapter, index);

  const toggleFav = (verseIdx: number) => {
    const key = `${bookId}.${chapter}.${verseIdx + 1}`;
    setFavorites((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key],
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
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between -mt-2">
        <button
          onClick={() => router.push("/read")}
          className="inline-flex items-center gap-1 text-sm font-medium text-[color:var(--muted)] active:text-[color:var(--accent)] py-2 -ml-2 pl-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          목차
        </button>

        <div className="inline-flex items-center gap-0.5 rounded-full bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-1">
          <button
            onClick={dec}
            disabled={!canDec}
            aria-label="글씨 작게"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[color:var(--fg-soft)] disabled:opacity-30 active:bg-[color:var(--bg)]"
          >
            <MinusIcon className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-medium text-[color:var(--muted)] px-1 tabular-nums w-6 text-center">
            {scaleIdx + 1}
          </span>
          <button
            onClick={inc}
            disabled={!canInc}
            aria-label="글씨 크게"
            className="w-8 h-8 inline-flex items-center justify-center rounded-full text-[color:var(--fg-soft)] disabled:opacity-30 active:bg-[color:var(--bg)]"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <header className="text-center">
        <p className="text-[11px] uppercase tracking-widest text-[color:var(--muted)] font-medium">
          {bookMeta.enName}
        </p>
        <ChapterPicker
          bookMeta={bookMeta}
          chapter={chapter}
          onPick={(c) => router.push(`/read?book=${bookId}&chapter=${c}`)}
        />
      </header>

      <div className="reader-body space-y-4">
        {verses.map((text, i) => {
          const verseNum = i + 1;
          const key = `${bookId}.${chapter}.${verseNum}`;
          const isFav = hydrated && favorites.includes(key);
          const note = hydrated ? notes[key] : undefined;
          const isOpen = openVerse === verseNum;
          return (
            <article
              key={i}
              id={`v${verseNum}`}
              className="scroll-mt-20 group"
            >
              <button
                onClick={() => setOpenVerse(isOpen ? null : verseNum)}
                className="w-full text-left flex gap-3 items-start"
              >
                <span
                  className={`reader-verse-num flex-none w-7 pt-[0.35em] text-right font-semibold tabular-nums transition ${
                    isFav
                      ? "text-[color:var(--accent)]"
                      : "text-[color:var(--muted)]"
                  }`}
                >
                  {isFav ? "★" : verseNum}
                </span>
                <span
                  className={`verse-text flex-1 ${
                    note ? "bg-[color:var(--highlight)]/40 rounded px-1 -mx-1" : ""
                  }`}
                >
                  {text}
                </span>
              </button>

              {isOpen && (
                <div className="ml-10 mt-2 mb-2 fade-up">
                  <div className="flex items-center gap-2 mb-2">
                    <button
                      onClick={() => toggleFav(i)}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[color:var(--border)] active:bg-[color:var(--bg)]"
                    >
                      {isFav ? (
                        <>
                          <StarFilledIcon className="w-3.5 h-3.5 text-[color:var(--accent)]" />
                          저장됨
                        </>
                      ) : (
                        <>
                          <StarIcon className="w-3.5 h-3.5" />
                          저장
                        </>
                      )}
                    </button>
                  </div>
                  <NoteEditor
                    initial={note ?? ""}
                    onSave={(v) => updateNote(i, v)}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-6 border-t border-[color:var(--border)]">
        {prev ? (
          <Link
            href={`/read?book=${prev.book}&chapter=${prev.chapter}`}
            className="rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-4 flex items-center gap-2 active:scale-[0.98] transition"
          >
            <ChevronLeftIcon className="w-5 h-5 text-[color:var(--muted)]" />
            <div className="text-left">
              <p className="text-[11px] text-[color:var(--muted)]">이전</p>
              <p className="text-sm font-semibold">{prev.label}</p>
            </div>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={`/read?book=${next.book}&chapter=${next.chapter}`}
            className="rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-4 flex items-center justify-end gap-2 active:scale-[0.98] transition"
          >
            <div className="text-right">
              <p className="text-[11px] text-[color:var(--muted)]">다음</p>
              <p className="text-sm font-semibold">{next.label}</p>
            </div>
            <ChevronRightIcon className="w-5 h-5 text-[color:var(--accent)]" />
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}

function ChapterPicker({
  bookMeta,
  chapter,
  onPick,
}: {
  bookMeta: BookMeta;
  chapter: number;
  onPick: (c: number) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative inline-block mt-1">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 text-2xl font-bold tracking-tight active:opacity-70"
      >
        {bookMeta.koName} {chapter}장
        <ChevronDownIcon className="w-5 h-5 text-[color:var(--muted)]" />
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-30 w-64 max-h-72 overflow-y-auto rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] shadow-[var(--shadow-hover)] p-2">
            <div className="grid grid-cols-5 gap-1">
              {Array.from({ length: bookMeta.chapterCount }, (_, i) => i + 1).map((c) => (
                <button
                  key={c}
                  onClick={() => {
                    onPick(c);
                    setOpen(false);
                  }}
                  className={`aspect-square rounded-lg text-sm font-medium transition ${
                    c === chapter
                      ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                      : "text-[color:var(--fg-soft)] hover:bg-[color:var(--bg)]"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
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
  const [value, setValue] = useState(initial);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  return (
    <div className="rounded-xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-3">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(value)}
        placeholder="이 구절에 대한 묵상을 적어보세요"
        rows={3}
        className="w-full bg-transparent text-sm leading-relaxed resize-none focus:outline-none"
      />
      {value && (
        <div className="flex justify-end mt-1">
          <button
            onClick={() => {
              setValue("");
              onSave("");
            }}
            className="text-[11px] text-[color:var(--muted)] underline"
          >
            메모 삭제
          </button>
        </div>
      )}
    </div>
  );
}

function ReaderSkeleton() {
  return (
    <div className="space-y-3 pt-4">
      <div className="h-8 w-1/2 mx-auto rounded animate-pulse bg-[color:var(--bg-elev)]" />
      <div className="h-5 rounded animate-pulse bg-[color:var(--bg-elev)] mt-6" />
      <div className="h-5 w-11/12 rounded animate-pulse bg-[color:var(--bg-elev)]" />
      <div className="h-5 w-5/6 rounded animate-pulse bg-[color:var(--bg-elev)]" />
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
  const lastReadBook = lastRead ? index.find((b) => b.id === lastRead.book) : null;

  return (
    <div className="space-y-6 fade-up">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">성경 읽기</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">개역한글판 · 66권</p>
      </header>

      {lastReadBook && lastRead && (
        <Link
          href={`/read?book=${lastRead.book}&chapter=${lastRead.chapter}`}
          className="block rounded-2xl bg-[color:var(--accent-soft)] p-4 flex items-center justify-between"
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">
              이어서 읽기
            </p>
            <p className="font-semibold mt-1">
              {lastReadBook.koName} {lastRead.chapter}장
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-[color:var(--accent)]" />
        </Link>
      )}

      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-[color:var(--muted)] mb-3 px-1">
          구약 · 39권
        </h2>
        <BookGrid books={ot} />
      </section>

      <section>
        <h2 className="text-xs font-semibold tracking-widest uppercase text-[color:var(--muted)] mb-3 px-1">
          신약 · 27권
        </h2>
        <BookGrid books={nt} />
      </section>
    </div>
  );
}

function BookGrid({ books }: { books: BookMeta[] }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {books.map((b) => (
        <Link
          key={b.id}
          href={`/read?book=${b.id}&chapter=1`}
          className="rounded-xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] py-3 px-2 text-center hover:border-[color:var(--accent)] active:scale-95 transition"
        >
          <p className="font-semibold text-sm tracking-tight">{b.koName}</p>
          <p className="text-[10px] text-[color:var(--muted)] mt-0.5">
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
    <Suspense fallback={<ReaderSkeleton />}>
      <ReadInner />
    </Suspense>
  );
}
