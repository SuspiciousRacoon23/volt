/**
 * Anatomical path data for <BodyMap />.
 *
 * The figure is drawn on a 200 x 490 grid, centred on the vertical axis x = 100.
 * Proportions follow a 7.5-head athletic canon:
 *   crown 12 · chin 74 · acromion 98 · nipple 136 · navel 196
 *   crotch 266 · knee 360 · ankle 452 · sole 476
 *
 * Every shape is authored as a LEFT half and mirrored, so the figure is exactly
 * symmetrical and a single <Path> can own both sides of a muscle group.
 */

export const VB_W = 200;
export const VB_H = 490;
const AXIS = 100;

export type Cmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number]
  | ['Z'];

export function toD(cmds: Cmd[]): string {
  let out = '';
  for (const c of cmds) {
    if (c[0] === 'Z') out += 'Z ';
    else if (c[0] === 'M' || c[0] === 'L') out += `${c[0]}${c[1]} ${c[2]} `;
    else out += `C${c[1]} ${c[2]} ${c[3]} ${c[4]} ${c[5]} ${c[6]} `;
  }
  return out.trim();
}

function flip(x: number): number {
  return AXIS * 2 - x;
}

export function mirror(cmds: Cmd[]): Cmd[] {
  return cmds.map((c): Cmd => {
    if (c[0] === 'Z') return ['Z'];
    if (c[0] === 'M' || c[0] === 'L') return [c[0], flip(c[1]), c[2]];
    return ['C', flip(c[1]), c[2], flip(c[3]), c[4], flip(c[5]), c[6]];
  });
}

/** Left half + its mirror as one path string (two subpaths, one hit target). */
export function sym(cmds: Cmd[]): string {
  return `${toD(cmds)} ${toD(mirror(cmds))}`;
}

/* ------------------------------------------------------------------ */
/* Silhouette                                                          */
/* ------------------------------------------------------------------ */

/** Crown → jaw → trapezius → deltoid → ribs → hip → leg → foot → inner leg → crotch. */
const OUTLINE: Cmd[] = [
  ['M', 100, 14],
  ['C', 88, 14, 80, 24, 80, 41],
  ['C', 80, 54, 84, 64, 89, 71],
  ['C', 91, 75, 89, 82, 87, 88],
  ['C', 79, 91, 69, 93, 56, 99],
  ['C', 50, 104, 48, 116, 49, 130],
  ['C', 50, 140, 56, 147, 66, 148],
  ['C', 69, 166, 71, 182, 71, 202],
  ['C', 70, 222, 67, 242, 64, 262],
  ['C', 62, 282, 60, 302, 62, 322],
  ['C', 64, 340, 68, 352, 72, 362],
  ['C', 68, 380, 66, 398, 70, 418],
  ['C', 74, 436, 78, 446, 82, 452],
  ['L', 80, 468],
  ['C', 80, 474, 84, 477, 91, 477],
  ['L', 96, 472],
  ['C', 95, 466, 95, 460, 95, 452],
  ['C', 93, 434, 92, 416, 93, 400],
  ['C', 94, 384, 93, 372, 92, 360],
  ['C', 92, 336, 94, 306, 96, 284],
  ['L', 100, 268],
];

/** Acromion → outer arm → hand → inner arm → armpit. Open contour. */
const ARM: Cmd[] = [
  ['M', 56, 98],
  ['C', 47, 106, 43, 122, 42, 140],
  ['C', 40, 162, 37, 186, 35, 208],
  ['C', 32, 232, 29, 258, 28, 282],
  ['C', 26, 300, 27, 314, 31, 330],
  ['C', 36, 337, 45, 336, 48, 328],
  ['C', 50, 306, 48, 292, 46, 276],
  ['C', 50, 250, 55, 226, 60, 206],
  ['C', 62, 188, 64, 166, 66, 148],
];

export const SILHOUETTE = sym(OUTLINE);
export const ARMS = sym(ARM);

/* ------------------------------------------------------------------ */
/* Muscle groups                                                       */
/* ------------------------------------------------------------------ */

const NECK: Cmd[] = [
  ['M', 87, 82],
  ['C', 86, 90, 91, 97, 95, 101],
  ['L', 100, 101],
  ['L', 100, 82],
  ['Z'],
];

const TRAPS_FRONT: Cmd[] = [
  ['M', 100, 86],
  ['C', 92, 87, 82, 90, 68, 95],
  ['C', 63, 97, 58, 98, 56, 99],
  ['C', 66, 104, 78, 106, 88, 104],
  ['C', 95, 102, 99, 96, 100, 90],
  ['Z'],
];

const DELT: Cmd[] = [
  ['M', 57, 97],
  ['C', 49, 104, 46, 118, 48, 132],
  ['C', 50, 142, 57, 148, 66, 147],
  ['C', 71, 134, 71, 116, 66, 103],
  ['C', 63, 99, 60, 97, 57, 97],
  ['Z'],
];

const CHEST: Cmd[] = [
  ['M', 99, 108],
  ['C', 88, 105, 76, 107, 68, 114],
  ['C', 66, 124, 68, 140, 74, 149],
  ['C', 84, 153, 94, 152, 99, 147],
  ['Z'],
];

const CORE: Cmd[] = [
  ['M', 99, 152],
  ['C', 91, 153, 84, 158, 82, 168],
  ['C', 80, 186, 80, 210, 84, 232],
  ['C', 87, 244, 93, 251, 99, 251],
  ['Z'],
];

const BICEPS: Cmd[] = [
  ['M', 51, 138],
  ['C', 44, 150, 41, 172, 43, 194],
  ['C', 47, 205, 57, 206, 61, 197],
  ['C', 62, 176, 61, 154, 57, 139],
  ['C', 55, 136, 53, 136, 51, 138],
  ['Z'],
];

const TRICEPS: Cmd[] = [
  ['M', 49, 137],
  ['C', 42, 150, 39, 173, 41, 195],
  ['C', 46, 206, 56, 207, 60, 197],
  ['C', 61, 175, 60, 153, 56, 138],
  ['C', 54, 135, 51, 135, 49, 137],
  ['Z'],
];

const FOREARM: Cmd[] = [
  ['M', 44, 212],
  ['C', 38, 228, 33, 254, 31, 278],
  ['C', 34, 290, 43, 289, 47, 279],
  ['C', 51, 254, 54, 232, 55, 214],
  ['C', 52, 208, 47, 207, 44, 212],
  ['Z'],
];

const QUADS: Cmd[] = [
  ['M', 97, 274],
  ['C', 86, 268, 72, 270, 65, 280],
  ['C', 61, 302, 63, 330, 69, 350],
  ['C', 78, 358, 88, 355, 92, 346],
  ['C', 97, 322, 99, 296, 97, 274],
  ['Z'],
];

const ADDUCTORS: Cmd[] = [
  ['M', 99, 272],
  ['C', 94, 275, 90, 292, 89, 316],
  ['C', 91, 328, 96, 327, 98, 316],
  ['C', 100, 296, 100, 282, 99, 272],
  ['Z'],
];

const CALVES_FRONT: Cmd[] = [
  ['M', 74, 366],
  ['C', 67, 382, 65, 402, 70, 422],
  ['C', 76, 431, 86, 429, 89, 419],
  ['C', 91, 398, 88, 378, 84, 364],
  ['Z'],
];

const TRAPS_BACK: Cmd[] = [
  ['M', 100, 86],
  ['C', 92, 86, 80, 89, 66, 95],
  ['C', 62, 97, 58, 98, 56, 99],
  ['C', 70, 108, 83, 128, 92, 150],
  ['C', 95, 156, 98, 160, 100, 161],
  ['Z'],
];

const LATS: Cmd[] = [
  ['M', 67, 152],
  ['C', 62, 174, 66, 194, 78, 208],
  ['C', 86, 216, 92, 218, 97, 216],
  ['L', 98, 158],
  ['C', 88, 150, 75, 146, 67, 152],
  ['Z'],
];

const ERECTORS: Cmd[] = [
  ['M', 98, 198],
  ['C', 91, 202, 86, 210, 85, 222],
  ['C', 85, 236, 90, 246, 97, 252],
  ['L', 100, 252],
  ['L', 100, 198],
  ['Z'],
];

const GLUTES: Cmd[] = [
  ['M', 100, 250],
  ['C', 88, 248, 74, 254, 68, 266],
  ['C', 65, 280, 71, 294, 82, 298],
  ['C', 92, 301, 99, 294, 100, 284],
  ['Z'],
];

const HAMSTRINGS: Cmd[] = [
  ['M', 96, 302],
  ['C', 85, 298, 72, 302, 66, 312],
  ['C', 63, 332, 68, 350, 74, 360],
  ['C', 82, 366, 91, 361, 94, 350],
  ['C', 98, 332, 98, 316, 96, 302],
  ['Z'],
];

const CALVES_BACK: Cmd[] = [
  ['M', 73, 364],
  ['C', 66, 380, 64, 402, 69, 422],
  ['C', 76, 432, 86, 430, 89, 419],
  ['C', 92, 398, 88, 376, 83, 362],
  ['Z'],
];

/* ------------------------------------------------------------------ */
/* Exports keyed by muscle group                                       */
/* ------------------------------------------------------------------ */

export type BodySide = 'front' | 'back';

/** Drawn in order; later shapes sit on top of earlier ones. */
export const FRONT_ORDER = [
  'neck',
  'traps',
  'chest',
  'shoulders',
  'core',
  'biceps',
  'forearms',
  'quads',
  'adductors',
  'calves',
] as const;

export const BACK_ORDER = [
  'lats',
  'traps',
  'back',
  'shoulders',
  'triceps',
  'forearms',
  'glutes',
  'hamstrings',
  'calves',
] as const;

export const FRONT_PATHS: Record<(typeof FRONT_ORDER)[number], string> = {
  neck: sym(NECK),
  traps: sym(TRAPS_FRONT),
  chest: sym(CHEST),
  shoulders: sym(DELT),
  core: sym(CORE),
  biceps: sym(BICEPS),
  forearms: sym(FOREARM),
  quads: sym(QUADS),
  adductors: sym(ADDUCTORS),
  calves: sym(CALVES_FRONT),
};

export const BACK_PATHS: Record<(typeof BACK_ORDER)[number], string> = {
  traps: sym(TRAPS_BACK),
  lats: sym(LATS),
  back: sym(ERECTORS),
  shoulders: sym(DELT),
  triceps: sym(TRICEPS),
  forearms: sym(FOREARM),
  glutes: sym(GLUTES),
  hamstrings: sym(HAMSTRINGS),
  calves: sym(CALVES_BACK),
};

/** Hairline anatomy detail — never interactive. */
export const FRONT_DETAIL: string[] = [
  sym([
    ['M', 92, 101],
    ['C', 86, 105, 78, 107, 70, 106],
  ]),
  'M100 112 L100 150',
  'M100 158 L100 258',
  sym([
    ['M', 86, 178],
    ['L', 100, 178],
  ]),
  sym([
    ['M', 84, 200],
    ['L', 100, 200],
  ]),
  sym([
    ['M', 86, 222],
    ['L', 100, 222],
  ]),
  sym([
    ['M', 78, 358],
    ['C', 82, 366, 88, 366, 91, 360],
  ]),
];

export const BACK_DETAIL: string[] = [
  'M100 92 L100 264',
  sym([
    ['M', 96, 120],
    ['C', 90, 126, 84, 136, 80, 148],
  ]),
  sym([
    ['M', 97, 262],
    ['C', 93, 270, 91, 276, 91, 284],
  ]),
  sym([
    ['M', 78, 356],
    ['C', 82, 364, 88, 364, 91, 358],
  ]),
];
