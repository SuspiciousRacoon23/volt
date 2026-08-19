import React, { useMemo } from 'react';
import Svg, { G, Path } from 'react-native-svg';

import type { MuscleGroup } from '@/data/types';
import { useTheme } from '@/theme';

import {
  ARMS,
  BACK_DETAIL,
  BACK_ORDER,
  BACK_PATHS,
  FRONT_DETAIL,
  FRONT_ORDER,
  FRONT_PATHS,
  SILHOUETTE,
  VB_H,
  VB_W,
  type BodySide,
} from './figures/bodyPaths';

export type BodyMapProps = {
  /** Which face of the body to draw. */
  side?: BodySide;
  /** Muscle groups rendered in the active colour at full strength. */
  selected?: MuscleGroup[];
  /** Omit to make the map read-only. */
  onToggle?: (m: MuscleGroup) => void;
  /** 0..1 per group — interpolates the active colour's opacity. */
  heat?: Partial<Record<MuscleGroup, number>>;
  /** Rendered HEIGHT in points. Width follows the 200:490 viewBox. */
  size?: number;
  /** Resting muscle fill. Defaults to the theme's alt surface. */
  base?: string;
  /** Selection / heat colour. Defaults to the theme accent. */
  active?: string;
  /** Muscle separations. Defaults to the theme border. */
  border?: string;
  /** Silhouette + anatomy hairlines. Defaults to the theme's faint text. */
  color?: string;
};

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

const LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Lower back',
  shoulders: 'Shoulders',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  core: 'Core',
  traps: 'Traps',
  lats: 'Lats',
  adductors: 'Adductors',
  neck: 'Neck',
};

export function BodyMap({
  side = 'front',
  selected,
  onToggle,
  heat,
  size = 320,
  base,
  active,
  border,
  color,
}: BodyMapProps): React.JSX.Element {
  const { c } = useTheme();
  const cBase = base ?? c.surfaceAlt;
  const cActive = active ?? c.accent;
  const cBorder = border ?? c.border;
  const cLine = color ?? c.textFaint;

  const groups = side === 'front' ? FRONT_ORDER : BACK_ORDER;
  const paths: Record<string, string> = side === 'front' ? FRONT_PATHS : BACK_PATHS;
  const detail = side === 'front' ? FRONT_DETAIL : BACK_DETAIL;

  const chosen = useMemo(() => new Set<MuscleGroup>(selected ?? []), [selected]);
  const width = (size * VB_W) / VB_H;

  return (
    <Svg width={width} height={size} viewBox={`0 0 ${VB_W} ${VB_H}`}>
      {/* Silhouette — a hairline, never a filled body. */}
      <G>
        <Path
          d={SILHOUETTE}
          fill="none"
          stroke={cLine}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <Path
          d={ARMS}
          fill="none"
          stroke={cLine}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>

      {/* Muscle groups — individually addressable. */}
      <G>
        {groups.map((m) => {
          const key = m as MuscleGroup;
          const isSelected = chosen.has(key);
          const h = clamp01(heat?.[key] ?? 0);
          const lit = isSelected || h > 0;
          const fillOpacity = isSelected ? 1 : h > 0 ? 0.18 + 0.72 * h : 0.9;
          return (
            <Path
              key={m}
              d={paths[m]}
              fill={lit ? cActive : cBase}
              fillOpacity={fillOpacity}
              stroke={isSelected ? cActive : cBorder}
              strokeWidth={isSelected ? 1.4 : 1}
              strokeLinejoin="round"
              onPress={onToggle ? () => onToggle(key) : undefined}
              disabled={!onToggle}
              accessibilityLabel={
                onToggle ? `${LABELS[key]}${isSelected ? ', selected' : ''}` : LABELS[key]
              }
            />
          );
        })}
      </G>

      {/* Anatomy hairlines — decorative, not tappable. */}
      <G opacity={0.55} pointerEvents="none">
        {detail.map((d, i) => (
          <Path
            key={i}
            d={d}
            fill="none"
            stroke={cLine}
            strokeWidth={1}
            strokeLinecap="round"
          />
        ))}
      </G>
    </Svg>
  );
}

export default BodyMap;
