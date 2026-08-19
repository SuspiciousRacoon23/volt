import type { AppState, ID, LoggedSet, Session } from '@/data/types';
import { e1rm } from '@/lib';

export type ExerciseStat = {
  /** One estimated-max point per session, oldest first. */
  points: number[];
  /** Heaviest single working set ever logged. */
  bestWeight: number;
  bestReps: number;
  /** Best estimated max ever logged. */
  bestE1rm: number;
  sessions: number;
  lastTs: number;
};

export type ExerciseStats = Record<ID, ExerciseStat>;

function working(sets: readonly LoggedSet[]): LoggedSet[] {
  return sets.filter((s) => s.done && s.kind !== 'warmup' && s.weight > 0);
}

function finishedSessions(state: AppState): Session[] {
  return Object.values(state.sessions)
    .filter((s) => s.endedAt !== null)
    .sort((a, b) => a.startedAt - b.startedAt);
}

/**
 * One pass over every completed session, producing the tiny per-exercise
 * summary the library list needs. Built once per store change, never per row.
 */
export function buildExerciseStats(state: AppState): ExerciseStats {
  const out: ExerciseStats = {};
  for (const session of finishedSessions(state)) {
    for (const le of session.exercises) {
      const sets = working(le.sets);
      if (!sets.length) continue;

      let best = 0;
      let heaviest = sets[0];
      for (const s of sets) {
        const v = e1rm(s.weight, s.reps);
        if (v > best) best = v;
        if (s.weight > heaviest.weight) heaviest = s;
      }

      const stat =
        out[le.exerciseId] ??
        (out[le.exerciseId] = {
          points: [],
          bestWeight: 0,
          bestReps: 0,
          bestE1rm: 0,
          sessions: 0,
          lastTs: 0,
        });

      stat.points.push(best);
      stat.sessions += 1;
      stat.lastTs = Math.max(stat.lastTs, session.startedAt);
      stat.bestE1rm = Math.max(stat.bestE1rm, best);
      if (heaviest.weight > stat.bestWeight) {
        stat.bestWeight = heaviest.weight;
        stat.bestReps = heaviest.reps;
      }
    }
  }
  // keep sparklines short — a long tail compresses the recent shape away
  for (const id of Object.keys(out)) {
    const p = out[id].points;
    if (p.length > 12) out[id].points = p.slice(p.length - 12);
  }
  return out;
}

export type Performance = { session: Session; sets: LoggedSet[] };

/** The user's last few completed performances of one exercise, newest first. */
export function recentPerformances(state: AppState, exerciseId: ID, n: number): Performance[] {
  const out: Performance[] = [];
  const sessions = finishedSessions(state).reverse();
  for (const session of sessions) {
    for (const le of session.exercises) {
      if (le.exerciseId !== exerciseId) continue;
      const sets = working(le.sets);
      if (sets.length) out.push({ session, sets });
    }
    if (out.length >= n) break;
  }
  return out.slice(0, n);
}
