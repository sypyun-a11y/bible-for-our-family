"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBook, loadIndex, type BookMeta, type VerseRef } from "@/lib/bible";
import { dailyVerseRef, randomVerseRefFromPool } from "@/lib/daily";
import { useLocalStorage, useHydrated } from "@/lib/storage";

type DisplayVerse = {
  ref: VerseRef;
  text: string;
  meta: BookMeta;
};

async function fetchVerse(ref: VerseRef, index: BookMeta[]): Promise<DisplayVerse> {
  const book = await loadBook(ref.book);
  const meta = index.find((m) => m.id === ref.book)!;
  const text = book.chapters[ref.chapter - 1][ref.verse - 1];
  return { ref, text, meta };
}

export default function HomePage() {
  const hydrated = useHydrated();
  const [verse, setVerse] = useState<DisplayVerse | null>(null);
  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [planState] = useLocalStorage<{
    planId: string;
    startedAt: string;
    completed: Record<number, boolean>;
  } | null>("activePlan", null);

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  useEffect(() => {
    if (index.length === 0) return;
    const ref = mode === "daily" ? dailyVerseRef() : randomVerseRefFromPool();
    fetchVerse(ref, index).then(setVerse);
  }, [mode, index]);

  const verseKey = verse ? `${verse.ref.book}.${verse.ref.chapter}.${verse.ref.verse}` : "";
  const isFav = hydrated && favorites.includes(verseKey);

  const toggleFav = () => {
    if (!verseKey) return;
    setFavorites((prev) =>
      prev.includes(verseKey) ? prev.filter((k) => k !== verseKey) : [...prev, verseKey],
    );
  };

  const today = new Date();
  const todayLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-[color:var(--card)] border border-[color:var(--border)] p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-[color:var(--muted)]">{todayLabel}</p>
            <h2 className="text-lg font-semibold mt-0.5">
              {mode === "daily" ? "오늘의 말씀" : "랜덤 말씀"}
            </h2>
          </div>
          <div className="flex gap-1 rounded-full bg-[color:var(--background)] p-1 border border-[color:var(--border)]">
            <button
              onClick={() => setMode("daily")}
              className={`px-3 py-1 text-xs rounded-full transition ${
                mode === "daily"
                  ? "bg-[color:var(--accent)] text-white"
                  : "text-[color:var(--muted)]"
              }`}
            >
              매일
            </button>
            <button
              onClick={() => setMode("random")}
              className={`px-3 py-1 text-xs rounded-full transition ${
                mode === "random"
                  ? "bg-[color:var(--accent)] text-white"
                  : "text-[color:var(--muted)]"
              }`}
            >
              랜덤
            </button>
          </div>
        </div>

        {verse ? (
          <div className="space-y-4">
            <p className="verse-text text-xl leading-relaxed font-medium">
              {verse.text}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-[color:var(--border)]">
              <Link
                href={`/read?book=${verse.ref.book}&chapter=${verse.ref.chapter}#v${verse.ref.verse}`}
                className="text-sm text-[color:var(--accent)] font-medium hover:underline"
              >
                {verse.meta.koName} {verse.ref.chapter}:{verse.ref.verse}
              </Link>
              <button
                onClick={toggleFav}
                className="text-sm px-3 py-1.5 rounded-full border border-[color:var(--border)] hover:bg-[color:var(--background)] transition"
              >
                {isFav ? "★ 저장됨" : "☆ 저장"}
              </button>
            </div>
          </div>
        ) : (
          <div className="h-32 animate-pulse rounded bg-[color:var(--background)]" />
        )}
      </section>

      <section className="grid grid-cols-2 gap-3">
        <Link
          href="/read"
          className="rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
        >
          <p className="text-sm text-[color:var(--muted)]">전체 읽기</p>
          <p className="font-semibold mt-1">창세기 ~ 요한계시록</p>
        </Link>
        <Link
          href="/plan"
          className="rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
        >
          <p className="text-sm text-[color:var(--muted)]">통독 계획</p>
          <p className="font-semibold mt-1">
            {planState ? "오늘의 분량 →" : "시작하기 →"}
          </p>
        </Link>
        <Link
          href="/search"
          className="rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
        >
          <p className="text-sm text-[color:var(--muted)]">구절 검색</p>
          <p className="font-semibold mt-1">키워드 / 책·장·절</p>
        </Link>
        <Link
          href="/saved"
          className="rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
        >
          <p className="text-sm text-[color:var(--muted)]">보관함</p>
          <p className="font-semibold mt-1">
            {hydrated ? `즐겨찾기 ${favorites.length}개` : "즐겨찾기"}
          </p>
        </Link>
      </section>

      <p className="text-center text-xs text-[color:var(--muted)] mt-4">
        개역한글판 · 공개 도메인
      </p>
    </div>
  );
}
