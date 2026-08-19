/**
 * Line-art demonstration figures. One 120 x 120 grid, one line weight family.
 *
 * `body`      the athlete (heaviest weight)
 * `gear`      bench, floor, frame, cable column (lighter)
 * `implement` the bar, dumbbell or handle being moved
 * `motion`    ACCENT ONLY — a single arc or arrow showing the direction of travel
 */

export type FigureKey =
  | 'barbell-press'
  | 'barbell-squat'
  | 'deadlift'
  | 'pullup'
  | 'row'
  | 'overhead-press'
  | 'lunge'
  | 'curl'
  | 'pushdown'
  | 'plank'
  | 'lateral-raise'
  | 'hip-hinge'
  | 'machine'
  | 'cable'
  | 'bodyweight'
  | 'generic';

export type Circle = [cx: number, cy: number, r: number];

export type FigureDef = {
  label: string;
  head: Circle;
  body: string[];
  gear?: string[];
  gearCircles?: Circle[];
  implement?: string[];
  implementCircles?: Circle[];
  motion: string[];
  /** Dashed motion reads as an alignment guide rather than a direction. */
  motionDashed?: boolean;
};

export const FIGURE_VB = 120;

export const FIGURES: Record<FigureKey, FigureDef> = {
  'barbell-press': {
    label: 'Barbell bench press',
    head: [26, 74, 7],
    body: ['M33 78 H72', 'M72 78 L84 92 L84 106', 'M78 106 H90', 'M44 76 L44 62 L46 50'],
    gear: ['M22 84 H82 V90 H22 Z', 'M30 90 L26 106', 'M74 90 L78 106'],
    implement: ['M24 48 H68', 'M28 40 V56', 'M32 42 V54', 'M60 40 V56', 'M64 42 V54'],
    motion: ['M92 68 V44', 'M88 50 L92 42 L96 50'],
  },
  'barbell-squat': {
    label: 'Barbell back squat',
    head: [44, 28, 8],
    body: [
      'M50 36 L62 62',
      'M62 62 L44 80 L48 102',
      'M62 62 L52 82 L56 102',
      'M40 102 H56',
      'M50 102 H66',
      'M54 44 L40 48',
      'M54 44 L68 46',
    ],
    implement: ['M26 46 H84', 'M30 36 V56', 'M34 39 V53', 'M76 36 V56', 'M80 39 V53'],
    motion: ['M96 86 V58', 'M92 64 L96 56 L100 64'],
  },
  deadlift: {
    label: 'Deadlift',
    head: [42, 32, 8],
    body: [
      'M48 40 L66 60',
      'M66 60 L60 84 L62 104',
      'M66 60 L72 84 L72 104',
      'M56 104 H74',
      'M50 46 L48 82',
    ],
    gear: ['M18 108 H104'],
    implement: ['M26 86 H74'],
    implementCircles: [
      [36, 86, 12],
      [64, 86, 12],
    ],
    motion: ['M90 84 V58', 'M86 64 L90 56 L94 64'],
  },
  pullup: {
    label: 'Pull-up',
    head: [60, 36, 8],
    body: [
      'M50 22 L52 44',
      'M70 22 L68 44',
      'M60 46 L60 74',
      'M60 74 L54 92 L56 106',
      'M60 74 L68 92 L66 106',
    ],
    gear: ['M22 20 H98'],
    motion: ['M92 62 V34', 'M88 40 L92 32 L96 40'],
  },
  row: {
    label: 'Bent-over row',
    head: [38, 44, 8],
    body: [
      'M44 50 L72 62',
      'M72 62 L70 86 L72 106',
      'M64 106 H80',
      'M48 54 L50 76 L52 84',
    ],
    gear: ['M18 108 H104'],
    implement: ['M32 86 H70'],
    implementCircles: [
      [40, 86, 9],
      [62, 86, 9],
    ],
    motion: ['M88 94 V70', 'M84 76 L88 68 L92 76'],
  },
  'overhead-press': {
    label: 'Overhead press',
    head: [60, 38, 8],
    body: [
      'M60 46 L60 74',
      'M60 74 L52 94 L52 108',
      'M60 74 L68 94 L68 108',
      'M46 108 H58',
      'M62 108 H74',
      'M54 50 L44 34 L46 24',
      'M66 50 L76 34 L74 24',
    ],
    implement: ['M30 22 H90', 'M34 12 V32', 'M38 15 V29', 'M82 12 V32', 'M86 15 V29'],
    motion: ['M102 50 V24', 'M98 30 L102 22 L106 30'],
  },
  lunge: {
    label: 'Split lunge',
    head: [50, 26, 8],
    body: [
      'M52 34 L56 62',
      'M56 62 L74 80 L74 102',
      'M56 62 L40 84 L32 100',
      'M68 102 H82',
      'M28 100 H38',
      'M52 44 L46 66',
      'M58 44 L64 66',
    ],
    implement: ['M42 66 H50', 'M60 66 H68'],
    motion: ['M92 54 V80', 'M88 74 L92 82 L96 74'],
  },
  curl: {
    label: 'Curl',
    head: [48, 26, 8],
    body: [
      'M52 34 L54 68',
      'M54 68 L46 90 L46 106',
      'M54 68 L62 90 L62 106',
      'M40 106 H52',
      'M56 106 H68',
      'M54 44 L58 66 L70 54',
    ],
    implement: ['M66 48 L76 58'],
    motion: ['M62 78 C64 68 66 60 72 56', 'M67 52 L75 55 L70 62'],
  },
  pushdown: {
    label: 'Cable pushdown',
    head: [54, 30, 8],
    body: [
      'M56 38 L56 68',
      'M56 68 L48 90 L48 106',
      'M56 68 L64 90 L64 106',
      'M42 106 H54',
      'M58 106 H70',
      'M60 44 L66 58 L74 48',
    ],
    gear: ['M104 12 V110', 'M104 22 L74 46'],
    gearCircles: [[104, 18, 4]],
    implement: ['M68 46 H80'],
    motion: ['M86 58 V80', 'M82 74 L86 82 L90 74'],
  },
  plank: {
    label: 'Plank',
    head: [26, 66, 7],
    body: ['M33 70 L92 86', 'M36 72 L32 90 L50 92', 'M92 86 L102 96', 'M98 96 H106'],
    gear: ['M16 100 H106'],
    motion: ['M28 60 L104 82'],
    motionDashed: true,
  },
  'lateral-raise': {
    label: 'Lateral raise',
    head: [60, 26, 8],
    body: [
      'M60 34 L60 66',
      'M60 66 L52 88 L52 106',
      'M60 66 L68 88 L68 106',
      'M46 106 H58',
      'M62 106 H74',
      'M54 44 L40 46 L28 46',
      'M66 44 L80 46 L92 46',
    ],
    implement: ['M24 40 V52', 'M96 40 V52'],
    motion: ['M24 70 C20 58 22 50 28 45', 'M24 41 L29 45 L23 50'],
  },
  'hip-hinge': {
    label: 'Hip hinge',
    head: [36, 42, 8],
    body: [
      'M42 48 L70 62',
      'M70 62 L68 86 L70 106',
      'M62 106 H78',
      'M46 52 L48 78',
    ],
    gear: ['M18 108 H104'],
    implement: ['M38 80 H60'],
    motion: ['M80 60 H98', 'M92 55 L100 60 L92 65'],
  },
  machine: {
    label: 'Machine press',
    head: [56, 46, 7],
    body: [
      'M60 54 L78 72',
      'M78 72 L56 80 L52 100',
      'M46 100 H58',
      'M62 56 L54 50 L50 44',
    ],
    gear: ['M92 22 V106', 'M46 106 H100', 'M52 84 H84', 'M84 84 L86 56'],
    implement: ['M92 26 L50 34', 'M50 30 V48'],
    motion: ['M40 66 H24', 'M30 60 L22 66 L30 72'],
  },
  cable: {
    label: 'Cable',
    head: [50, 32, 8],
    body: [
      'M52 40 L52 70',
      'M52 70 L44 92 L44 108',
      'M52 70 L60 92 L60 108',
      'M38 108 H50',
      'M54 108 H66',
      'M56 46 L64 50 L72 48',
    ],
    gear: ['M104 12 V110', 'M104 34 L72 48'],
    gearCircles: [[104, 30, 4]],
    motion: ['M80 62 C76 70 70 74 62 74', 'M67 69 L61 74 L67 79'],
  },
  bodyweight: {
    label: 'Push-up',
    head: [24, 62, 7],
    body: ['M31 66 L96 84', 'M34 68 L34 94', 'M96 84 L104 92', 'M100 92 H108'],
    gear: ['M14 98 H108'],
    motion: ['M62 62 V44', 'M58 50 L62 42 L66 50'],
  },
  generic: {
    label: 'Movement',
    head: [60, 26, 9],
    body: [
      'M60 36 L60 68',
      'M60 44 L48 62 L44 76',
      'M60 44 L72 62 L76 76',
      'M60 68 L50 90 L50 108',
      'M60 68 L70 90 L70 108',
      'M44 108 H56',
      'M64 108 H76',
    ],
    motion: ['M92 48 C102 60 102 78 92 90', 'M87 85 L93 91 L86 94'],
  },
};
