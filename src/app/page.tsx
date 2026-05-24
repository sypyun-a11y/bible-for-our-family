"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadBook, loadIndex, type BookMeta, type VerseRef } from "@/lib/bible";
import { dailyVerseRef, randomVerseRefFromPool } from "@/lib/daily";
import { useLocalStorage, useHydrated } from "@/lib/storage";
import {
  BookIcon,
  BookmarkIcon,
  CalendarIcon,
  ChevronRightIcon,
  SearchIcon,
  StarFilledIcon,
  StarIcon,
} from "@/lib/icons";
import type { PlanState } from "@/lib/plans";

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

const KO_WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function HomePage() {
  const hydrated = useHydrated();
  const [verse, setVerse] = useState<DisplayVerse | null>(null);
  const [mode, setMode] = useState<"daily" | "random">("daily");
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [favorites, setFavorites] = useLocalStorage<string[]>("favorites", []);
  const [planState] = useLocalStorage<PlanState | null>("activePlan", null);
  const [lastRead] = useLocalStorage<{ book: number; chapter: number } | null>(
    "lastRead",
    null,
  );

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
  const dateLabel = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${KO_WEEKDAYS[today.getDay()]}요일`;
  const lastReadBook = lastRead ? index.find((b) => b.id === lastRead.book) : null;

  return (
    <div className="flex flex-col gap-5">
      <header className="pt-2 pb-1 fade-up">
        <p className="text-xs font-medium text-[color:var(--muted)] tracking-wide">
          {dateLabel}
        </p>
        <h1 className="text-2xl font-bold tracking-tight mt-1">
          {mode === "daily" ? "오늘의 말씀" : "랜덤 말씀"}
        </h1>
      </header>

      <section className="rounded-3xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-6 shadow-[var(--shadow-card)] fade-up">
        <div className="flex items-center justify-end mb-4">
          <div className="inline-flex gap-1 rounded-full bg-[color:var(--bg)] p-1 border border-[color:var(--border)]">
            <button
              onClick={() => setMode("daily")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                mode === "daily"
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                  : "text-[color:var(--muted)]"
              }`}
            >
              매일
            </button>
            <button
              onClick={() => setMode("random")}
              className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                mode === "random"
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                  : "text-[color:var(--muted)]"
              }`}
            >
              랜덤
            </button>
          </div>
        </div>

        {verse ? (
          <div className="space-y-5">
            <blockquote className="verse-text text-[22px] sm:text-[24px] leading-[1.7] font-medium text-[color:var(--fg)]">
              &ldquo;{verse.text}&rdquo;
            </blockquote>
            <div className="flex items-center justify-between pt-4 border-t border-[color:var(--border)]">
              <Link
                href={`/read?book=${verse.ref.book}&chapter=${verse.ref.chapter}#v${verse.ref.verse}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--accent)]"
              >
                {verse.meta.koName} {verse.ref.chapter}:{verse.ref.verse}
                <ChevronRightIcon className="w-4 h-4" />
              </Link>
              <button
                onClick={toggleFav}
                className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[color:var(--border)] hover:border-[color:var(--accent)] transition"
                aria-pressed={isFav}
              >
                {isFav ? (
                  <>
                    <StarFilledIcon className="w-4 h-4 text-[color:var(--accent)]" />
                    저장됨
                  </>
                ) : (
                  <>
                    <StarIcon className="w-4 h-4" />
                    저장
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="h-7 rounded animate-pulse bg-[color:var(--bg)]" />
            <div className="h-7 w-5/6 rounded animate-pulse bg-[color:var(--bg)]" />
            <div className="h-7 w-3/4 rounded animate-pulse bg-[color:var(--bg)]" />
          </div>
        )}
      </section>

      {lastReadBook && lastRead && (
        <Link
          href={`/read?book=${lastRead.book}&chapter=${lastRead.chapter}`}
          className="rounded-2xl bg-[color:var(--accent-soft)] border border-[color:var(--accent-soft)] p-4 flex items-center justify-between fade-up"
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">
              이어서 읽기
            </p>
            <p className="font-semibold mt-1 text-[color:var(--fg)]">
              {lastReadBook.koName} {lastRead.chapter}장
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-[color:var(--accent)]" />
        </Link>
      )}

      <section className="grid grid-cols-2 gap-3">
        <ShortcutCard
          href="/read"
          Icon={BookIcon}
          title="성경 읽기"
          subtitle="창세기 ~ 요한계시록"
        />
        <ShortcutCard
          href="/plan"
          Icon={CalendarIcon}
          title="통독 계획"
          subtitle={planState ? "오늘의 분량" : "시작하기"}
          highlight={!!planState}
        />
        <ShortcutCard
          href="/search"
          Icon={SearchIcon}
          title="구절 검색"
          subtitle="키워드 · 책장절"
        />
        <ShortcutCard
          href="/saved"
          Icon={BookmarkIcon}
          title="보관함"
          subtitle={hydrated ? `즐겨찾기 ${favorites.length}개` : "즐겨찾기"}
        />
      </section>

      <p className="text-center text-[11px] text-[color:var(--muted)] mt-2 mb-1">
        개역한글판 · 공개 도메인
      </p>
    </div>
  );
}

function ShortcutCard({
  href,
  Icon,
  title,
  subtitle,
  highlight,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group rounded-2xl border p-4 transition active:scale-[0.98] ${
        highlight
          ? "bg-[color:var(--accent)] border-[color:var(--accent)] text-[color:var(--accent-fg)]"
          : "bg-[color:var(--bg-elev)] border-[color:var(--border)] hover:border-[color:var(--accent)]"
      }`}
    >
      <Icon
        className={`w-6 h-6 mb-3 ${
          highlight ? "text-[color:var(--accent-fg)]" : "text-[color:var(--accent)]"
        }`}
      />
      <p className="text-base font-semibold tracking-tight">{title}</p>
      <p
        className={`text-xs mt-0.5 ${
          highlight ? "text-[color:var(--accent-fg)]/80" : "text-[color:var(--muted)]"
        }`}
      >
        {subtitle}
      </p>
    </Link>
  );
}
