# VOLT

A personal training system for the phone in your pocket at the gym. Plan a week,
run the session, log every set with one thumb, and see what the log actually says.

VOLT is offline by design. There is no account, no server, no sync and no network
call anywhere in the app. Your training history lives on your device and nowhere
else.

---

## The loop

**Plan → Train → Track → Improve.**

- **Today** opens on the workout you are scheduled to do, and the largest thing on
  the screen is the button that starts it. Tap one is *Start workout*. Tap two is
  the first *Set done*.
- **Session** is full-screen and thumb-shaped. One exercise in focus, a pager for
  the rest, big steppers instead of a keyboard. One tap on the lime bar logs the
  set, starts the rest timer and moves focus to what is next.
- **Progress** turns the log into plain sentences before it turns it into charts.
- **Library** is 73 exercises with real instructions, common mistakes and a
  coaching cue, plus anything you add yourself.
- **Profile** holds the settings, the seven calculators, the ten-second readiness
  check-in and a full JSON export of everything.

---

## Design rules

These are not preferences. They are the reason the app looks like one thing.

**Palette discipline.** White, black, grey — and electric lime (`#CCFF00`). Lime is
never decorative. It marks exactly five things: the primary action, a completed
set, a progress fill, a personal record, and an improvement. If more than about
three lime elements are visible at once, that is a bug. Every colour in the app
comes from `src/theme/tokens.ts`; there is not a single hardcoded hex anywhere
else in `src/`.

**A hand-drawn icon system.** Every icon in VOLT is a `react-native-svg` path
written for this app — 55 glyphs plus an anatomical `BodyMap` with individually
addressable muscle groups and the VOLT mark. All of them are 24×24, 1.75 stroke,
round caps and joins, geometry on a 2px grid, no fill unless `filled`. There are
no icon fonts, no SF Symbols, no `@expo/vector-icons`, and no emoji in any UI
copy.

**Offline-first, autosave-always.** The whole app state is one object persisted to
AsyncStorage under `volt.v1`, debounced at 300ms and flushed immediately when the
app leaves the foreground. A session interrupted by a dead battery is offered
back to you on next launch. Nothing is ever lost, and nothing ever leaves the
device.

**Gym-usable.** Primary targets are at least 56pt tall and sit in the bottom half
of the screen. Weight and reps are steppers, not text fields.

**Both themes are deliberate.** Light and dark are designed, not inverted. Motion
is 120–260ms and purposeful, and every animation collapses to nothing when the
reduced-motion setting is on.

**Calm copy.** Second person, factual, no hype and no exclamation marks. Every
progression suggestion is an observation plus an action that you have to accept —
nothing is ever applied for you, and nothing is ever phrased as medical advice.

---

## Architecture

Expo SDK 57 · React Native 0.86 · React 19 · expo-router (typed routes) ·
TypeScript strict. The alias `@/*` maps to `./src/*`.

```
src/
  theme/      Design tokens, the provider, and the reduced-motion contract.
              The only place a colour is written down.
  data/       Types, the seeded library and history, the AsyncStorage-backed
              store (one reducer, one action set), and pure selectors over it.
  lib/        Pure functions with no knowledge of the store: e1RM, plate maths,
              warm-up ramps, PR detection, progression, readiness, insights,
              dates, units. This is where the arithmetic lives.
  icons/      One file per icon, re-exported from a single barrel, plus BodyMap
              and the demonstration figures.
  kit/        (src/components/kit) The shared primitives every screen is built
              from: Screen, Text, Card, Button, Stepper, Sheet, Ring, LineChart,
              BarChart, Toast, Confirm and friends.
  app/        The routes. Five tabs (Today · Train · Progress · Library ·
              Profile) plus /session, /checkin, /tools, /routine/[id] and
              /exercise/[id]. Screen-specific components live beside them in
              src/components/<area>/.
```

The dependency direction is one way: `app` → `kit` → `icons`/`theme`, and
`app` → `data` → `lib`. `lib` imports nothing from `data/store`, which is what
makes all of the arithmetic testable on its own.

---

## Running it

```bash
npm install

npm run ios       # iOS simulator
npm run android   # Android emulator
npm run web       # browser
```

Type-check and bundle:

```bash
npx tsc --noEmit
npx expo export --platform web
```

First launch seeds a full library, six routines, a weekly schedule and about
seven weeks of plausible training history, so charts, records and "last time"
are real from the first screen instead of empty.

---

## In v1

Scheduling and a visual routine builder with supersets and drag-to-reorder. The
full session runtime: pager, steppers, RPE, unilateral L/R, warm-up ramps,
replace-exercise, unplanned exercises, and a rest timer that survives moving
around the session. PR detection across weight, reps, estimated 1RM and volume.
Strength, volume and body progress with a muscle heat map, consistency grid,
measurements and private local-only photos. A readiness check-in and the seven
calculators. Full JSON export.

## Deliberately deferred

- **Wearables and heart rate.** Watch apps, HRV and live heart rate are a
  different product surface, and none of them make the set in front of you
  easier to log.
- **Deeper analytics.** Fatigue modelling, per-muscle recovery scores and
  volume-landmark programming need more logged data than a new user has, and
  they invite the app to sound more certain than the arithmetic justifies.
- **Social.** No feed, no sharing, no leaderboards, no accounts. The offline-only
  guarantee is the feature, and every one of these would end it.
