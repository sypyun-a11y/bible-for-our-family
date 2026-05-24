import type { BookMeta } from "./bible";

export type ReadingUnit = {
  book: number;
  chapter: number;
};

export type DailyAssignment = {
  day: number;
  units: ReadingUnit[];
};

export type ReadingPlan = {
  id: string;
  name: string;
  description: string;
  totalDays: number;
  assignments: DailyAssignment[];
};

export type PresetKey = "year" | "halfYear" | "hundredDays" | "ninetyDays";

const PRESETS: Record<PresetKey, { name: string; description: string; days: number }> = {
  year: { name: "1년 통독", description: "매일 약 3장씩 1년 동안", days: 365 },
  halfYear: { name: "반년 통독", description: "매일 약 6장씩 6개월", days: 180 },
  hundredDays: { name: "100일 통독", description: "매일 약 12장씩 100일", days: 100 },
  ninetyDays: { name: "90일 통독", description: "매일 약 13장씩 90일", days: 90 },
};

function buildAllChapters(books: BookMeta[]): ReadingUnit[] {
  const units: ReadingUnit[] = [];
  for (const b of books) {
    for (let c = 1; c <= b.chapterCount; c++) {
      units.push({ book: b.id, chapter: c });
    }
  }
  return units;
}

function distribute(units: ReadingUnit[], days: number): DailyAssignment[] {
  const assignments: DailyAssignment[] = [];
  const total = units.length;
  let idx = 0;
  for (let d = 0; d < days; d++) {
    const target = Math.floor(((d + 1) * total) / days);
    const todays: ReadingUnit[] = [];
    while (idx < target) {
      todays.push(units[idx]);
      idx++;
    }
    assignments.push({ day: d + 1, units: todays });
  }
  return assignments;
}

export function buildPresetPlan(preset: PresetKey, books: BookMeta[]): ReadingPlan {
  const meta = PRESETS[preset];
  const units = buildAllChapters(books);
  return {
    id: `preset:${preset}`,
    name: meta.name,
    description: meta.description,
    totalDays: meta.days,
    assignments: distribute(units, meta.days),
  };
}

export function buildCustomByDays(days: number, books: BookMeta[]): ReadingPlan {
  const units = buildAllChapters(books);
  return {
    id: `custom:days:${days}`,
    name: `${days}일 통독`,
    description: `${days}일 안에 성경 전체`,
    totalDays: days,
    assignments: distribute(units, days),
  };
}

export function buildCustomByChaptersPerDay(
  chaptersPerDay: number,
  books: BookMeta[],
): ReadingPlan {
  const units = buildAllChapters(books);
  const days = Math.ceil(units.length / chaptersPerDay);
  return {
    id: `custom:cpd:${chaptersPerDay}`,
    name: `하루 ${chaptersPerDay}장`,
    description: `총 ${days}일 소요 예정`,
    totalDays: days,
    assignments: distribute(units, days),
  };
}

export const PRESET_LIST: Array<{ key: PresetKey; name: string; description: string; days: number }> = (
  Object.entries(PRESETS) as Array<[PresetKey, typeof PRESETS[PresetKey]]>
).map(([key, v]) => ({ key, ...v }));

export type PlanState = {
  planId: string;
  startedAt: string; // ISO date
  completed: Record<number, boolean>; // day -> done
};

export function computeStreak(state: PlanState | null, today = new Date()): number {
  if (!state) return 0;
  const start = new Date(state.startedAt);
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  let streak = 0;
  for (let d = daysSinceStart + 1; d >= 1; d--) {
    if (state.completed[d]) streak++;
    else if (d === daysSinceStart + 1) {
      // skip — today not yet done
      continue;
    } else break;
  }
  return streak;
}

export function dayNumberFor(state: PlanState, today = new Date()): number {
  const start = new Date(state.startedAt);
  const diff = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
  );
  return diff + 1;
}
