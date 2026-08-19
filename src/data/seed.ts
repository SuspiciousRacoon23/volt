import { detectPRs } from '@/lib/prs';
import { buildExercises } from './exercises';
import { buildHistory } from './history';
import { buildRoutines, buildSchedule } from './templates';
import type { AppState, BodyEntry, ID, PR, Readiness, Session, Settings } from './types';

export const STORAGE_KEY = 'volt.v1';

export const DEFAULT_SETTINGS: Settings = {
  unit: 'kg',
  themeMode: 'system',
  reducedMotion: false,
  haptics: true,
  defaultRestSec: 120,
  barKg: 20,
  availablePlatesKg: [25, 20, 15, 10, 5, 2.5, 1.25],
  weeklyGoal: 4,
  streaksEnabled: true,
  name: '',
};

export function emptyState(): AppState {
  return {
    exercises: {},
    routines: {},
    schedule: { byDay: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null }, deloadWeeks: [] },
    sessions: {},
    active: null,
    readiness: {},
    body: {},
    prs: [],
    settings: { ...DEFAULT_SETTINGS },
    hydrated: true,
  };
}

/** ISO-8601 week key, e.g. '2026-W34'. */
export function isoWeekKey(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${t.getUTCFullYear()}-W${`${week}`.padStart(2, '0')}`;
}

/**
 * First-launch state: a full exercise library, six routines, a weekly schedule and
 * roughly two months of logged training so charts, PRs and previous performance are real.
 */
export function seedState(): AppState {
  const exercises = buildExercises();
  const routines = buildRoutines();

  const deloadDate = new Date();
  deloadDate.setDate(deloadDate.getDate() - 14);
  const schedule = buildSchedule(isoWeekKey(deloadDate));

  const history = buildHistory(routines, exercises, schedule.byDay, DEFAULT_SETTINGS.unit);
  const ordered = [...history.sessions].sort((a, b) => a.startedAt - b.startedAt);

  const sessions: Record<ID, Session> = {};
  const prs: PR[] = [];
  const past: Session[] = [];
  for (const s of ordered) {
    prs.push(...detectPRs(s, past, exercises));
    past.push(s);
    sessions[s.id] = s;
    for (const le of s.exercises) {
      const ex = exercises[le.exerciseId];
      if (ex) ex.lastUsed = Math.max(ex.lastUsed ?? 0, s.startedAt);
    }
  }

  const readiness: Record<ID, Readiness> = {};
  for (const r of history.readiness) readiness[r.id] = r;
  const body: Record<ID, BodyEntry> = {};
  for (const b of history.body) body[b.id] = b;

  return {
    exercises,
    routines,
    schedule,
    sessions,
    active: null,
    readiness,
    body,
    prs,
    settings: { ...DEFAULT_SETTINGS },
    hydrated: true,
  };
}
