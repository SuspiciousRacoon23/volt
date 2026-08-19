// Domain types for VOLT. These are contract-verbatim: other agents compile against them.
export type ID = string;
export type MuscleGroup =
  | 'chest' | 'back' | 'shoulders' | 'quads' | 'hamstrings' | 'glutes' | 'calves'
  | 'biceps' | 'triceps' | 'forearms' | 'core' | 'traps' | 'lats' | 'adductors' | 'neck';
export type Equipment =
  | 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight' | 'kettlebell'
  | 'band' | 'smith' | 'plate' | 'other';
export type Movement = 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'core' | 'isolation';
export type Unit = 'kg' | 'lb';
export type SetKind = 'warmup' | 'working' | 'drop' | 'failure';

export type Exercise = {
  id: ID; name: string; primary: MuscleGroup[]; secondary: MuscleGroup[];
  equipment: Equipment; movement: Movement; unilateral: boolean;
  instructions: string[]; mistakes: string[]; alternates: ID[];
  custom?: boolean; favourite?: boolean; lastUsed?: number;
  cues?: string;              // one-line coaching cue
};

export type PlannedSet = { id: ID; kind: SetKind; reps: number; weight: number | null; rpe: number | null };
export type PlannedExercise = {
  id: ID; exerciseId: ID; sets: PlannedSet[]; restSec: number; notes?: string;
  groupId?: ID;                 // shared id => superset/circuit members
};
export type GroupKind = 'superset' | 'circuit';
export type Routine = {
  id: ID; name: string; note?: string; exercises: PlannedExercise[];
  groups: Record<ID, { kind: GroupKind }>;
  estMinutes: number;           // derived at save time via lib/estimate
  archived?: boolean;
};
export type Schedule = { // weekday 0=Sun..6=Sat
  byDay: Record<number, ID | null>;   // routineId or null = rest
  deloadWeeks: string[];              // ISO week keys e.g. '2026-W34'
};

export type LoggedSet = { id: ID; kind: SetKind; reps: number; weight: number; rpe: number | null; side?: 'L' | 'R'; done: boolean; ts: number };
export type LoggedExercise = { id: ID; exerciseId: ID; sets: LoggedSet[]; notes?: string; groupId?: ID; restSec: number };
export type Session = {
  id: ID; routineId: ID | null; name: string; startedAt: number; endedAt: number | null;
  exercises: LoggedExercise[]; readinessId?: ID; unit: Unit;
};
export type Readiness = { id: ID; date: string; energy: number; sleep: number; motivation: number; stress: number; soreness: number; joints: number; soreAreas: MuscleGroup[]; note?: string };
// score fields are 1..5. verdict computed by lib/readiness.
export type BodyEntry = { id: ID; date: string; weightKg?: number; bodyFat?: number; measurements?: Partial<Record<'chest' | 'waist' | 'hips' | 'thigh' | 'arm' | 'calf' | 'shoulders' | 'neck', number>>; photoUri?: string };
export type PR = { id: ID; exerciseId: ID; kind: 'weight' | 'reps' | 'e1rm' | 'volume'; value: number; reps?: number; weight?: number; sessionId: ID; ts: number };
export type Settings = {
  unit: Unit; themeMode: 'system' | 'light' | 'dark'; reducedMotion: boolean; haptics: boolean;
  defaultRestSec: number; barKg: number; availablePlatesKg: number[]; weeklyGoal: number;
  streaksEnabled: boolean; name: string;
};
export type AppState = {
  exercises: Record<ID, Exercise>; routines: Record<ID, Routine>; schedule: Schedule;
  sessions: Record<ID, Session>; active: Session | null; readiness: Record<ID, Readiness>;
  body: Record<ID, BodyEntry>; prs: PR[]; settings: Settings; hydrated: boolean;
};

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'lats', 'traps', 'shoulders', 'biceps', 'triceps', 'forearms',
  'core', 'quads', 'hamstrings', 'glutes', 'adductors', 'calves', 'neck',
];
export const EQUIPMENT: Equipment[] = [
  'barbell', 'dumbbell', 'machine', 'cable', 'bodyweight', 'kettlebell', 'band', 'smith', 'plate', 'other',
];
export const MOVEMENTS: Movement[] = ['push', 'pull', 'squat', 'hinge', 'carry', 'core', 'isolation'];
