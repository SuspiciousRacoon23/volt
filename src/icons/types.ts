import { light } from '@/theme/tokens';

/**
 * Fallback ink for an icon rendered without a colour. Callers pass a palette
 * colour in every real use; this exists so no icon ever hardcodes its own hex.
 */
export const ICON_INK = light.text;

export type IconProps = {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
};
