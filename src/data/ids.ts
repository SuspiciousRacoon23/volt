import type { ID } from './types';

let counter = 0;

/** Collision-resistant local id. Time-ordered so ids sort chronologically. */
export function uid(prefix = 'v'): ID {
  counter = (counter + 1) % 100000;
  const t = Date.now().toString(36);
  const c = counter.toString(36).padStart(4, '0');
  const r = Math.floor(Math.random() * 1679616).toString(36).padStart(4, '0');
  return `${prefix}_${t}${c}${r}`;
}

/** Deterministic id builder, used by the seed so first-launch data is stable. */
export function sid(...parts: (string | number)[]): ID {
  return parts.join('-');
}
