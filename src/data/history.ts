import type {
  BodyEntry, Exercise, ID, LoggedExercise, LoggedSet, Readiness, Routine, Session, Unit,
} from './types';
import { TRAINING_DAYS } from './templates';

const WEEKS = 8;                 // index 0 = oldest, WEEKS-1 = current (partial) week
const DELOAD_WEEK = 5;
const PLATEAU_ID: ID = 'bench-press';
const PLATEAU_STOPS_AT = 3;
const STAIR: ID[] = ['deadlift', 'back-squat', 'front-squat', 'overhead-press', 'incline-bench-press', 'barbell-row'];
/** Main lifts progress most weeks. Everything else moves roughly every other week. */
const PRIMARY: ID[] = [
  'bench-press', 'incline-bench-press', 'overhead-press', 'deadlift', 'barbell-row', 'back-squat',
  'front-squat', 'romanian-deadlift', 'hip-thrust', 'leg-press', 'pull-up', 'dip', 'chin-up',
];
/** [starting working weight in kg, kg added per progressed week] */
const BASE: Record<ID, [number, number]> = {
  'bench-press': [72.5, 2.5], 'incline-bench-press': [55, 2.5], 'incline-dumbbell-press': [26, 1],
  'dumbbell-bench-press': [30, 1], 'dip': [0, 1.5], 'push-up': [0, 0], 'machine-chest-press': [60, 2.5],
  'cable-fly': [15, 1], 'pec-deck': [45, 2.5], 'dumbbell-fly': [14, 0.5],
  'overhead-press': [45, 1.25], 'dumbbell-shoulder-press': [24, 1], 'machine-shoulder-press': [45, 2.5],
  'arnold-press': [20, 1], 'lateral-raise': [10, 0.5], 'cable-lateral-raise': [9, 0.5], 'landmine-press': [25, 1],
  'close-grip-bench-press': [60, 2], 'skull-crusher': [30, 1], 'triceps-pushdown': [32.5, 1.5],
  'overhead-cable-extension': [25, 1], 'dumbbell-overhead-extension': [22, 1],
  'deadlift': [120, 5], 'rack-pull': [140, 5], 'barbell-row': [70, 2.5], 't-bar-row': [60, 2.5],
  'single-arm-dumbbell-row': [32, 1], 'chest-supported-row': [55, 2.5], 'seated-cable-row': [65, 2.5],
  'lat-pulldown': [65, 2.5], 'pull-up': [0, 1.5], 'chin-up': [0, 1.5], 'straight-arm-pulldown': [30, 1.5],
  'face-pull': [25, 1], 'rear-delt-fly': [10, 0.5], 'barbell-shrug': [90, 2.5], 'dumbbell-shrug': [34, 1],
  'barbell-curl': [30, 1], 'incline-dumbbell-curl': [12, 0.5], 'hammer-curl': [14, 0.5],
  'cable-curl': [27.5, 1.5], 'preacher-curl': [25, 1], 'reverse-curl': [20, 1],
  'back-squat': [100, 5], 'front-squat': [75, 2.5], 'goblet-squat': [32, 1], 'hack-squat': [80, 5],
  'leg-press': [140, 7.5], 'bulgarian-split-squat': [20, 1], 'walking-lunge': [18, 1], 'step-up': [18, 1],
  'leg-extension': [50, 2.5], 'romanian-deadlift': [80, 2.5], 'dumbbell-rdl': [30, 1],
  'lying-leg-curl': [45, 2.5], 'seated-leg-curl': [45, 2.5], 'nordic-curl': [0, 0],
  'hip-thrust': [90, 5], 'cable-pull-through': [40, 2.5], 'kettlebell-swing': [24, 2], 'good-morning': [50, 2.5],
  'back-extension': [0, 1.5], 'standing-calf-raise': [70, 2.5], 'seated-calf-raise': [50, 2.5],
  'hip-adduction': [45, 2.5], 'hip-abduction': [50, 2.5],
  'hanging-leg-raise': [0, 0], 'cable-crunch': [35, 1.5], 'plank': [0, 0], 'ab-wheel-rollout': [0, 0],
  'pallof-press': [20, 1], 'dead-bug': [0, 0], 'farmers-carry': [32, 2],
};

/** Deterministic pseudo-random in [0,1) — the seed must produce identical data every launch. */
function rnd(...parts: (string | number)[]): number {
  let h = 2166136261;
  const s = parts.join('|');
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

function roundFor(kg: number, eq: Exercise['equipment']): number {
  if (kg <= 0) return 0;
  const inc = eq === 'dumbbell' || eq === 'kettlebell' ? 1 : 2.5;
  return Math.round(kg / inc) * inc;
}

function workingWeight(ex: Exercise, week: number): number {
  const [start, step] = BASE[ex.id] ?? [20, 1];
  if (step === 0) return 0;
  let eff = week;
  if (ex.id === PLATEAU_ID) eff = Math.min(week, PLATEAU_STOPS_AT);
  else if (STAIR.includes(ex.id)) eff = week - Math.floor(week / 3);
  else if (!PRIMARY.includes(ex.id)) eff = Math.floor(week / 2);
  let kg = start + step * eff;
  if (week === DELOAD_WEEK) kg = start + step * Math.max(0, eff - 2) * 0.85;
  return roundFor(kg, ex.equipment);
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function currentMonday(now: Date): Date {
  const d = startOfDay(now);
  const dow = d.getDay();
  const back = dow === 0 ? 6 : dow - 1;
  d.setDate(d.getDate() - back);
  return d;
}

/** Sessions the user did not do. [weekIndex, weekday] */
const MISSED: [number, number][] = [[1, 5], [3, 2], [5, 5], [6, 4]];

export type History = { sessions: Session[]; readiness: Readiness[]; body: BodyEntry[] };

export function buildHistory(
  routines: Record<ID, Routine>,
  exercises: Record<ID, Exercise>,
  byDay: Record<number, ID | null>,
  unit: Unit,
): History {
  const now = new Date();
  const monday = currentMonday(now);
  const todayStart = startOfDay(now).getTime();
  const sessions: Session[] = [];

  for (let w = 0; w < WEEKS; w++) {
    const weekStart = new Date(monday);
    weekStart.setDate(weekStart.getDate() - (WEEKS - 1 - w) * 7);
    for (const day of TRAINING_DAYS) {
      const routineId = byDay[day];
      if (!routineId) continue;
      const routine = routines[routineId];
      if (!routine) continue;
      if (MISSED.some(([mw, md]) => mw === w && md === day)) continue;

      const date = new Date(weekStart);
      date.setDate(date.getDate() + (day - 1));
      if (date.getTime() >= todayStart) continue;

      sessions.push(buildSession(routine, exercises, date, w, unit));
    }
  }

  return { sessions, readiness: buildReadiness(sessions, monday), body: buildBody(monday) };
}

function buildSession(
  routine: Routine, exercises: Record<ID, Exercise>, date: Date, week: number, unit: Unit,
): Session {
  const deload = week === DELOAD_WEEK;
  const hour = 18 + (rnd(routine.id, week, 'h') > 0.7 ? 1 : 0);
  const minute = Math.floor(rnd(routine.id, week, 'm') * 40);
  const startedAt = new Date(date).setHours(hour, minute, 0, 0);
  const id = `s-${week}-${date.getDay()}-${routine.id}`;

  let cursor = startedAt + 4 * 60_000; // a few minutes to get changed and set up
  const logged: LoggedExercise[] = [];

  for (const pe of routine.exercises) {
    const ex = exercises[pe.exerciseId];
    if (!ex) continue;
    const work = workingWeight(ex, week);
    const workingSets = pe.sets.filter((s) => s.kind === 'working');
    const warmSets = deload ? pe.sets.filter((s) => s.kind === 'warmup').slice(0, 1) : pe.sets.filter((s) => s.kind === 'warmup');
    const keep = deload ? Math.max(2, workingSets.length - 1) : workingSets.length;
    const sets: LoggedSet[] = [];

    warmSets.forEach((ps, i) => {
      const pct = warmSets.length === 1 ? 0.6 : 0.4 + (0.45 * i) / Math.max(1, warmSets.length - 1);
      cursor += (60 + Math.floor(rnd(id, ex.id, 'w', i) * 40)) * 1000;
      sets.push({
        id: `${id}-${pe.id}-w${i + 1}`, kind: 'warmup',
        reps: ps.reps, weight: work > 0 ? roundFor(work * pct, ex.equipment) : 0,
        rpe: null, done: true, ts: cursor,
      });
    });

    for (let i = 0; i < keep; i++) {
      const target = workingSets[i]?.reps ?? workingSets[0]?.reps ?? 8;
      const r = rnd(id, ex.id, 's', i);
      let reps = target;
      let rpe: number | null;
      if (deload) {
        rpe = 6;
      } else {
        rpe = i === 0 ? 7 : i >= keep - 1 ? 9 : 8;
        if (i >= keep - 1 && r > 0.55) reps = Math.max(1, target - 1);
        else if (r < 0.08) reps = target + 1;
      }
      cursor += (pe.restSec + 30 + Math.floor(rnd(id, ex.id, 'r', i) * 45)) * 1000;
      sets.push({
        id: `${id}-${pe.id}-s${i + 1}`, kind: 'working',
        reps, weight: work, rpe, done: true, ts: cursor,
      });
    }

    logged.push({
      id: `${id}-${pe.id}`, exerciseId: pe.exerciseId, sets, restSec: pe.restSec,
      ...(pe.groupId ? { groupId: pe.groupId } : null),
      ...(deload && pe === routine.exercises[0] ? { notes: 'Deload week. Kept the bar speed fast and stopped early.' } : null),
    });
  }

  const endedAt = cursor + 5 * 60_000;
  return {
    id, routineId: routine.id, name: deload ? `${routine.name} (deload)` : routine.name,
    startedAt, endedAt, exercises: logged, unit,
    ...(week >= WEEKS - 3 ? { readinessId: `rd-${isoDate(new Date(startedAt))}` } : null),
  };
}

function isoDate(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/** Readiness for the last three weeks only: fatigue building, then the deload, then recovery. */
function buildReadiness(sessions: Session[], monday: Date): Readiness[] {
  const cutoff = new Date(monday);
  cutoff.setDate(cutoff.getDate() - 14);
  const out: Readiness[] = [];
  for (const s of sessions) {
    if (s.startedAt < cutoff.getTime()) continue;
    const date = isoDate(new Date(s.startedAt));
    const deload = s.name.includes('deload');
    const week = s.startedAt >= monday.getTime() ? 2 : deload ? 0 : 1;
    const base = [
      { energy: 2, sleep: 2, motivation: 3, stress: 4, soreness: 4, joints: 3, note: 'Third heavy week in a row. Backing the load off.' },
      { energy: 4, sleep: 4, motivation: 4, stress: 2, soreness: 2, joints: 2, note: 'Felt fresh after the lighter week.' },
      { energy: 4, sleep: 4, motivation: 5, stress: 2, soreness: 2, joints: 1 },
    ][week];
    out.push({
      id: `rd-${date}`, date,
      energy: base.energy, sleep: base.sleep, motivation: base.motivation,
      stress: base.stress, soreness: base.soreness, joints: base.joints,
      soreAreas: week === 0 ? ['quads', 'glutes', 'chest'] : week === 1 ? ['hamstrings'] : [],
      ...(base.note ? { note: base.note } : null),
    });
  }
  // one entry per date
  const seen = new Set<string>();
  return out.filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
}

/** Weekly Sunday bodyweight, a slow lean gain. */
function buildBody(monday: Date): BodyEntry[] {
  const out: BodyEntry[] = [];
  const weights = [78.2, 78.4, 78.3, 78.9, 79.1, 79.0, 79.4, 79.7];
  const fat = [16.8, 16.7, 16.6, 16.4, 16.3, 16.3, 16.1, 15.9];
  for (let i = 0; i < weights.length; i++) {
    const d = new Date(monday);
    d.setDate(d.getDate() - (weights.length - 1 - i) * 7 - 1);
    const date = isoDate(d);
    const entry: BodyEntry = { id: `bd-${date}`, date, weightKg: weights[i], bodyFat: fat[i] };
    if (i % 2 === 0) {
      entry.measurements = {
        chest: 103 + i * 0.3, waist: 84 - i * 0.2, hips: 98, thigh: 60 + i * 0.2,
        arm: 37.5 + i * 0.15, calf: 38.5, shoulders: 122 + i * 0.25, neck: 39,
      };
    }
    out.push(entry);
  }
  return out;
}
