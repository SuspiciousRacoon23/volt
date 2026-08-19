import { finite, maxOf, minOf } from '@/lib/num';

export type ChartPoint = {
  /** Usually a timestamp. Any monotonic number works. */
  x: number;
  y: number;
  /** Optional axis caption. Only the first and last are ever drawn. */
  label?: string;
  /** Marks a record — drawn as a lime dot. */
  record?: boolean;
};

export type Scale = (v: number) => number;

export type Bounds = { minX: number; maxX: number; minY: number; maxY: number };

export function bounds(series: readonly (readonly ChartPoint[])[]): Bounds {
  const xs: number[] = [];
  const ys: number[] = [];
  for (const s of series) {
    for (const p of s) {
      xs.push(finite(p.x));
      ys.push(finite(p.y));
    }
  }
  if (xs.length === 0) return { minX: 0, maxX: 1, minY: 0, maxY: 1 };

  const minX = minOf(xs);
  const maxX = maxOf(xs);
  let minY = minOf(ys);
  let maxY = maxOf(ys);

  // A flat series still needs vertical room, or the line sits on the floor.
  if (maxY === minY) {
    const pad = Math.abs(maxY) > 0 ? Math.abs(maxY) * 0.1 : 1;
    minY -= pad;
    maxY += pad;
  } else {
    // Headroom so the line never touches the frame.
    const pad = (maxY - minY) * 0.12;
    minY -= pad;
    maxY += pad;
  }

  return { minX, maxX: maxX === minX ? minX + 1 : maxX, minY, maxY };
}

export function makeScales(b: Bounds, width: number, height: number, inset: number) {
  const w = Math.max(1, width - inset * 2);
  const h = Math.max(1, height - inset * 2);
  const sx: Scale = (v) => inset + ((finite(v) - b.minX) / (b.maxX - b.minX)) * w;
  const sy: Scale = (v) => inset + h - ((finite(v) - b.minY) / (b.maxY - b.minY)) * h;
  return { sx, sy };
}

/**
 * Catmull-Rom to cubic Bézier. Gentle smoothing — enough to look drawn rather
 * than plotted, not so much that it invents data between points.
 */
export function linePath(
  points: readonly ChartPoint[],
  sx: Scale,
  sy: Scale,
  smoothing = 0.18,
): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${sx(points[0].x)} ${sy(points[0].y)}`;

  const pt = points.map((p) => ({ x: sx(p.x), y: sy(p.y) }));
  let d = `M ${round2(pt[0].x)} ${round2(pt[0].y)}`;

  for (let i = 0; i < pt.length - 1; i++) {
    const p0 = pt[i - 1] ?? pt[i];
    const p1 = pt[i];
    const p2 = pt[i + 1];
    const p3 = pt[i + 2] ?? p2;

    const c1x = p1.x + (p2.x - p0.x) * smoothing;
    const c1y = p1.y + (p2.y - p0.y) * smoothing;
    const c2x = p2.x - (p3.x - p1.x) * smoothing;
    const c2y = p2.y - (p3.y - p1.y) * smoothing;

    d += ` C ${round2(c1x)} ${round2(c1y)}, ${round2(c2x)} ${round2(c2y)}, ${round2(p2.x)} ${round2(p2.y)}`;
  }
  return d;
}

export function areaPath(
  points: readonly ChartPoint[],
  sx: Scale,
  sy: Scale,
  baseY: number,
  smoothing = 0.18,
): string {
  const line = linePath(points, sx, sy, smoothing);
  if (!line || points.length < 2) return '';
  const first = points[0];
  const last = points[points.length - 1];
  return `${line} L ${round2(sx(last.x))} ${round2(baseY)} L ${round2(sx(first.x))} ${round2(baseY)} Z`;
}

export function round2(v: number): number {
  return Math.round(finite(v) * 100) / 100;
}

/** Index of the point nearest an x position in pixels. */
export function nearestIndex(points: readonly ChartPoint[], sx: Scale, px: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < points.length; i++) {
    const d = Math.abs(sx(points[i].x) - px);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/**
 * Index from which the series is improving — the last sustained upturn.
 * Returns -1 when there is nothing worth highlighting, which is the common case.
 */
export function improvingFrom(points: readonly ChartPoint[], minRun = 2): number {
  if (points.length < minRun + 1) return -1;
  let i = points.length - 1;
  while (i > 0 && points[i].y >= points[i - 1].y) i--;
  const runLength = points.length - 1 - i;
  return runLength >= minRun ? i : -1;
}

/** Default numeric formatting for axis captions: compact, never scientific. */
export function fmtAxis(v: number): string {
  const n = finite(v);
  if (Math.abs(n) >= 10000) return `${Math.round(n / 1000)}k`;
  if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}k`;
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}
