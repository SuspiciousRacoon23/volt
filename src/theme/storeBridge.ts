import { useStore } from '@/data/store';
import type { Settings } from '@/data/types';

/**
 * The theme sits ABOVE the store in some trees, so the store may not exist yet
 * when the theme first renders. Read it defensively and never throw: an app that
 * cannot resolve a preference should fall back to the system, not crash.
 *
 * `useStore` resolves a context internally, so the hook count stays stable
 * whether or not a provider is present.
 */
export function useSettingsSafe(): Settings | null {
  try {
    const state = useStore() as { settings?: Settings } | null | undefined;
    return state?.settings ?? null;
  } catch {
    return null;
  }
}
