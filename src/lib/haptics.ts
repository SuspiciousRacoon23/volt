import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/**
 * Thin haptics wrapper.
 *
 * No-ops on web and whenever the user has turned haptics off, and swallows
 * every rejection — a missing taptic engine must never surface as an error
 * mid-set. Call `setHapticsEnabled` from the store whenever the setting changes.
 */

let enabled = true;

const supported = Platform.OS === 'ios' || Platform.OS === 'android';

export function setHapticsEnabled(value: boolean): void {
  enabled = value !== false;
}

export function hapticsEnabled(): boolean {
  return enabled && supported;
}

function run(fn: () => Promise<unknown>): void {
  if (!hapticsEnabled()) return;
  try {
    const result = fn();
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      (result as Promise<unknown>).catch(() => undefined);
    }
  } catch {
    // Haptics are a nicety. Never let them interrupt a session.
  }
}

/** Light tap — steppers, chips, toggles. */
export function tap(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** Medium tap — a button that changes state. */
export function press(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** Heavy tap — the rest timer hitting zero. */
export function thud(): void {
  run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
}

/** Selection change — segmented controls, pager movement. */
export function select(): void {
  run(() => Haptics.selectionAsync());
}

/** A set completed, a session finished. */
export function success(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** A confirm-destructive prompt appearing. */
export function warn(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

export function error(): void {
  run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}

/** A personal record — two beats, deliberately distinct from a normal set. */
export function celebrate(): void {
  if (!hapticsEnabled()) return;
  success();
  setTimeout(() => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)), 110);
}

export const haptics = {
  tap, press, thud, select, success, warn, error, celebrate,
  setEnabled: setHapticsEnabled,
  isEnabled: hapticsEnabled,
};

export default haptics;
