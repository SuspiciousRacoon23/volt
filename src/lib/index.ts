/**
 * VOLT calculation layer.
 *
 * Pure functions only. Nothing here imports the store, touches the network,
 * or renders anything. Every entry point is total: bad input returns a sane
 * value rather than NaN, Infinity or a throw.
 */

export * from './num';
export * from './e1rm';
export * from './units';
export * from './plates';
export * from './warmup';
export * from './sets';
export * from './estimate';
export * from './readiness';
export * from './prs';
export * from './progression';
export * from './insights';
export * from './dates';

export { default as haptics } from './haptics';
export {
  celebrate,
  error as hapticError,
  hapticsEnabled,
  press,
  select,
  setHapticsEnabled,
  success,
  tap,
  thud,
  warn,
} from './haptics';
