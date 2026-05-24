"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadBook, loadIndex, type BookMeta } from "@/lib/bible";

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
    if (!query) return null;
    if (index.length === 0) return null;
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
    <div className="space-y-5">
      <div className="space-y-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") runSearch();
          }}
          placeholder="키워드 또는 '요한복음 3:16'"
          className="w-full rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] px-4 py-3 text-base focus:outline-none focus:border-[color:var(--accent)]"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-1 rounded-full bg-[color:var(--card)] p-1 border border-[color:var(--border)]">
            {(["all", "OT", "NT"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setScope(s)}
                className={`px-3 py-1 text-xs rounded-full transition ${
                  scope === s
                    ? "bg-[color:var(--accent)] text-white"
                    : "text-[color:var(--muted)]"
                }`}
              >
                {s === "all" ? "전체" : s === "OT" ? "구약" : "신약"}
              </button>
            ))}
          </div>
          <button
            onClick={runSearch}
            disabled={searching || query.trim().length < 2}
            className="px-4 py-1.5 rounded-full bg-[color:var(--accent)] text-white text-sm font-medium disabled:opacity-40"
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
          className="block rounded-xl bg-[color:var(--card)] border border-[color:var(--accent)] p-4"
        >
          <p className="text-xs text-[color:var(--accent)] font-medium">바로 가기</p>
          <p className="font-semibold mt-1">
            {index.find((b) => b.id === refMatch.book)?.koName} {refMatch.chapter}장
            {refMatch.verse ? ` ${refMatch.verse}절` : ""}
          </p>
        </Link>
      )}

      {hits !== null && (
        <div className="space-y-3">
          <p className="text-xs text-[color:var(--muted)]">
            {hits.length === 0
              ? "결과 없음"
              : `결과 ${hits.length}개${hits.length >= 200 ? " (200개로 제한됨)" : ""}`}
          </p>
          {hits.map((h, i) => (
            <Link
              key={i}
              href={`/read?book=${h.book}&chapter=${h.chapter}#v${h.verse}`}
              className="block rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
            >
              <p className="text-xs text-[color:var(--accent)] font-medium mb-1">
                {h.bookName} {h.chapter}:{h.verse}
              </p>
              <p className="verse-text text-sm leading-relaxed">
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
            <mark className="bg-[color:var(--accent)]/20 text-[color:var(--foreground)] rounded px-0.5">
              {query}
            </mark>
          )}
        </span>
      ))}
    </>
  );
}
