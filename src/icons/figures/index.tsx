import React from 'react';
import Svg, { Circle as SvgCircle, G, Path } from 'react-native-svg';

import { FIGURE_VB, FIGURES, type FigureDef, type FigureKey } from './defs';

export type { FigureKey, FigureDef };
export { FIGURES, FIGURE_VB };

/* ------------------------------------------------------------------ */
/* Resolution                                                          */
/* ------------------------------------------------------------------ */

const BY_NAME: [RegExp, FigureKey][] = [
  [/pull[-\s]?up|chin[-\s]?up|lat\s?pull/i, 'pullup'],
  [/plank|hollow|dead\s?bug|ab\s?wheel|rollout/i, 'plank'],
  [/lateral\s?raise|side\s?raise|rear\s?delt|reverse\s?(fly|flye)|face\s?pull/i, 'lateral-raise'],
  [/pushdown|press\s?down|skull|tricep|overhead\s?extension|kickback/i, 'pushdown'],
  [/curl/i, 'curl'],
  [/lunge|split\s?squat|step[-\s]?up|bulgarian/i, 'lunge'],
  [/deadlift/i, 'deadlift'],
  [/romanian|rdl|good\s?morning|hip\s?thrust|hinge|back\s?extension/i, 'hip-hinge'],
  [/squat|leg\s?press|hack|pistol/i, 'barbell-squat'],
  [/overhead\s?press|shoulder\s?press|military|push\s?press|arnold|upright\s?row/i, 'overhead-press'],
  [/\brow\b|pulldown|pull[-\s]?over|shrug/i, 'row'],
  [/bench|chest\s?press|floor\s?press|fly|flye|pec\s?deck/i, 'barbell-press'],
  [/push[-\s]?up|dip|sit[-\s]?up|crunch|leg\s?raise|burpee|pull\s?through/i, 'bodyweight'],
  [/cable|band/i, 'cable'],
  [/machine|smith|extension|leg\s?curl|calf\s?raise/i, 'machine'],
];

const BY_MOVEMENT: Record<string, FigureKey> = {
  push: 'overhead-press',
  pull: 'row',
  squat: 'barbell-squat',
  hinge: 'hip-hinge',
  carry: 'generic',
  core: 'plank',
  isolation: 'curl',
};

/** Resolve any exercise to exactly one demonstration figure. */
export function figureFor(opts: { movement: string; equipment: string; name: string }): FigureKey {
  const name = opts.name ?? '';
  for (const [re, key] of BY_NAME) {
    if (re.test(name)) return key;
  }
  switch (opts.equipment) {
    case 'machine':
    case 'smith':
      return 'machine';
    case 'cable':
    case 'band':
      return 'cable';
    case 'bodyweight':
      return 'bodyweight';
    default:
      break;
  }
  return BY_MOVEMENT[opts.movement] ?? 'generic';
}

/* ------------------------------------------------------------------ */
/* Rendering                                                           */
/* ------------------------------------------------------------------ */

export type ExerciseFigureProps = {
  figure: FigureKey;
  size?: number;
  /** Line colour for the athlete and the equipment. */
  color: string;
  /** Direction-of-travel colour. Used for nothing else. */
  accent: string;
};

export function ExerciseFigure({
  figure,
  size = 120,
  color,
  accent,
}: ExerciseFigureProps): React.JSX.Element {
  const def = FIGURES[figure] ?? FIGURES.generic;
  const [hx, hy, hr] = def.head;

  return (
    <Svg
      width={size}
      height={size}
      viewBox={`0 0 ${FIGURE_VB} ${FIGURE_VB}`}
      accessibilityLabel={def.label}>
      {/* Equipment the athlete is supported by. */}
      <G
        opacity={0.5}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none">
        {def.gear?.map((d, i) => (
          <Path key={`g${i}`} d={d} />
        ))}
        {def.gearCircles?.map(([cx, cy, r], i) => (
          <SvgCircle key={`gc${i}`} cx={cx} cy={cy} r={r} />
        ))}
      </G>

      {/* The athlete. */}
      <G
        stroke={color}
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none">
        <SvgCircle cx={hx} cy={hy} r={hr} />
        {def.body.map((d, i) => (
          <Path key={`b${i}`} d={d} />
        ))}
      </G>

      {/* The implement. */}
      <G
        stroke={color}
        strokeWidth={2.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none">
        {def.implement?.map((d, i) => (
          <Path key={`i${i}`} d={d} />
        ))}
        {def.implementCircles?.map(([cx, cy, r], i) => (
          <SvgCircle key={`ic${i}`} cx={cx} cy={cy} r={r} />
        ))}
      </G>

      {/* Direction of travel. */}
      <G
        stroke={accent}
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={def.motionDashed ? '3 5' : undefined}>
        {def.motion.map((d, i) => (
          <Path key={`m${i}`} d={d} />
        ))}
      </G>
    </Svg>
  );
}

export default ExerciseFigure;
