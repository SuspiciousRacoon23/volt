import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { celebrate, tap } from '@/lib/haptics';

const TICK = 250;
/** How long the finished state stays on screen before it clears itself. */
const LINGER = 6000;

export type RestTimer = {
  running: boolean;
  /** True for a few seconds after the countdown reaches zero. */
  finished: boolean;
  remaining: number;
  duration: number;
  /** Increments once each time a countdown reaches zero. Drives the pulse. */
  pulse: number;
  start: (seconds: number) => void;
  adjust: (delta: number) => void;
  skip: () => void;
};

type Snapshot = {
  running: boolean;
  finished: boolean;
  remaining: number;
  duration: number;
  pulse: number;
};

const IDLE: Snapshot = { running: false, finished: false, remaining: 0, duration: 0, pulse: 0 };

/**
 * The rest countdown. Anchored to a wall-clock deadline rather than a tick
 * count, so it stays honest if the interval is throttled or the phone sleeps.
 */
export function useRestTimer(): RestTimer {
  const [snap, setSnap] = useState<Snapshot>(IDLE);

  const endsAt = useRef(0);
  const duration = useRef(0);
  const clearAt = useRef(0);
  const pulse = useRef(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const tick = useCallback(() => {
    const now = Date.now();
    const left = Math.max(0, Math.round((endsAt.current - now) / 1000));

    if (left > 0) {
      setSnap((s) =>
        s.running && s.remaining === left && s.duration === duration.current
          ? s
          : { running: true, finished: false, remaining: left, duration: duration.current, pulse: pulse.current },
      );
      return;
    }

    if (clearAt.current === 0) {
      clearAt.current = now + LINGER;
      pulse.current += 1;
      celebrate();
      setSnap({ running: false, finished: true, remaining: 0, duration: duration.current, pulse: pulse.current });
      return;
    }

    if (now >= clearAt.current) {
      stop();
      endsAt.current = 0;
      duration.current = 0;
      clearAt.current = 0;
      setSnap({ running: false, finished: false, remaining: 0, duration: 0, pulse: pulse.current });
    }
  }, [stop]);

  const run = useCallback(() => {
    if (timer.current) return;
    timer.current = setInterval(tick, TICK);
  }, [tick]);

  const start = useCallback(
    (seconds: number) => {
      if (!Number.isFinite(seconds) || seconds <= 0) return;
      const secs = Math.round(seconds);
      duration.current = secs;
      endsAt.current = Date.now() + secs * 1000;
      clearAt.current = 0;
      setSnap({ running: true, finished: false, remaining: secs, duration: secs, pulse: pulse.current });
      run();
    },
    [run],
  );

  const adjust = useCallback(
    (delta: number) => {
      if (duration.current <= 0) return;
      const base = Math.max(Date.now(), endsAt.current);
      endsAt.current = Math.max(Date.now() + 1000, base + delta * 1000);
      duration.current = Math.max(15, duration.current + delta);
      clearAt.current = 0;
      tap();
      run();
      tick();
    },
    [run, tick],
  );

  const skip = useCallback(() => {
    stop();
    endsAt.current = 0;
    duration.current = 0;
    clearAt.current = 0;
    setSnap({ running: false, finished: false, remaining: 0, duration: 0, pulse: pulse.current });
  }, [stop]);

  useEffect(() => stop, [stop]);

  return useMemo(
    () => ({ ...snap, start, adjust, skip }),
    [adjust, skip, snap, start],
  );
}

/** Milliseconds since the session began, refreshed once a second. */
export function useElapsed(startedAt: number): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  return Math.max(0, now - startedAt);
}
