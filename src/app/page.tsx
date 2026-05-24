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
import { Decoration, MountainSunIllustration } from "./_components/Illustration";

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
const EN_MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

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
  const [favPop, setFavPop] = useState(0);

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
    setFavPop((n) => n + 1);
  };

  const today = new Date();
  const enDate = `${EN_MONTHS[today.getMonth()]} ${today.getDate()} · ${today.getFullYear()}`;
  const koDate = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 ${KO_WEEKDAYS[today.getDay()]}요일`;
  const lastReadBook = lastRead ? index.find((b) => b.id === lastRead.book) : null;

  return (
    <div className="bg-aurora -mx-5 -mt-6 px-5 pt-6 pb-2 min-h-[calc(100vh-7rem)]">
      <div className="flex flex-col gap-5">
        <header className="pt-1 fade-up">
          <span className="eyebrow">{enDate}</span>
          <p className="text-xs font-medium text-[color:var(--muted)] mt-2">{koDate}</p>
          <h1 className="text-[26px] font-bold tracking-tight mt-1">오늘의 말씀</h1>
        </header>

        <section className="glow-card p-7 fade-up-1">
          <div className="flex items-center justify-end mb-2">
            <div className="inline-flex gap-1 rounded-full bg-[color:var(--bg)]/60 backdrop-blur p-1 border border-[color:var(--border)]">
              <button
                onClick={() => setMode("daily")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition press ${
                  mode === "daily"
                    ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                    : "text-[color:var(--muted)]"
                }`}
              >
                매일
              </button>
              <button
                onClick={() => setMode("random")}
                className={`px-3 py-1 text-xs font-medium rounded-full transition press ${
                  mode === "random"
                    ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                    : "text-[color:var(--muted)]"
                }`}
              >
                랜덤
              </button>
            </div>
          </div>

          <MountainSunIllustration className="w-full max-w-[220px] h-auto mx-auto -mt-2 mb-1" />

          {verse ? (
            <div className="space-y-5 fade-in">
              <div className="text-center">
                <span className="font-serif text-[color:var(--accent)] text-5xl leading-none opacity-40 select-none">
                  &ldquo;
                </span>
              </div>
              <blockquote className="verse-text font-serif text-[22px] sm:text-[23px] leading-[1.9] text-center text-gradient px-1 font-medium">
                {verse.text}
              </blockquote>
              <div className="text-center">
                <span className="font-serif text-[color:var(--accent)] text-5xl leading-none opacity-40 select-none">
                  &rdquo;
                </span>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[color:var(--border)]">
                <Link
                  href={`/read?book=${verse.ref.book}&chapter=${verse.ref.chapter}#v${verse.ref.verse}`}
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--accent)] press"
                >
                  {verse.meta.koName} {verse.ref.chapter}:{verse.ref.verse}
                  <ChevronRightIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={toggleFav}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border border-[color:var(--border)] press"
                  aria-pressed={isFav}
                >
                  <span key={favPop} className={favPop > 0 ? "star-pop inline-flex" : "inline-flex"}>
                    {isFav ? (
                      <StarFilledIcon className="w-4 h-4 text-[color:var(--accent)]" />
                    ) : (
                      <StarIcon className="w-4 h-4" />
                    )}
                  </span>
                  {isFav ? "저장됨" : "저장"}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="h-7 mx-auto w-3/4 rounded animate-pulse bg-[color:var(--bg)]" />
              <div className="h-7 w-2/3 mx-auto rounded animate-pulse bg-[color:var(--bg)]" />
              <div className="h-7 w-1/2 mx-auto rounded animate-pulse bg-[color:var(--bg)]" />
            </div>
          )}
        </section>

        <Decoration className="fade-up-2" />

        {lastReadBook && lastRead && (
          <Link
            href={`/read?book=${lastRead.book}&chapter=${lastRead.chapter}`}
            className="block rounded-2xl bg-[color:var(--accent-soft)] p-4 flex items-center justify-between press fade-up-2"
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

        <section className="grid grid-cols-2 gap-3 fade-up-3">
          <ShortcutCard
            href="/read"
            Icon={BookIcon}
            title="성경 읽기"
            subtitle="창세기 ~ 요한계시록"
            gradient="from-[#5b7553] to-[#7a936f]"
          />
          <ShortcutCard
            href="/plan"
            Icon={CalendarIcon}
            title="통독 계획"
            subtitle={planState ? "오늘의 분량" : "시작하기"}
            gradient="from-[#c89968] to-[#d8b685]"
          />
          <ShortcutCard
            href="/search"
            Icon={SearchIcon}
            title="구절 검색"
            subtitle="키워드 · 책장절"
            gradient="from-[#6b87a8] to-[#8aa6c7]"
          />
          <ShortcutCard
            href="/saved"
            Icon={BookmarkIcon}
            title="보관함"
            subtitle={hydrated ? `즐겨찾기 ${favorites.length}개` : "즐겨찾기"}
            gradient="from-[#a47597] to-[#c191b1]"
          />
        </section>

        <p className="text-center text-[11px] text-[color:var(--muted)] mt-2 mb-1 fade-up-4">
          개역한글판 · 공개 도메인
        </p>
      </div>
    </div>
  );
}

function ShortcutCard({
  href,
  Icon,
  title,
  subtitle,
  gradient,
}: {
  href: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  subtitle: string;
  gradient: string;
}) {
  return (
    <Link
      href={href}
      className={`group relative rounded-2xl bg-gradient-to-br ${gradient} p-4 text-white press shadow-[var(--shadow-card)] overflow-hidden`}
    >
      <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition" />
      <Icon className="w-6 h-6 mb-3 opacity-95" />
      <p className="text-[15px] font-bold tracking-tight">{title}</p>
      <p className="text-[11px] mt-0.5 opacity-85">{subtitle}</p>
    </Link>
  );
}
