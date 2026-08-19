import type { AppState, Session } from '@/data/types';
import { DAY_MS, sessionDurationMs, sessionVolume, startOfDay } from '@/lib';

export type Lifetime = {
  workouts: number;
  volumeKg: number;
  durationMs: number;
  longestStreak: number;
  firstTs: number | null;
};

export function finishedSessions(s: AppState): Session[] {
  return Object.values(s.sessions)
    .filter((x) => x.endedAt !== null)
    .sort((a, b) => a.startedAt - b.startedAt);
}

/**
 * The longest run of consecutive days kept. A day counts when it was trained,
 * or when the schedule says it was a rest day — resting on purpose is not a
 * broken streak.
 */
function longestStreak(s: AppState, sessions: Session[]): number {
  if (sessions.length === 0) return 0;
  const days = new Set(sessions.map((x) => startOfDay(x.startedAt)));
  const first = startOfDay(sessions[0].startedAt);
  const last = startOfDay(sessions[sessions.length - 1].startedAt);

  let best = 0;
  let run = 0;
  for (let ts = first; ts <= last; ts += DAY_MS) {
    if (days.has(ts)) {
      run += 1;
      if (run > best) best = run;
      continue;
    }
    // A scheduled rest day carries the run but does not extend it.
    if (s.schedule.byDay[new Date(ts).getDay()] == null) continue;
    run = 0;
  }
  return best;
}

export function lifetimeStats(s: AppState): Lifetime {
  const sessions = finishedSessions(s);
  let volumeKg = 0;
  let durationMs = 0;
  for (const x of sessions) {
    volumeKg += sessionVolume(x);
    durationMs += sessionDurationMs(x);
  }
  return {
    workouts: sessions.length,
    volumeKg: Math.round(volumeKg),
    durationMs,
    longestStreak: longestStreak(s, sessions),
    firstTs: sessions.length ? sessions[0].startedAt : null,
  };
}

/** '128 h' / '46 min' — lifetime time reads better in hours than in h:mm. */
export function fmtLongDuration(msTotal: number): string {
  const minutes = Math.round(msTotal / 60000);
  if (minutes < 90) return `${minutes} min`;
  const hours = minutes / 60;
  return `${hours >= 100 ? Math.round(hours) : hours.toFixed(1)} h`;
}
