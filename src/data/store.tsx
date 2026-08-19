import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { AppState as RNAppState } from 'react-native';

import { estimateMinutes } from '@/lib/estimate';
import { detectPRs } from '@/lib/prs';
import { warmupSets } from '@/lib/warmup';
import { uid } from './ids';
import { lastPerformance, todayReadiness } from './selectors';
import { DEFAULT_SETTINGS, STORAGE_KEY, emptyState, seedState } from './seed';
import type {
  AppState, BodyEntry, Exercise, ID, LoggedExercise, LoggedSet, PlannedSet, Readiness,
  Routine, Session, SetKind, Settings,
} from './types';

// ---------------------------------------------------------------- actions

export type Actions = {
  saveRoutine(r: Routine): void;
  deleteRoutine(id: ID): void;
  duplicateRoutine(id: ID): ID;
  setScheduleDay(day: number, routineId: ID | null): void;
  toggleDeloadWeek(week: string): void;
  upsertExercise(e: Exercise): void;
  toggleFavourite(id: ID): void;
  startSession(routineId: ID | null): ID;
  logSet(exId: ID, setId: ID, patch: Partial<LoggedSet>): void;
  addSet(exId: ID, kind?: SetKind): void;
  removeSet(exId: ID, setId: ID): void;
  addExerciseToSession(exerciseId: ID): void;
  replaceExercise(exId: ID, newExerciseId: ID): void;
  removeExerciseFromSession(exId: ID): void;
  setExerciseNote(exId: ID, note: string): void;
  finishSession(): ID | null;
  discardSession(): void;
  saveReadiness(r: Readiness): void;
  saveBody(b: BodyEntry): void;
  updateSettings(p: Partial<Settings>): void;
  resetAll(): void;
  exportJSON(): string;
};

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'apply'; fn: (s: AppState) => AppState };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return action.state;
    case 'apply':
      return action.fn(state);
    default:
      return state;
  }
}

// ---------------------------------------------------------------- helpers

function withActive(s: AppState, fn: (a: Session) => Session): AppState {
  if (!s.active) return s;
  return { ...s, active: fn(s.active) };
}

function mapExercise(a: Session, exId: ID, fn: (le: LoggedExercise) => LoggedExercise): Session {
  return { ...a, exercises: a.exercises.map((le) => (le.id === exId ? fn(le) : le)) };
}

/**
 * Fill a planned exercise with real numbers.
 *
 * Working sets inherit the matching set from the last time this lift was
 * trained — matched by position *within the working sets*, because
 * `lastPerformance` only ever returns working sets. Warm-ups cannot inherit
 * anything for the same reason, so they are built as a ramp toward the day's
 * working weight. Seeding a warm-up at the working weight is not a warm-up.
 */
function seedSets(
  planned: PlannedSet[],
  prev: LoggedSet[] | null,
  prefix: string,
  settings: Settings,
): LoggedSet[] {
  const previous = prev ?? [];
  const work =
    planned.find((p) => p.kind !== 'warmup')?.weight ?? previous[0]?.weight ?? 0;
  const ramp = warmupSets(work, settings.barKg, settings.availablePlatesKg);

  let warm = 0;
  let working = 0;

  return planned.map((ps, i) => {
    let weight = ps.weight;

    if (weight == null) {
      if (ps.kind === 'warmup') {
        weight = ramp[Math.min(warm, ramp.length - 1)]?.weight ?? 0;
        warm += 1;
      } else {
        weight = previous[Math.min(working, previous.length - 1)]?.weight ?? 0;
        working += 1;
      }
    } else if (ps.kind === 'warmup') {
      warm += 1;
    } else {
      working += 1;
    }

    return {
      id: `${prefix}-${i + 1}-${uid('s')}`,
      kind: ps.kind,
      reps: ps.reps,
      weight,
      rpe: ps.rpe,
      done: false,
      ts: 0,
    };
  });
}

function defaultSets(prefix: string): LoggedSet[] {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `${prefix}-${i + 1}-${uid('s')}`,
    kind: 'working' as SetKind,
    reps: 10,
    weight: 0,
    rpe: null,
    done: false,
    ts: 0,
  }));
}

function mergeState(parsed: Partial<AppState>): AppState {
  const base = emptyState();
  const hasLibrary = parsed.exercises && Object.keys(parsed.exercises).length > 0;
  return {
    exercises: hasLibrary ? parsed.exercises! : seedState().exercises,
    routines: parsed.routines ?? base.routines,
    schedule: parsed.schedule ?? base.schedule,
    sessions: parsed.sessions ?? base.sessions,
    active: parsed.active ?? null,
    readiness: parsed.readiness ?? base.readiness,
    body: parsed.body ?? base.body,
    prs: parsed.prs ?? [],
    settings: { ...DEFAULT_SETTINGS, ...(parsed.settings ?? {}) },
    hydrated: true,
  };
}

// ---------------------------------------------------------------- provider

const StoreCtx = createContext<AppState | null>(null);
const ActionsCtx = createContext<Actions | null>(null);

const initial: AppState = { ...emptyState(), hydrated: false };

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const ref = useRef(state);
  ref.current = state;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // hydrate once, seeding a full demo library on first launch
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: AppState;
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        next = raw ? mergeState(JSON.parse(raw) as Partial<AppState>) : seedState();
      } catch {
        next = seedState();
      }
      if (!cancelled) dispatch({ type: 'hydrate', state: next });
    })();
    return () => { cancelled = true; };
  }, []);

  // debounced autosave — every action is persisted, including the in-progress session
  useEffect(() => {
    if (!state.hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
    }, 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [state]);

  // flush immediately when the app leaves the foreground, so nothing is lost on a kill
  useEffect(() => {
    const sub = RNAppState.addEventListener('change', (status) => {
      if (status === 'active' || !ref.current.hydrated) return;
      if (timer.current) clearTimeout(timer.current);
      void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ref.current)).catch(() => undefined);
    });
    return () => sub.remove();
  }, []);

  const actions = useMemo<Actions>(() => {
    const apply = (fn: (s: AppState) => AppState) => dispatch({ type: 'apply', fn });

    return {
      saveRoutine(r) {
        const routine: Routine = { ...r, estMinutes: estimateMinutes(r) };
        apply((s) => ({ ...s, routines: { ...s.routines, [routine.id]: routine } }));
      },
      deleteRoutine(id) {
        apply((s) => {
          const routines = { ...s.routines };
          delete routines[id];
          const byDay = { ...s.schedule.byDay };
          for (const k of Object.keys(byDay)) {
            const day = Number(k);
            if (byDay[day] === id) byDay[day] = null;
          }
          return { ...s, routines, schedule: { ...s.schedule, byDay } };
        });
      },
      duplicateRoutine(id) {
        const src = ref.current.routines[id];
        const newId = uid('r');
        if (!src) return newId;
        const groupMap: Record<ID, ID> = {};
        for (const g of Object.keys(src.groups)) groupMap[g] = uid('g');
        const copy: Routine = {
          ...src,
          id: newId,
          name: `${src.name} copy`,
          groups: Object.fromEntries(Object.entries(src.groups).map(([g, v]) => [groupMap[g], v])),
          exercises: src.exercises.map((pe) => {
            const peId = uid('pe');
            return {
              ...pe,
              id: peId,
              sets: pe.sets.map((st) => ({ ...st, id: `${peId}-${uid('ps')}` })),
              ...(pe.groupId ? { groupId: groupMap[pe.groupId] } : null),
            };
          }),
        };
        apply((s) => ({ ...s, routines: { ...s.routines, [newId]: copy } }));
        return newId;
      },
      setScheduleDay(day, routineId) {
        apply((s) => ({ ...s, schedule: { ...s.schedule, byDay: { ...s.schedule.byDay, [day]: routineId } } }));
      },
      toggleDeloadWeek(week) {
        apply((s) => {
          const has = s.schedule.deloadWeeks.includes(week);
          const deloadWeeks = has
            ? s.schedule.deloadWeeks.filter((w) => w !== week)
            : [...s.schedule.deloadWeeks, week];
          return { ...s, schedule: { ...s.schedule, deloadWeeks } };
        });
      },
      upsertExercise(e) {
        apply((s) => ({ ...s, exercises: { ...s.exercises, [e.id]: e } }));
      },
      toggleFavourite(id) {
        apply((s) => {
          const ex = s.exercises[id];
          if (!ex) return s;
          return { ...s, exercises: { ...s.exercises, [id]: { ...ex, favourite: !ex.favourite } } };
        });
      },
      startSession(routineId) {
        const s = ref.current;
        const id = uid('sess');
        const routine = routineId ? s.routines[routineId] : null;
        const exercises: LoggedExercise[] = (routine?.exercises ?? []).map((pe) => {
          const prev = lastPerformance(s, pe.exerciseId);
          return {
            id: uid('le'),
            exerciseId: pe.exerciseId,
            sets: seedSets(pe.sets, prev?.sets ?? null, id, s.settings),
            restSec: pe.restSec,
            ...(pe.groupId ? { groupId: pe.groupId } : null),
          };
        });
        const readiness = todayReadiness(s);
        const session: Session = {
          id,
          routineId: routine?.id ?? null,
          name: routine?.name ?? 'Open Workout',
          startedAt: Date.now(),
          endedAt: null,
          exercises,
          unit: s.settings.unit,
          ...(readiness ? { readinessId: readiness.id } : null),
        };
        apply((prevState) => ({ ...prevState, active: session }));
        return id;
      },
      logSet(exId, setId, patch) {
        apply((s) => withActive(s, (a) => mapExercise(a, exId, (le) => ({
          ...le,
          sets: le.sets.map((st) => {
            if (st.id !== setId) return st;
            const next: LoggedSet = { ...st, ...patch };
            if (patch.done === true) next.ts = Date.now();
            if (patch.done === false) next.ts = 0;
            return next;
          }),
        }))));
      },
      addSet(exId, kind = 'working') {
        apply((s) => withActive(s, (a) => mapExercise(a, exId, (le) => {
          const last = [...le.sets].reverse().find((st) => st.kind === kind) ?? le.sets[le.sets.length - 1];
          const set: LoggedSet = {
            id: uid('s'),
            kind,
            reps: last?.reps ?? 10,
            weight: last?.weight ?? 0,
            rpe: kind === 'warmup' ? null : (last?.rpe ?? null),
            done: false,
            ts: 0,
          };
          return { ...le, sets: [...le.sets, set] };
        })));
      },
      removeSet(exId, setId) {
        apply((s) => withActive(s, (a) => mapExercise(a, exId, (le) => ({
          ...le, sets: le.sets.filter((st) => st.id !== setId),
        }))));
      },
      addExerciseToSession(exerciseId) {
        apply((s) => withActive(s, (a) => {
          const id = uid('le');
          const prev = lastPerformance(s, exerciseId);
          const sets = prev
            ? seedSets(prev.sets.map<PlannedSet>((p) => ({ id: p.id, kind: 'working', reps: p.reps, weight: p.weight, rpe: p.rpe })), prev.sets, id, s.settings)
            : defaultSets(id);
          return {
            ...a,
            exercises: [...a.exercises, { id, exerciseId, sets, restSec: s.settings.defaultRestSec }],
          };
        }));
      },
      replaceExercise(exId, newExerciseId) {
        apply((s) => withActive(s, (a) => mapExercise(a, exId, (le) => {
          const prev = lastPerformance(s, newExerciseId);
          return {
            ...le,
            exerciseId: newExerciseId,
            sets: le.sets.map((st, i) => (st.done ? st : {
              ...st,
              weight: prev?.sets[i]?.weight ?? prev?.sets[0]?.weight ?? 0,
              reps: prev?.sets[i]?.reps ?? st.reps,
            })),
          };
        })));
      },
      removeExerciseFromSession(exId) {
        apply((s) => withActive(s, (a) => ({ ...a, exercises: a.exercises.filter((le) => le.id !== exId) })));
      },
      setExerciseNote(exId, note) {
        apply((s) => withActive(s, (a) => mapExercise(a, exId, (le) => ({ ...le, notes: note }))));
      },
      finishSession() {
        const s = ref.current;
        const active = s.active;
        if (!active) return null;
        const exercises = active.exercises
          .map((le) => ({ ...le, sets: le.sets.filter((st) => st.done) }))
          .filter((le) => le.sets.length > 0);
        const session: Session = { ...active, exercises, endedAt: Date.now() };
        const history = Object.values(s.sessions).filter((x) => x.endedAt !== null);
        const prs = detectPRs(session, history, s.exercises);
        apply((prevState) => {
          const nextExercises = { ...prevState.exercises };
          for (const le of exercises) {
            const ex = nextExercises[le.exerciseId];
            if (ex) nextExercises[le.exerciseId] = { ...ex, lastUsed: session.startedAt };
          }
          return {
            ...prevState,
            exercises: nextExercises,
            sessions: { ...prevState.sessions, [session.id]: session },
            prs: [...prevState.prs, ...prs],
            active: null,
          };
        });
        return session.id;
      },
      discardSession() {
        apply((s) => ({ ...s, active: null }));
      },
      saveReadiness(r) {
        apply((s) => ({ ...s, readiness: { ...s.readiness, [r.id]: r } }));
      },
      saveBody(b) {
        apply((s) => ({ ...s, body: { ...s.body, [b.id]: b } }));
      },
      updateSettings(p) {
        apply((s) => ({ ...s, settings: { ...s.settings, ...p } }));
      },
      resetAll() {
        const fresh = seedState();
        void AsyncStorage.removeItem(STORAGE_KEY).catch(() => undefined);
        dispatch({ type: 'hydrate', state: fresh });
      },
      exportJSON() {
        const { hydrated, ...rest } = ref.current;
        void hydrated;
        return JSON.stringify({ app: 'VOLT', version: 1, exportedAt: new Date().toISOString(), data: rest }, null, 2);
      },
    };
  }, []);

  return (
    <StoreCtx.Provider value={state}>
      <ActionsCtx.Provider value={actions}>{children}</ActionsCtx.Provider>
    </StoreCtx.Provider>
  );
}

export function useStore(): AppState {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}

export function useActions(): Actions {
  const ctx = useContext(ActionsCtx);
  if (!ctx) throw new Error('useActions must be used inside StoreProvider');
  return ctx;
}
