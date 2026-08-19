import { clamp, finite } from './num';

/** Date helpers. Everything is local time; storage keys are ISO date strings. */

export type DateLike = number | string | Date;

export const DAY_MS = 86_400_000;
export const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
] as const;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function toDate(d: DateLike | undefined | null): Date {
  if (d instanceof Date && !Number.isNaN(d.getTime())) return d;
  if (typeof d === 'number' && Number.isFinite(d)) return new Date(d);
  if (typeof d === 'string' && d.length > 0) {
    const parsed = new Date(d.length === 10 ? `${d}T00:00:00` : d);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

export function toTs(d: DateLike | undefined | null): number {
  return toDate(d).getTime();
}

export function startOfDay(d: DateLike): number {
  const dt = toDate(d);
  dt.setHours(0, 0, 0, 0);
  return dt.getTime();
}

export function endOfDay(d: DateLike): number {
  return startOfDay(d) + DAY_MS - 1;
}

/** 'YYYY-MM-DD' in local time — the key used by Readiness and BodyEntry. */
export function dayKey(d: DateLike = Date.now()): string {
  const dt = toDate(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(a: DateLike, b: DateLike): boolean {
  return startOfDay(a) === startOfDay(b);
}

export function daysBetween(a: DateLike, b: DateLike): number {
  return Math.round((startOfDay(b) - startOfDay(a)) / DAY_MS);
}

/** Monday-based ISO week key, e.g. '2026-W34'. */
export function isoWeek(d: DateLike = Date.now()): string {
  const dt = toDate(d);
  const t = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
  const dayNum = (t.getUTCDay() + 6) % 7;
  t.setUTCDate(t.getUTCDate() - dayNum + 3); // the Thursday of this week
  const year = t.getUTCFullYear();
  const firstThursday = new Date(Date.UTC(year, 0, 4));
  firstThursday.setUTCDate(firstThursday.getUTCDate() - ((firstThursday.getUTCDay() + 6) % 7) + 3);
  const week = 1 + Math.round((t.getTime() - firstThursday.getTime()) / (7 * DAY_MS));
  return `${year}-W${String(clamp(week, 1, 53)).padStart(2, '0')}`;
}

/** Timestamp of the Monday that starts the week containing `d`. */
export function startOfWeek(d: DateLike = Date.now()): number {
  const dt = toDate(d);
  const offset = (dt.getDay() + 6) % 7;
  return startOfDay(dt.getTime() - offset * DAY_MS);
}

/** 'Mon' — accepts a weekday index (0=Sun) or any date. */
export function dayLabel(d: DateLike | number, long = false): string {
  const list = long ? WEEKDAYS_LONG : WEEKDAYS;
  if (typeof d === 'number' && Number.isInteger(d) && d >= 0 && d <= 6) return list[d];
  return list[toDate(d).getDay()];
}

/** '14 Aug' / '14 Aug 2025' when the year differs from now. */
export function dateLabel(d: DateLike, now: DateLike = Date.now()): string {
  const dt = toDate(d);
  const base = `${dt.getDate()} ${MONTHS[dt.getMonth()]}`;
  return dt.getFullYear() === toDate(now).getFullYear() ? base : `${base} ${dt.getFullYear()}`;
}

export function monthLabel(d: DateLike): string {
  return MONTHS[toDate(d).getMonth()];
}

/** '09:41' in 24h form. */
export function timeLabel(d: DateLike): string {
  const dt = toDate(d);
  return `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
}

/** 'just now' · '3 hours ago' · 'yesterday' · 'in 2 days'. */
export function relative(d: DateLike, now: DateLike = Date.now()): string {
  const then = toTs(d);
  const ref = toTs(now);
  const diff = ref - then;
  const abs = Math.abs(diff);
  const future = diff < 0;

  if (abs < 60_000) return 'just now';

  const days = Math.abs(daysBetween(then, ref));
  if (abs < DAY_MS && days === 0) {
    const hours = Math.floor(abs / 3_600_000);
    if (hours < 1) {
      const mins = Math.max(1, Math.floor(abs / 60_000));
      return future ? `in ${mins} min` : `${mins} min ago`;
    }
    return future ? `in ${plural(hours, 'hour')}` : `${plural(hours, 'hour')} ago`;
  }
  if (days === 1) return future ? 'tomorrow' : 'yesterday';
  if (days < 7) return future ? `in ${days} days` : `${days} days ago`;
  if (days < 31) {
    const weeks = Math.round(days / 7);
    return future ? `in ${plural(weeks, 'week')}` : `${plural(weeks, 'week')} ago`;
  }
  const months = Math.round(days / 30.44);
  if (months < 12) return future ? `in ${plural(months, 'month')}` : `${plural(months, 'month')} ago`;
  const years = Math.round(days / 365.25);
  return future ? `in ${plural(years, 'year')}` : `${plural(years, 'year')} ago`;
}

function plural(n: number, word: string): string {
  return `${n} ${word}${n === 1 ? '' : 's'}`;
}

/** '58m' · '1h 12m' · '45s'. Input is milliseconds. */
export function fmtDuration(ms: number): string {
  const total = Math.max(0, Math.round(finite(ms) / 1000));
  if (total < 60) return `${total}s`;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
}

/** 'm:ss' for the rest timer. Input is seconds. */
export function fmtClock(seconds: number): string {
  const total = Math.max(0, Math.round(finite(seconds)));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Descending list of the last `n` day-start timestamps, today first. */
export function lastDays(n: number, now: DateLike = Date.now()): number[] {
  const count = clamp(Math.round(finite(n, 7)), 1, 400);
  const base = startOfDay(now);
  const out: number[] = [];
  for (let i = 0; i < count; i += 1) out.push(base - i * DAY_MS);
  return out;
}

/** The seven day-start timestamps of the week containing `now`, Monday first. */
export function weekDays(now: DateLike = Date.now()): number[] {
  const start = startOfWeek(now);
  return [0, 1, 2, 3, 4, 5, 6].map((i) => start + i * DAY_MS);
}

/** Greeting used by the Today hero. Calm, no exclamation. */
export function partOfDay(now: DateLike = Date.now()): 'morning' | 'afternoon' | 'evening' {
  const h = toDate(now).getHours();
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  return 'evening';
}
