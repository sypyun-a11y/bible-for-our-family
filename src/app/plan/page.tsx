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
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon, FlameIcon } from "@/lib/icons";

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
    return <div className="text-[color:var(--muted)] pt-8 text-center">불러오는 중…</div>;
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
    <div className="space-y-6 fade-up">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">통독 시작</h1>
        <p className="text-sm text-[color:var(--muted)] mt-1">
          매일 분량을 읽고 진도를 체크하세요
        </p>
      </header>

      <div className="inline-flex gap-1 rounded-full bg-[color:var(--bg-elev)] p-1 border border-[color:var(--border)]">
        {([
          ["preset", "프리셋"],
          ["days", "기간으로"],
          ["cpd", "분량으로"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setMode(k)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition ${
              mode === k
                ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
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
                className="w-full text-left rounded-2xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-5 hover:border-[color:var(--accent)] active:scale-[0.99] transition"
              >
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-bold tracking-tight">{p.name}</p>
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
            <span className="text-sm font-medium text-[color:var(--fg-soft)]">
              며칠 안에 완독할까요?
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={30}
                max={1000}
                value={days}
                onChange={(e) => setDays(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1 rounded-xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] px-4 py-3 text-base focus:outline-none focus:border-[color:var(--accent)]"
                inputMode="numeric"
              />
              <span className="text-sm text-[color:var(--muted)]">일</span>
            </div>
          </label>
          {customPlan && <PlanPreview plan={customPlan} />}
          <button
            onClick={() => start(`custom:days:${days}`)}
            className="w-full rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] py-3.5 font-semibold active:scale-[0.98] transition"
          >
            {days}일 통독 시작
          </button>
        </div>
      )}

      {mode === "cpd" && (
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[color:var(--fg-soft)]">
              하루에 몇 장씩 읽을까요?
            </span>
            <div className="mt-2 flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={50}
                value={cpd}
                onChange={(e) => setCpd(Math.max(1, Number(e.target.value) || 1))}
                className="flex-1 rounded-xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] px-4 py-3 text-base focus:outline-none focus:border-[color:var(--accent)]"
                inputMode="numeric"
              />
              <span className="text-sm text-[color:var(--muted)]">장 / 하루</span>
            </div>
          </label>
          {customPlan && <PlanPreview plan={customPlan} />}
          <button
            onClick={() => start(`custom:cpd:${cpd}`)}
            className="w-full rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] py-3.5 font-semibold active:scale-[0.98] transition"
          >
            하루 {cpd}장으로 시작
          </button>
        </div>
      )}
    </div>
  );
}

function PlanPreview({ plan }: { plan: ReadingPlan }) {
  const avg = (
    plan.assignments.reduce((s, a) => s + a.units.length, 0) / plan.totalDays
  ).toFixed(1);
  return (
    <div className="rounded-2xl bg-[color:var(--accent-soft)] p-4">
      <p className="text-[11px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">
        예상 일정
      </p>
      <p className="font-semibold mt-1 text-[color:var(--fg)]">
        {plan.totalDays}일 · 하루 평균 {avg}장
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
  const isToday = viewDay === todayDay;

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
    <div className="space-y-5 fade-up">
      <header className="rounded-3xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-baseline justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--accent)] font-semibold">
              진행 중
            </p>
            <h1 className="text-xl font-bold tracking-tight mt-1">{plan.name}</h1>
          </div>
          <button onClick={reset} className="text-[11px] text-[color:var(--muted)] underline">
            초기화
          </button>
        </div>

        <div className="mt-5">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-medium text-[color:var(--fg-soft)]">
              {completedCount} / {plan.totalDays}일 <span className="text-[color:var(--muted)]">· {progress}%</span>
            </p>
            <p className="inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--accent)]">
              <FlameIcon className="w-4 h-4" />
              {streak}일 연속
            </p>
          </div>
          <div className="h-2 rounded-full bg-[color:var(--bg)] overflow-hidden">
            <div
              className="h-full bg-[color:var(--accent)] transition-all rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </header>

      <section className="rounded-3xl bg-[color:var(--bg-elev)] border border-[color:var(--border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setViewDay(Math.max(1, viewDay - 1))}
            disabled={viewDay <= 1}
            aria-label="이전 날"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[color:var(--fg-soft)] disabled:opacity-30 active:bg-[color:var(--bg)]"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-wider text-[color:var(--muted)] font-medium">
              {isToday ? "오늘" : viewDay < todayDay ? "지난날" : "예정"}
            </p>
            <p className="text-lg font-bold">Day {viewDay}</p>
          </div>
          <button
            onClick={() => setViewDay(Math.min(plan.totalDays, viewDay + 1))}
            disabled={viewDay >= plan.totalDays}
            aria-label="다음 날"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center text-[color:var(--fg-soft)] disabled:opacity-30 active:bg-[color:var(--bg)]"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2 mb-5">
          {assignment.units.map((u, i) => {
            const book = index.find((b) => b.id === u.book);
            if (!book) return null;
            return (
              <Link
                key={i}
                href={`/read?book=${u.book}&chapter=${u.chapter}`}
                className="flex items-center justify-between rounded-xl bg-[color:var(--bg)] border border-[color:var(--border)] px-4 py-3 hover:border-[color:var(--accent)] active:scale-[0.98] transition"
              >
                <span className="font-semibold">
                  {book.koName} {u.chapter}장
                </span>
                <ChevronRightIcon className="w-4 h-4 text-[color:var(--muted)]" />
              </Link>
            );
          })}
        </div>

        <button
          onClick={toggleDay}
          className={`w-full inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold transition active:scale-[0.98] ${
            state.completed[viewDay]
              ? "bg-[color:var(--accent-soft)] text-[color:var(--accent)]"
              : "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
          }`}
        >
          {state.completed[viewDay] ? (
            <>
              <CheckIcon className="w-5 h-5" />
              완료됨 (취소)
            </>
          ) : (
            "오늘 분량 완료"
          )}
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
  const end = Math.min(plan.totalDays, start + 13);
  const days = Array.from({ length: end - start + 1 }, (_, i) => start + i);

  return (
    <section>
      <h2 className="text-xs font-semibold tracking-widest uppercase text-[color:var(--muted)] mb-3 px-1">
        일정
      </h2>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => {
          const done = state.completed[d];
          const isToday = d === todayDay;
          return (
            <button
              key={d}
              onClick={() => setViewDay(d)}
              className={`aspect-square rounded-lg text-sm font-semibold transition active:scale-90 ${
                done
                  ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                  : isToday
                  ? "bg-[color:var(--bg-elev)] border-2 border-[color:var(--accent)] text-[color:var(--accent)]"
                  : "bg-[color:var(--bg-elev)] border border-[color:var(--border)] text-[color:var(--muted)]"
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
