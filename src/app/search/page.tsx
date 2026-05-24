"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadBook, loadIndex, type BookMeta } from "@/lib/bible";
import { ChevronRightIcon, SearchIcon } from "@/lib/icons";

type Hit = {
  book: number;
  bookName: string;
  chapter: number;
  verse: number;
  text: string;
};

const REF_REGEX = /^([가-힣0-9]+)\s*(\d+)(?::(\d+))?$/;

function parseRef(q: string, index: BookMeta[]): { book: number; chapter: number; verse?: number } | null {
  const m = q.trim().match(REF_REGEX);
  if (!m) return null;
  const name = m[1];
  const meta = index.find(
    (b) => b.koName === name || b.koAbbr === name,
  );
  if (!meta) return null;
  const chapter = Number(m[2]);
  if (chapter < 1 || chapter > meta.chapterCount) return null;
  const verse = m[3] ? Number(m[3]) : undefined;
  if (verse !== undefined) {
    if (verse < 1 || verse > meta.verseCounts[chapter - 1]) return null;
  }
  return { book: meta.id, chapter, verse };
}

export default function SearchPage() {
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [scope, setScope] = useState<"all" | "OT" | "NT">("all");

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const refMatch = useMemo(() => {
    if (!query || index.length === 0) return null;
    return parseRef(query, index);
  }, [query, index]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q || index.length === 0) return;
    if (q.length < 2) {
      setHits([]);
      return;
    }
    setSearching(true);
    const results: Hit[] = [];
    const targets = index.filter((b) =>
      scope === "all" ? true : b.testament === scope,
    );
    for (const meta of targets) {
      if (results.length >= 200) break;
      const book = await loadBook(meta.id);
      for (let c = 0; c < book.chapters.length; c++) {
        const verses = book.chapters[c];
        for (let v = 0; v < verses.length; v++) {
          if (verses[v].includes(q)) {
            results.push({
              book: meta.id,
              bookName: meta.koName,
              chapter: c + 1,
              verse: v + 1,
              text: verses[v],
            });
            if (results.length >= 200) break;
          }
        }
        if (results.length >= 200) break;
      }
    }
    setHits(results);
    setSearching(false);
  };

  return (
    <div className="space-y-5 fade-up">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">구절 검색</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">
          키워드나 &lsquo;요한복음 3:16&rsquo; 같은 참조
        </p>
      </header>

      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[color:var(--muted)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") runSearch();
            }}
            placeholder="사랑, 평강, 요한복음 3:16…"
            className="w-full rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] pl-12 pr-4 py-3.5 text-base focus:outline-none focus:border-[color:var(--accent)] transition"
            inputMode="search"
            autoComplete="off"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex gap-1 rounded-full bg-[color:var(--bg-elev)] p-1 border border-[color:var(--border)]">
            {([
              ["all", "전체"],
              ["OT", "구약"],
              ["NT", "신약"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setScope(k)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition ${
                  scope === k
                    ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                    : "text-[color:var(--muted)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={runSearch}
            disabled={searching || query.trim().length < 2}
            className="px-5 py-2 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-sm font-semibold disabled:opacity-40 active:scale-95 transition"
          >
            {searching ? "검색 중…" : "검색"}
          </button>
        </div>
      </div>

      {refMatch && (
        <Link
          href={`/read?book=${refMatch.book}&chapter=${refMatch.chapter}${
            refMatch.verse ? `#v${refMatch.verse}` : ""
          }`}
          className="block rounded-2xl bg-[color:var(--accent-soft)] p-4 flex items-center justify-between active:scale-[0.98] transition"
        >
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">
              바로 가기
            </p>
            <p className="font-semibold mt-1">
              {index.find((b) => b.id === refMatch.book)?.koName} {refMatch.chapter}장
              {refMatch.verse ? ` ${refMatch.verse}절` : ""}
            </p>
          </div>
          <ChevronRightIcon className="w-5 h-5 text-[color:var(--accent)]" />
        </Link>
      )}

      {hits !== null && (
        <div className="space-y-3">
          <p className="text-xs text-[color:var(--muted)] px-1">
            {hits.length === 0
              ? "결과가 없습니다"
              : `${hits.length}개 결과${hits.length >= 200 ? " · 최대 200개" : ""}`}
          </p>
          {hits.map((h, i) => (
            <Link
              key={i}
              href={`/read?book=${h.book}&chapter=${h.chapter}#v${h.verse}`}
              className="block rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-4 active:scale-[0.99] transition"
            >
              <p className="text-[11px] text-[color:var(--accent)] font-semibold mb-1.5 tracking-wider">
                {h.bookName} {h.chapter}:{h.verse}
              </p>
              <p className="verse-text text-[15px] leading-relaxed">
                <Highlight text={h.text} query={query.trim()} />
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(query);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && (
            <mark className="bg-[color:var(--highlight)] text-[color:var(--fg)] rounded px-0.5">
              {query}
            </mark>
          )}
        </span>
      ))}
    </>
  );
}
