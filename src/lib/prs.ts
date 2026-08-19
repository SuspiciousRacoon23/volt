import type { Exercise, ID, LoggedSet, PR, Session } from '@/data/types';
import { e1rm } from './e1rm';
import { finite, round } from './num';
import { setsForExercise, workingSets } from './sets';

/**
 * Record detection.
 *
 * Four kinds, all measured against everything logged before this session:
 *   weight  — the heaviest completed working set
 *   reps    — more reps than ever before at a weight already lifted
 *   e1rm    — a better estimated max
 *   volume  — more total work for that exercise in a single session
 *
 * Warm-ups and unfinished sets never count. The first time an exercise is ever
 * performed produces exactly one record, not four.
 */

const EPS = 1e-6;

type ExerciseHistory = {
  bestWeight: number;
  bestWeightReps: number;
  bestE1rm: number;
  bestVolume: number;
  /** weight -> most reps ever completed at exactly that weight */
  repsByWeight: Map<number, number>;
  seen: boolean;
};

let prCounter = 0;
function makeId(kind: string): ID {
  prCounter = (prCounter + 1) % 1_000_000;
  return `pr_${kind}_${Date.now().toString(36)}_${prCounter.toString(36)}${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}

function weightKey(w: number): number {
  return round(finite(w), 2);
}

function emptyHistory(): ExerciseHistory {
  return {
    bestWeight: 0,
    bestWeightReps: 0,
    bestE1rm: 0,
    bestVolume: 0,
    repsByWeight: new Map(),
    seen: false,
  };
}

function absorb(h: ExerciseHistory, sets: readonly LoggedSet[]): void {
  let volume = 0;
  for (const s of sets) {
    const w = Math.max(0, finite(s.weight));
    const reps = Math.max(0, finite(s.reps));
    if (reps < 1) continue;
    h.seen = true;
    volume += w * reps;
    if (w > h.bestWeight + EPS) {
      h.bestWeight = w;
      h.bestWeightReps = reps;
    } else if (Math.abs(w - h.bestWeight) <= EPS && reps > h.bestWeightReps) {
      h.bestWeightReps = reps;
    }
    const est = e1rm(w, reps);
    if (est > h.bestE1rm) h.bestE1rm = est;
    const key = weightKey(w);
    const prev = h.repsByWeight.get(key) ?? 0;
    if (reps > prev) h.repsByWeight.set(key, reps);
  }
  if (volume > h.bestVolume) h.bestVolume = round(volume, 2);
}

/** Build per-exercise bests from every session that came before `before`. */
function buildHistory(history: readonly Session[], before: number, excludeId: ID): Map<ID, ExerciseHistory> {
  const map = new Map<ID, ExerciseHistory>();
  if (!Array.isArray(history)) return map;

  for (const s of history) {
    if (!s || s.id === excludeId) continue;
    const ts = finite(s.startedAt, 0);
    if (ts <= 0 || ts >= before) continue;
    if (!Array.isArray(s.exercises)) continue;

    const perExercise = new Map<ID, LoggedSet[]>();
    for (const ex of s.exercises) {
      if (!ex || typeof ex.exerciseId !== 'string') continue;
      const list = perExercise.get(ex.exerciseId) ?? [];
      list.push(...workingSets(ex.sets));
      perExercise.set(ex.exerciseId, list);
    }
    perExercise.forEach((sets, exerciseId) => {
      if (sets.length === 0) return;
      const h = map.get(exerciseId) ?? emptyHistory();
      absorb(h, sets);
      map.set(exerciseId, h);
    });
  }
  return map;
}

/**
 * Records set by `session`, measured against `history`.
 * `history` may include `session` itself — it is filtered out.
 */
export function detectPRs(
  session: Session,
  history: Session[],
  exercises: Record<ID, Exercise>,
): PR[] {
  const out: PR[] = [];
  if (!session || !Array.isArray(session.exercises)) return out;

  const sessionTs = finite(session.endedAt, 0) || finite(session.startedAt, Date.now());
  const past = buildHistory(history ?? [], finite(session.startedAt, sessionTs) || sessionTs, session.id);

  const exerciseIds: ID[] = [];
  for (const ex of session.exercises) {
    if (!ex || typeof ex.exerciseId !== 'string') continue;
    if (!exerciseIds.includes(ex.exerciseId)) exerciseIds.push(ex.exerciseId);
  }

  for (const exerciseId of exerciseIds) {
    const sets = setsForExercise(session, exerciseId);
    if (sets.length === 0) continue;

    const meta = exercises?.[exerciseId];
    const loadless = meta?.equipment === 'bodyweight';
    const prior = past.get(exerciseId) ?? emptyHistory();

    // Current-session bests.
    let bestWeight = 0;
    let bestWeightReps = 0;
    let bestEst = 0;
    let bestEstSet: LoggedSet | null = null;
    let volume = 0;
    const repsByWeight = new Map<number, LoggedSet>();

    for (const s of sets) {
      const w = Math.max(0, finite(s.weight));
      const reps = Math.max(0, finite(s.reps));
      if (reps < 1) continue;
      volume += w * reps;
      if (w > bestWeight + EPS || (Math.abs(w - bestWeight) <= EPS && reps > bestWeightReps)) {
        bestWeight = w;
        bestWeightReps = reps;
      }
      const est = e1rm(w, reps);
      if (est > bestEst) {
        bestEst = est;
        bestEstSet = s;
      }
      const key = weightKey(w);
      const held = repsByWeight.get(key);
      if (!held || reps > finite(held.reps)) repsByWeight.set(key, s);
    }
    volume = round(volume, 2);

    const push = (kind: PR['kind'], value: number, extra?: { reps?: number; weight?: number }) => {
      out.push({
        id: makeId(kind),
        exerciseId,
        kind,
        value: round(value, 2),
        reps: extra?.reps,
        weight: extra?.weight,
        sessionId: session.id,
        ts: sessionTs,
      });
    };

    // First time ever: one record, so the summary reads as a milestone not a flood.
    if (!prior.seen) {
      if (!loadless && bestWeight > 0) push('weight', bestWeight, { reps: bestWeightReps, weight: bestWeight });
      else if (volume > 0 || bestWeightReps > 0) push('reps', bestWeightReps, { weight: bestWeight, reps: bestWeightReps });
      continue;
    }

    if (!loadless && bestWeight > prior.bestWeight + EPS) {
      push('weight', bestWeight, { reps: bestWeightReps, weight: bestWeight });
    } else {
      // A rep record only counts at a weight already lifted before.
      const gains: LoggedSet[] = [];
      repsByWeight.forEach((set, key) => {
        const previous = prior.repsByWeight.get(key);
        if (previous === undefined) return;
        if (finite(set.reps) > previous) gains.push(set);
      });
      gains.sort((a, b) => finite(b.weight) - finite(a.weight) || finite(b.reps) - finite(a.reps));
      const gain = gains[0];
      if (gain) {
        push('reps', finite(gain.reps), { weight: finite(gain.weight), reps: finite(gain.reps) });
      }
    }

    if (bestEst > prior.bestE1rm + 0.4 && bestEstSet) {
      push('e1rm', bestEst, { weight: finite(bestEstSet.weight), reps: finite(bestEstSet.reps) });
    }

    if (volume > prior.bestVolume + EPS && prior.bestVolume > 0) {
      push('volume', volume);
    }
  }

  return out;
}

/** Best record of each kind per exercise, newest first — for the PR list. */
export function bestPRs(prs: readonly PR[], exerciseId?: ID): PR[] {
  if (!Array.isArray(prs)) return [];
  const filtered = exerciseId ? prs.filter((p) => p?.exerciseId === exerciseId) : prs.filter(Boolean);
  const best = new Map<string, PR>();
  for (const p of filtered) {
    const key = `${p.exerciseId}:${p.kind}`;
    const held = best.get(key);
    if (!held || finite(p.value) > finite(held.value)) best.set(key, p);
  }
  return Array.from(best.values()).sort((a, b) => finite(b.ts) - finite(a.ts));
}

/** Plain-language label for a record, for cards and the session summary. */
export function describePR(pr: PR, exerciseName: string, fmt: (kg: number) => string): string {
  const name = exerciseName || 'this lift';
  if (!pr) return '';
  switch (pr.kind) {
    case 'weight':
      return `Heaviest ${name} yet at ${fmt(finite(pr.value))}.`;
    case 'reps':
      return `Most reps at ${fmt(finite(pr.weight))} on ${name}: ${Math.round(finite(pr.value))}.`;
    case 'e1rm':
      return `Best estimated max on ${name}: ${fmt(finite(pr.value))}.`;
    case 'volume':
      return `Most work in one session on ${name}.`;
    default:
      return `New record on ${name}.`;
  }
}
