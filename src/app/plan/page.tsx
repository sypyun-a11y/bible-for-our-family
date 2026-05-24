"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadIndex, type BookMeta } from "@/lib/bible";
import { useHydrated, useLocalStorage } from "@/lib/storage";
import {
  PRESET_LIST,
  buildCustomByChaptersPerDay,
  buildCustomByDays,
  buildPresetPlan,
  computeStreak,
  dayNumberFor,
  type PlanState,
  type ReadingPlan,
} from "@/lib/plans";

export default function PlanPage() {
  const hydrated = useHydrated();
  const [index, setIndex] = useState<BookMeta[]>([]);
  const [activePlan, setActivePlan] = useLocalStorage<PlanState | null>(
    "activePlan",
    null,
  );

  useEffect(() => {
    loadIndex().then(setIndex);
  }, []);

  const plan: ReadingPlan | null = useMemo(() => {
    if (!activePlan || index.length === 0) return null;
    const [kind, key, val] = activePlan.planId.split(":");
    if (kind === "preset") {
      return buildPresetPlan(key as (typeof PRESET_LIST)[number]["key"], index);
    }
    if (kind === "custom") {
      const n = Number(val);
      if (key === "days") return buildCustomByDays(n, index);
      if (key === "cpd") return buildCustomByChaptersPerDay(n, index);
    }
    return null;
  }, [activePlan, index]);

  if (!hydrated || index.length === 0) {
    return <div className="text-[color:var(--muted)]">불러오는 중…</div>;
  }

  if (!activePlan || !plan) {
    return <PlanSetup index={index} onStart={setActivePlan} />;
  }

  return <PlanRunner plan={plan} state={activePlan} setState={setActivePlan} index={index} />;
}

function PlanSetup({
  index,
  onStart,
}: {
  index: BookMeta[];
  onStart: (s: PlanState) => void;
}) {
  const [mode, setMode] = useState<"preset" | "days" | "cpd">("preset");
  const [days, setDays] = useState(180);
  const [cpd, setCpd] = useState(4);

  const start = (planId: string) => {
    const today = new Date();
    onStart({
      planId,
      startedAt: today.toISOString().slice(0, 10),
      completed: {},
    });
  };

  const customPlan = useMemo(() => {
    if (mode === "days") return buildCustomByDays(days, index);
    if (mode === "cpd") return buildCustomByChaptersPerDay(cpd, index);
    return null;
  }, [mode, days, cpd, index]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">통독 시작</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">
          매일 정해진 분량을 읽고 진도를 체크해보세요.
        </p>
      </header>

      <div className="flex gap-1 rounded-full bg-[color:var(--card)] p-1 border border-[color:var(--border)] w-fit">
        {([
          ["preset", "프리셋"],
          ["days", "기간으로"],
          ["cpd", "분량으로"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={`px-3 py-1 text-xs rounded-full transition ${
              mode === k
                ? "bg-[color:var(--accent)] text-white"
                : "text-[color:var(--muted)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "preset" && (
        <div className="space-y-3">
          {PRESET_LIST.map((p) => {
            const plan = buildPresetPlan(p.key, index);
            const avg = (plan.assignments.reduce((s, a) => s + a.units.length, 0) / plan.totalDays).toFixed(1);
            return (
              <button
                key={p.key}
                onClick={() => start(`preset:${p.key}`)}
                className="w-full text-left rounded-xl bg-[color:var(--card)] border border-[color:var(--border)] p-4 hover:border-[color:var(--accent)] transition"
              >
                <div className="flex items-baseline justify-between">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-[color:var(--muted)]">하루 평균 {avg}장</p>
                </div>
                <p className="text-sm text-[color:var(--muted)] mt-1">{p.description}</p>
              </button>
            );
          })}
        </div>
      )}

      {mode === "days" && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">며칠 안에 완독할까요?</span>
            <input
              type="number"
              min={30}
              max={1000}
              value={days}
              onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-full rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] px-3 py-2"
            />
          </label>
          {customPlan && <PlanPreview plan={customPlan} />}
          <button
            onClick={() => start(`custom:days:${days}`)}
            className="w-full rounded-full bg-[color:var(--accent)] text-white py-3 font-medium"
          >
            {days}일 통독 시작하기
          </button>
        </div>
      )}

      {mode === "cpd" && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-[color:var(--muted)]">하루에 몇 장씩 읽을까요?</span>
            <input
              type="number"
              min={1}
              max={50}
              value={cpd}
              onChange={(e) => setCpd(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-full rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] px-3 py-2"
            />
          </label>
          {customPlan && <PlanPreview plan={customPlan} />}
          <button
            onClick={() => start(`custom:cpd:${cpd}`)}
            className="w-full rounded-full bg-[color:var(--accent)] text-white py-3 font-medium"
          >
            하루 {cpd}장 시작하기
          </button>
        </div>
      )}
    </div>
  );
}

function PlanPreview({ plan }: { plan: ReadingPlan }) {
  return (
    <div className="rounded-lg bg-[color:var(--card)] border border-[color:var(--border)] p-3 text-sm">
      <p className="text-[color:var(--muted)]">예상 일정</p>
      <p className="font-medium mt-1">
        {plan.totalDays}일 · 하루 평균{" "}
        {(plan.assignments.reduce((s, a) => s + a.units.length, 0) / plan.totalDays).toFixed(1)}장
      </p>
    </div>
  );
}

function PlanRunner({
  plan,
  state,
  setState,
  index,
}: {
  plan: ReadingPlan;
  state: PlanState;
  setState: (next: PlanState | null) => void;
  index: BookMeta[];
}) {
  const today = new Date();
  const todayDay = Math.min(Math.max(dayNumberFor(state, today), 1), plan.totalDays);
  const [viewDay, setViewDay] = useState(todayDay);
  const assignment = plan.assignments[viewDay - 1];
  const completedCount = Object.values(state.completed).filter(Boolean).length;
  const streak = computeStreak(state, today);
  const progress = Math.round((completedCount / plan.totalDays) * 100);

  const toggleDay = () => {
    setState({
      ...state,
      completed: { ...state.completed, [viewDay]: !state.completed[viewDay] },
    });
  };

  const reset = () => {
    if (confirm("통독 계획을 초기화할까요? 진도는 사라집니다.")) {
      setState(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-[color:var(--card)] border border-[color:var(--border)] p-5">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-xs text-[color:var(--muted)]">진행 중</p>
            <h1 className="text-xl font-bold tracking-tight mt-0.5">{plan.name}</h1>
          </div>
          <button onClick={reset} className="text-xs text-[color:var(--muted)] underline">
            초기화
          </button>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-[color:var(--muted)] mb-1">
            <span>
              {completedCount} / {plan.totalDays}일 · {progress}%
            </span>
            <span>🔥 {streak}일 연속</span>
          </div>
          <div className="h-2 rounded-full bg-[color:var(--background)] overflow-hidden">
            <div
              className="h-full bg-[color:var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <section className="rounded-2xl bg-[color:var(--card)] border border-[color:var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewDay(Math.max(1, viewDay - 1))}
            disabled={viewDay <= 1}
            className="text-sm text-[color:var(--muted)] disabled:opacity-30"
          >
            ← 이전
          </button>
          <div className="text-center">
            <p className="text-xs text-[color:var(--muted)]">
              {viewDay === todayDay ? "오늘" : viewDay < todayDay ? "지난날" : "예정"}
            </p>
            <p className="font-semibold">Day {viewDay}</p>
          </div>
          <button
            onClick={() => setViewDay(Math.min(plan.totalDays, viewDay + 1))}
            disabled={viewDay >= plan.totalDays}
            className="text-sm text-[color:var(--muted)] disabled:opacity-30"
          >
            다음 →
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {assignment.units.map((u, i) => {
            const book = index.find((b) => b.id === u.book);
            if (!book) return null;
            return (
              <Link
                key={i}
                href={`/read?book=${u.book}&chapter=${u.chapter}`}
                className="flex items-center justify-between rounded-lg bg-[color:var(--background)] border border-[color:var(--border)] px-3 py-2 hover:border-[color:var(--accent)] transition"
              >
                <span className="font-medium">
                  {book.koName} {u.chapter}장
                </span>
                <span className="text-xs text-[color:var(--muted)]">읽기 →</span>
              </Link>
            );
          })}
        </div>

        <button
          onClick={toggleDay}
          className={`w-full rounded-full py-3 font-medium transition ${
            state.completed[viewDay]
              ? "bg-[color:var(--background)] border border-[color:var(--accent)] text-[color:var(--accent)]"
              : "bg-[color:var(--accent)] text-white"
          }`}
        >
          {state.completed[viewDay] ? "✓ 완료 (취소)" : "오늘 분량 완료"}
        </button>
      </section>

      <UpcomingList plan={plan} state={state} todayDay={todayDay} setViewDay={setViewDay} />
    </div>
  );
}

function UpcomingList({
  plan,
  state,
  todayDay,
  setViewDay,
}: {
  plan: ReadingPlan;
  state: PlanState;
  todayDay: number;
  setViewDay: (n: number) => void;
}) {
  const start = Math.max(1, todayDay - 2);
  const end = Math.min(plan.totalDays, start + 9);
  const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <section>
      <h2 className="text-sm font-semibold text-[color:var(--muted)] mb-3">일정</h2>
      <div className="grid grid-cols-5 gap-2">
        {days.map((d) => {
          const done = state.completed[d];
          const isToday = d === todayDay;
          return (
            <button
              key={d}
              onClick={() => setViewDay(d)}
              className={`aspect-square rounded-lg border text-sm font-medium transition ${
                done
                  ? "bg-[color:var(--accent)] text-white border-[color:var(--accent)]"
                  : isToday
                  ? "bg-[color:var(--card)] border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "bg-[color:var(--card)] border-[color:var(--border)] text-[color:var(--muted)]"
              }`}
            >
              {d}
            </button>
          );
        })}
      </div>
    </section>
  );
}
