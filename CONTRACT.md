# VOLT — build contract (binding for every agent)

VOLT is a personal training system. Loop: **Plan → Train → Track → Improve**.
Expo SDK 57 · React Native 0.86 · React 19 · expo-router (typed routes) · TypeScript strict.
Alias `@/*` → `./src/*`. Files live under `src/`. **Never** edit a file you do not own (see OWNERSHIP).

## Non-negotiable product rules
- Palette is **white / black / grey + electric lime**. Lime = `accent`, used ONLY for: primary action, a completed set, progress fill, a PR, an improvement. Never decorative. If a screen has more than ~3 lime elements visible, that is a bug.
- Icons: **every icon is hand-drawn `react-native-svg`** from `@/icons`. Zero emoji, zero icon fonts, zero `@expo/vector-icons`, zero SF Symbols. No stock/generic fitness imagery.
- Gym-usable: primary targets ≥ 56pt tall, thumb-reachable (bottom half of screen), typing minimised (steppers, not keyboards, for weight/reps).
- Everything autosaves. Nothing is lost. Offline-only by design (AsyncStorage) — no network calls anywhere.
- Light + dark mode both must look deliberate. Reduced-motion setting must be respected by every animation.
- Copy is calm, factual, second-person. No hype, no exclamation marks, no "crushing it".

## Motion
Short and purposeful: 120–260ms. `react-native-reanimated` v4 (`react-native-worklets` present). Wrap every animated value in the reduced-motion check from `@/theme/motion`. No parallax, no gradients, no glow, no blur stacks.

---

# OWNERSHIP MAP (a file has exactly one owner)

| Owner | Files |
|---|---|
| F1 theme | `src/theme/*` |
| F2 data | `src/data/*` |
| F3 calc | `src/lib/*` |
| F4 icons | `src/icons/*` |
| F5 kit | `src/components/kit/*` |
| S1 today | `src/app/(tabs)/index.tsx`, `src/components/today/*` |
| S2 planner | `src/app/(tabs)/train.tsx`, `src/app/routine/[id].tsx`, `src/components/planner/*` |
| S3 session | `src/app/session.tsx`, `src/components/session/*` |
| S4 progress | `src/app/(tabs)/progress.tsx`, `src/components/progress/*` |
| S5 library | `src/app/(tabs)/library.tsx`, `src/app/exercise/[id].tsx`, `src/components/library/*` |
| S6 profile | `src/app/(tabs)/profile.tsx`, `src/app/checkin.tsx`, `src/app/tools.tsx`, `src/components/profile/*` |
| SHELL | `src/app/_layout.tsx`, `src/app/(tabs)/_layout.tsx`, `app.json` |

Deleted by SHELL: `src/app/index.tsx`, `src/app/explore.tsx`, `src/components/*.tsx` (scaffold leftovers), `src/constants/theme.ts`, `src/hooks/*`.
Do not import anything from `src/constants/` or `src/hooks/` — they are being removed.

---

# F1 — `src/theme` (design tokens)

```ts
// src/theme/tokens.ts
export type Palette = {
  bg: string; surface: string; surfaceAlt: string; border: string; borderStrong: string;
  text: string; textMuted: string; textFaint: string;
  accent: string;      // electric lime
  accentSoft: string;  // 12% lime wash for fills
  accentInk: string;   // text/icon colour placed ON accent
  danger: string; warn: string; scrim: string;
};
export const light: Palette = {
  bg:'#FFFFFF', surface:'#FAFAFA', surfaceAlt:'#F1F1F3', border:'#E6E6E9', borderStrong:'#D2D2D7',
  text:'#08080A', textMuted:'#6B6B75', textFaint:'#A6A6AF',
  accent:'#CCFF00', accentSoft:'rgba(204,255,0,0.16)', accentInk:'#08080A',
  danger:'#E5484D', warn:'#F5A524', scrim:'rgba(8,8,10,0.45)',
};
export const dark: Palette = {
  bg:'#08080A', surface:'#121214', surfaceAlt:'#1B1B1F', border:'#26262B', borderStrong:'#3A3A41',
  text:'#FAFAFA', textMuted:'#9B9BA5', textFaint:'#6B6B75',
  accent:'#CCFF00', accentSoft:'rgba(204,255,0,0.14)', accentInk:'#08080A',
  danger:'#FF6369', warn:'#FFB224', scrim:'rgba(0,0,0,0.6)',
};
export const space = { xs:4, sm:8, md:12, lg:16, xl:20, xxl:28, xxxl:40 } as const;
export const radius = { sm:10, md:16, lg:22, xl:30, pill:999 } as const;
export const type = {
  display:{ fontSize:52, lineHeight:52, fontWeight:'800', letterSpacing:-2 },
  title:  { fontSize:32, lineHeight:36, fontWeight:'800', letterSpacing:-1 },
  h1:     { fontSize:24, lineHeight:28, fontWeight:'700', letterSpacing:-0.6 },
  h2:     { fontSize:19, lineHeight:24, fontWeight:'700', letterSpacing:-0.3 },
  body:   { fontSize:16, lineHeight:22, fontWeight:'500' },
  small:  { fontSize:13, lineHeight:18, fontWeight:'500' },
  label:  { fontSize:11, lineHeight:14, fontWeight:'700', letterSpacing:1.4 }, // render UPPERCASE
} as const;
export const shadow = { card: <platform-appropriate soft shadow>, lifted: <stronger> };
```
```ts
// src/theme/index.ts
export function useTheme(): { c: Palette; scheme:'light'|'dark'; space; radius; type; shadow };
export function ThemeProvider(p:{children:React.ReactNode}): JSX.Element;   // reads settings.themeMode from F2 store
// src/theme/motion.ts
export function useReducedMotion(): boolean;   // reads settings.reducedMotion from F2 store
export const dur = { fast:120, base:180, slow:260 } as const;
export function ms(v:number, reduced:boolean): number; // returns 0 when reduced
```

# F2 — `src/data`

```ts
// src/data/types.ts
export type ID = string;
export type MuscleGroup = 'chest'|'back'|'shoulders'|'quads'|'hamstrings'|'glutes'|'calves'|'biceps'|'triceps'|'forearms'|'core'|'traps'|'lats'|'adductors'|'neck';
export type Equipment = 'barbell'|'dumbbell'|'machine'|'cable'|'bodyweight'|'kettlebell'|'band'|'smith'|'plate'|'other';
export type Movement = 'push'|'pull'|'squat'|'hinge'|'carry'|'core'|'isolation';
export type Unit = 'kg'|'lb';
export type SetKind = 'warmup'|'working'|'drop'|'failure';

export type Exercise = {
  id:ID; name:string; primary:MuscleGroup[]; secondary:MuscleGroup[];
  equipment:Equipment; movement:Movement; unilateral:boolean;
  instructions:string[]; mistakes:string[]; alternates:ID[];
  custom?:boolean; favourite?:boolean; lastUsed?:number;
  cues?:string;              // one-line coaching cue
};

export type PlannedSet = { id:ID; kind:SetKind; reps:number; weight:number|null; rpe:number|null };
export type PlannedExercise = {
  id:ID; exerciseId:ID; sets:PlannedSet[]; restSec:number; notes?:string;
  groupId?:ID;                 // shared id => superset/circuit members
};
export type GroupKind = 'superset'|'circuit';
export type Routine = {
  id:ID; name:string; note?:string; exercises:PlannedExercise[];
  groups:Record<ID,{ kind:GroupKind }>;
  estMinutes:number;           // derived at save time via lib/estimate
  archived?:boolean;
};
export type Schedule = { // weekday 0=Sun..6=Sat
  byDay: Record<number, ID|null>;   // routineId or null = rest
  deloadWeeks: string[];            // ISO week keys e.g. '2026-W34'
};

export type LoggedSet = { id:ID; kind:SetKind; reps:number; weight:number; rpe:number|null; side?:'L'|'R'; done:boolean; ts:number };
export type LoggedExercise = { id:ID; exerciseId:ID; sets:LoggedSet[]; notes?:string; groupId?:ID; restSec:number };
export type Session = {
  id:ID; routineId:ID|null; name:string; startedAt:number; endedAt:number|null;
  exercises:LoggedExercise[]; readinessId?:ID; unit:Unit;
};
export type Readiness = { id:ID; date:string; energy:number; sleep:number; motivation:number; stress:number; soreness:number; joints:number; soreAreas:MuscleGroup[]; note?:string };
// score fields are 1..5. verdict computed by lib/readiness.
export type BodyEntry = { id:ID; date:string; weightKg?:number; bodyFat?:number; measurements?:Partial<Record<'chest'|'waist'|'hips'|'thigh'|'arm'|'calf'|'shoulders'|'neck',number>>; photoUri?:string };
export type PR = { id:ID; exerciseId:ID; kind:'weight'|'reps'|'e1rm'|'volume'; value:number; reps?:number; weight?:number; sessionId:ID; ts:number };
export type Settings = {
  unit:Unit; themeMode:'system'|'light'|'dark'; reducedMotion:boolean; haptics:boolean;
  defaultRestSec:number; barKg:number; availablePlatesKg:number[]; weeklyGoal:number;
  streaksEnabled:boolean; name:string;
};
export type AppState = {
  exercises:Record<ID,Exercise>; routines:Record<ID,Routine>; schedule:Schedule;
  sessions:Record<ID,Session>; active:Session|null; readiness:Record<ID,Readiness>;
  body:Record<ID,BodyEntry>; prs:PR[]; settings:Settings; hydrated:boolean;
};
```
```ts
// src/data/store.tsx  — single source of truth, AsyncStorage-persisted (debounced 300ms), key 'volt.v1'
export function StoreProvider(p:{children:React.ReactNode}):JSX.Element;
export function useStore():AppState;
export function useActions():Actions;
export type Actions = {
  // routines
  saveRoutine(r:Routine):void; deleteRoutine(id:ID):void; duplicateRoutine(id:ID):ID;
  setScheduleDay(day:number, routineId:ID|null):void; toggleDeloadWeek(week:string):void;
  // exercises
  upsertExercise(e:Exercise):void; toggleFavourite(id:ID):void;
  // session lifecycle
  startSession(routineId:ID|null):ID;   // seeds LoggedExercises from the routine, all sets done:false
  logSet(exId:ID, setId:ID, patch:Partial<LoggedSet>):void;   // autosaves; sets done+ts when done:true
  addSet(exId:ID, kind?:SetKind):void; removeSet(exId:ID, setId:ID):void;
  addExerciseToSession(exerciseId:ID):void; replaceExercise(exId:ID, newExerciseId:ID):void;
  removeExerciseFromSession(exId:ID):void; setExerciseNote(exId:ID, note:string):void;
  finishSession():ID|null;   // computes PRs via lib/prs, appends to sessions, clears active
  discardSession():void;
  // tracking
  saveReadiness(r:Readiness):void; saveBody(b:BodyEntry):void;
  updateSettings(p:Partial<Settings>):void;
  resetAll():void; exportJSON():string;
};
// selectors (pure, exported from src/data/selectors.ts)
export function lastPerformance(s:AppState, exerciseId:ID):{ session:Session; sets:LoggedSet[] }|null;
export function exerciseHistory(s:AppState, exerciseId:ID):{ ts:number; topSet:LoggedSet; e1rm:number; volume:number }[]; // ascending ts
export function todayRoutine(s:AppState):Routine|null;
export function nextTrainingDay(s:AppState):{ day:number; routine:Routine }|null;
export function weekSessions(s:AppState, weeksAgo?:number):Session[];
export function volumeByMuscle(s:AppState, sinceTs:number):Record<MuscleGroup,number>;
export function recentPRs(s:AppState, n:number):PR[];
export function streak(s:AppState):number;
export function todayReadiness(s:AppState):Readiness|null;
```
`src/data/seed.ts` exports `seedState(): AppState` — **≥ 64 real exercises** with genuine instructions/mistakes/cues, 3 templates (Push·Pull·Legs, Upper·Lower, Full Body), a schedule, and ~7 weeks of plausible past sessions so charts, PRs and "previous" are never empty on first launch. Progress must be believable: mostly upward with one plateau and one deload week.

# F3 — `src/lib` (pure functions, fully unit-testable, zero imports from data/store)
```ts
// e1rm.ts
export function epley(weight:number, reps:number):number;
export function brzycki(weight:number, reps:number):number;
export function e1rm(weight:number, reps:number):number;      // blended, rounds to 0.5
// plates.ts
export function platesFor(target:number, barKg:number, plates:number[]):{ perSide:number[]; achievable:number; leftover:number };
// warmup.ts
export function warmupSets(workWeight:number, barKg:number):{ weight:number; reps:number; pct:number }[];
// estimate.ts
export function estimateMinutes(r:Routine):number;
// units.ts
export function kgToLb(v:number):number; export function lbToKg(v:number):number;
export function fmtWeight(kg:number, unit:Unit):string;        // '82.5 kg' / '180 lb'
export function roundToIncrement(kg:number, unit:Unit):number;  // 2.5kg / 5lb
// prs.ts
export function detectPRs(session:Session, history:Session[], exercises:Record<ID,Exercise>):PR[];
// progression.ts
export type Suggestion = { exerciseId:ID; observed:string; action:string; weight:number|null; reps:number|null; kind:'increase'|'hold'|'deload'|'plateau'|'volume-warning'|'neglected' };
export function suggestNext(exerciseId:ID, history:..., readiness:Readiness|null):Suggestion|null;
export function auditVolume(volumeByMuscle:Record<MuscleGroup,number>, prevWeek:Record<MuscleGroup,number>):Suggestion[];
// readiness.ts
export function readinessScore(r:Readiness):number;            // 0..100
export function readinessVerdict(r:Readiness):'Ready'|'Moderate'|'Recover';
// insights.ts
export function buildInsights(state):string[];  // e.g. 'Your bench press is up 7.5% this month.'
// dates.ts  — isoWeek, dayLabel, relative('2 days ago'), fmtDuration(ms)
```
Every progression suggestion is **observation + action**, and the UI must require the user to accept it. Never auto-apply. Never phrase anything as medical advice.

# F4 — `src/icons` — custom SVG icon set, the signature of this app
One file per icon, `src/icons/<Name>.tsx`, re-exported from `src/icons/index.ts`.
```ts
export type IconProps = { size?:number; color?:string; strokeWidth?:number; filled?:boolean };
```
Rules: 24×24 viewBox, default size 24, `stroke={color}` default `currentColor`-equivalent (caller always passes), `strokeWidth` default 1.75, round caps/joins, **no fill unless `filled`**, geometry drawn on a 2px grid so the set looks like one family. Optically consistent weight — an icon must not look heavier than its neighbours.
Required (≥ 34): `Today, Barbell, Chart, Library, Profile` (the 5 tabs, each with a `filled` active variant), `Play, Pause, Check, Plus, Minus, Close, ChevronLeft, ChevronRight, ChevronDown, More, Search, Filter, Star, StarFilled, Timer, Flame, Trophy, Bolt, Drag, Swap, Duplicate, Trash, Edit, Note, Sun, Moon, Sleep, Battery, Brain, Joint, Ruler, Camera, Export, Calculator, Plate, Rest, Superset, Target, Body, Streak, Info, Warning`.
Also `src/icons/BodyMap.tsx`: `<BodyMap side='front'|'back' selected:MuscleGroup[] onToggle?:(m)=>void heat?:Partial<Record<MuscleGroup,number>> />` — a real hand-drawn anatomical silhouette with individually addressable muscle paths. This is a centrepiece; make it good.
Also `src/icons/Logo.tsx` — the VOLT mark.

# F5 — `src/components/kit` — shared primitives, everyone uses these
`Screen` (safe area + scroll + header slot), `Text` (variant from `type`, colour from palette, tabular numerals when `numeric`), `Card`, `Button` (`variant:'primary'|'secondary'|'ghost'|'danger'`, primary = lime fill + accentInk text, min height 56), `IconButton`, `Chip` (selectable), `Stepper` (big −/+ with long-press repeat, for weight/reps), `Segmented`, `Sheet` (bottom sheet), `ProgressBar`, `Ring` (SVG circular progress, used by the rest timer), `Sparkline`, `LineChart` (SVG: black data line, grey comparison line, lime highlight segment/dot for improvement, no gridline clutter), `BarChart`, `StatTile`, `EmptyState`, `Divider`, `Skeleton`, `Toast`/`useToast`, `Confirm`.
`Button`/`IconButton`/`Chip`/`Stepper` fire haptics via `@/lib/haptics` when `settings.haptics` (respect web: no-op).

---

# Screens

**SHELL** — `src/app/_layout.tsx`: ThemeProvider > StoreProvider > GestureHandlerRootView > Stack. Restores an unfinished session on launch by routing to `/session` after a "You have an unfinished workout" prompt. `(tabs)/_layout.tsx`: 5 tabs — Today · Train · Progress · Library · Profile — custom bar (no default tab bar styling): custom icons, active = lime, inactive = textFaint, floating rounded bar with a hairline border. Tab bar hidden on `/session`.

**S1 Today** — hero is the scheduled workout and it must be the loudest thing on screen: routine name in `display`, target muscles as chips, estimated duration, and a full-width lime **Start Workout** button (that is tap #1; tap #2 is the first Set Done). Then: week completion strip (7 dots, done = lime), readiness check-in card (or today's verdict if done), recent PRs, one or two `buildInsights` lines, next training day. Rest day gets its own considered state, not an empty one.

**S2 Train (planner)** — routine list + templates + create. `routine/[id]` is a visual builder: drag-to-reorder (reanimated + gesture-handler), set rows as compact editable chips (warmup sets visually distinct from working sets), superset/circuit grouping shown by a lime bracket down the left edge, drop sets nested, duplicate previous workout, schedule to weekdays, rest/deload week toggles. Feels like arranging cards, never like a spreadsheet.

**S3 Session (active workout)** — the best part of the app. Full-screen, no tab bar, keep-awake on. One exercise in focus with a horizontal pager for the rest. Per exercise: name, `Demonstration` placeholder block (a custom SVG figure — no video), previous performance inline, current set index, big weight/reps steppers, RPE/RIR selector, note, replace-exercise, add/remove set, unilateral L/R toggle, add unplanned exercise. **One tap on the lime Set Done bar** completes the set → autosave → rest timer starts → focus advances to the next set. A `Ring` rest timer with ±15s, skip, next-set preview, and a haptic + visual pulse at zero; it keeps running and stays reachable as a compact pill while the user moves around inside the session. Finish → summary: duration, volume, PRs won, insight line.

**S4 Progress** — segmented: Strength · Volume · Body. Charts from F5 (`LineChart`/`BarChart`). e1RM per exercise over time, weekly volume, sets per muscle (with `BodyMap` heat), duration, consistency grid, bodyweight/body-fat, measurements, private photos (local only, clearly marked private). Every chart is topped by a plain-language `buildInsights` statement.

**S5 Library** — search + filters (muscle / equipment / movement / favourites / recent). `exercise/[id]`: custom SVG demonstration figure, instructions, common mistakes, primary+secondary muscles on a small `BodyMap`, equipment, alternates, personal history chart + PR list. Create custom exercise.

**S6 Profile** — name/unit/theme/haptics/reduced motion/weekly goal/rest default/bar+plates, streaks toggle, reminders (local state only), data export (`exportJSON` → share/copy), reset. `checkin.tsx`: the < 10s readiness check-in — six 1–5 rows and the `BodyMap` for sore areas, then a Ready/Moderate/Recover verdict with a non-medical caveat. `tools.tsx`: plate calculator, 1RM calculator, warm-up calculator, duration estimator, kg↔lb converter, substitution finder, shareable workout summary.

---

# Definition of done for every agent
1. `npx tsc --noEmit` clean for the files you own.
2. No unused imports, no `any` except where unavoidable, no `console.log`.
3. No file over ~450 lines — split into `src/components/<area>/`.
4. Light AND dark both checked mentally against the palette; no hardcoded hex outside `src/theme`.
5. Reduced motion respected; every touchable ≥ 44pt, primary ≥ 56pt.
