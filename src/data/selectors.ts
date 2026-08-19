import { e1rm } from '@/lib/e1rm';
import { isoWeekKey } from './seed';
import type {
  AppState, ID, LoggedSet, MuscleGroup, PR, Readiness, Routine, Session,
} from './types';
import { MUSCLE_GROUPS } from './types';

const DAY = 86400000;

export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function isoDate(ts: number): string {
  const d = new Date(ts);
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Monday 00:00 of the week containing ts. */
export function startOfWeek(ts: number): number {
  const d = new Date(startOfDay(ts));
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  return d.getTime();
}

function finished(s: AppState): Session[] {
  return Object.values(s.sessions).filter((x) => x.endedAt !== null);
}

function doneSets(sets: LoggedSet[]): LoggedSet[] {
  return sets.filter((x) => x.done && x.kind !== 'warmup');
}

export function setVolume(sets: LoggedSet[]): number {
  return doneSets(sets).reduce((n, x) => n + x.weight * x.reps, 0);
}

export function sessionVolume(session: Session): number {
  return session.exercises.reduce((n, le) => n + setVolume(le.sets), 0);
}

export function sessionSetCount(session: Session): number {
  return session.exercises.reduce((n, le) => n + doneSets(le.sets).length, 0);
}

/** Most recent completed performance of an exercise, for the "previous" line in a session. */
export function lastPerformance(s: AppState, exerciseId: ID): { session: Session; sets: LoggedSet[] } | null {
  const candidates = finished(s)
    .filter((x) => x.id !== s.active?.id)
    .sort((a, b) => b.startedAt - a.startedAt);
  for (const session of candidates) {
    for (const le of session.exercises) {
      if (le.exerciseId !== exerciseId) continue;
      const sets = doneSets(le.sets);
      if (sets.length) return { session, sets };
    }
  }
  return null;
}

/** One point per session, oldest first. Top set is the heaviest estimated single. */
export function exerciseHistory(
  s: AppState, exerciseId: ID,
): { ts: number; topSet: LoggedSet; e1rm: number; volume: number }[] {
  const out: { ts: number; topSet: LoggedSet; e1rm: number; volume: number }[] = [];
  for (const session of finished(s)) {
    for (const le of session.exercises) {
      if (le.exerciseId !== exerciseId) continue;
      const sets = doneSets(le.sets);
      if (!sets.length) continue;
      let topSet = sets[0];
      let best = e1rm(topSet.weight, topSet.reps);
      for (const st of sets) {
        const v = e1rm(st.weight, st.reps);
        if (v > best) { best = v; topSet = st; }
      }
      out.push({ ts: session.startedAt, topSet, e1rm: best, volume: setVolume(sets) });
    }
  }
  return out.sort((a, b) => a.ts - b.ts);
}

function liveRoutine(s: AppState, id: ID | null | undefined): Routine | null {
  if (!id) return null;
  const r = s.routines[id];
  return r && !r.archived ? r : null;
}

export function todayRoutine(s: AppState): Routine | null {
  return liveRoutine(s, s.schedule.byDay[new Date().getDay()]);
}

/** The next scheduled training day within the coming week, today excluded. */
export function nextTrainingDay(s: AppState): { day: number; routine: Routine } | null {
  const today = new Date().getDay();
  for (let i = 1; i <= 7; i++) {
    const day = (today + i) % 7;
    const routine = liveRoutine(s, s.schedule.byDay[day]);
    if (routine) return { day, routine };
  }
  return null;
}

/** Completed sessions in a Monday-based week. weeksAgo 0 = this week. */
export function weekSessions(s: AppState, weeksAgo = 0): Session[] {
  const from = startOfWeek(Date.now()) - weeksAgo * 7 * DAY;
  const to = from + 7 * DAY;
  return finished(s)
    .filter((x) => x.startedAt >= from && x.startedAt < to)
    .sort((a, b) => a.startedAt - b.startedAt);
}

export function isDeloadWeek(s: AppState, ts = Date.now()): boolean {
  return s.schedule.deloadWeeks.includes(isoWeekKey(new Date(ts)));
}

/** Working volume in kg per muscle. Secondary movers are credited at half. */
export function volumeByMuscle(s: AppState, sinceTs: number): Record<MuscleGroup, number> {
  const out = {} as Record<MuscleGroup, number>;
  for (const m of MUSCLE_GROUPS) out[m] = 0;
  for (const session of finished(s)) {
    if (session.startedAt < sinceTs) continue;
    for (const le of session.exercises) {
      const ex = s.exercises[le.exerciseId];
      if (!ex) continue;
      const vol = setVolume(le.sets);
      if (!vol) continue;
      for (const m of ex.primary) out[m] += vol;
      for (const m of ex.secondary) out[m] += vol * 0.5;
    }
  }
  for (const m of MUSCLE_GROUPS) out[m] = Math.round(out[m]);
  return out;
}

/** Working sets per muscle — the number coaches actually programme against. */
export function setsByMuscle(s: AppState, sinceTs: number): Record<MuscleGroup, number> {
  const out = {} as Record<MuscleGroup, number>;
  for (const m of MUSCLE_GROUPS) out[m] = 0;
  for (const session of finished(s)) {
    if (session.startedAt < sinceTs) continue;
    for (const le of session.exercises) {
      const ex = s.exercises[le.exerciseId];
      if (!ex) continue;
      const n = doneSets(le.sets).length;
      for (const m of ex.primary) out[m] += n;
      for (const m of ex.secondary) out[m] += n * 0.5;
    }
  }
  return out;
}

export function recentPRs(s: AppState, n: number): PR[] {
  return [...s.prs].sort((a, b) => b.ts - a.ts).slice(0, n);
}

export function prsForExercise(s: AppState, exerciseId: ID): PR[] {
  return s.prs.filter((p) => p.exerciseId === exerciseId).sort((a, b) => b.ts - a.ts);
}

/**
 * Consecutive days kept. A scheduled rest day never breaks a streak, and today
 * does not break it either until the day is over.
 */
export function streak(s: AppState): number {
  const days = new Set(finished(s).map((x) => startOfDay(x.startedAt)));
  const today = startOfDay(Date.now());
  let count = 0;
  for (let i = 0; i < 400; i++) {
    const ts = today - i * DAY;
    const trained = days.has(ts);
    if (trained) { count++; continue; }
    const scheduled = s.schedule.byDay[new Date(ts).getDay()];
    if (!scheduled) continue;     // planned rest day
    if (i === 0) continue;        // today is not over yet
    break;
  }
  return count;
}

export function todayReadiness(s: AppState): Readiness | null {
  const today = isoDate(Date.now());
  return Object.values(s.readiness).find((r) => r.date === today) ?? null;
}

export function latestBody(s: AppState) {
  return Object.values(s.body).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null;
}

/** Sessions grouped by day for a consistency grid, oldest first. */
export function consistency(s: AppState, days: number): { ts: number; count: number }[] {
  const start = startOfDay(Date.now()) - (days - 1) * DAY;
  const counts = new Map<number, number>();
  for (const session of finished(s)) {
    const d = startOfDay(session.startedAt);
    if (d < start) continue;
    counts.set(d, (counts.get(d) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const ts = start + i * DAY;
    return { ts, count: counts.get(ts) ?? 0 };
  });
}
