import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { select as hapticSelect } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { Text } from './Text';
import {
  areaPath,
  bounds,
  fmtAxis,
  improvingFrom,
  linePath,
  makeScales,
  nearestIndex,
  round2,
  type ChartPoint,
} from './chartUtils';

export type { ChartPoint };

export type LineChartProps = {
  data: readonly ChartPoint[];
  /** A second, quieter series — last month, a bodyweight trend, a target. */
  compare?: readonly ChartPoint[];
  height?: number;
  /** Format for the scrubber read-out and the y captions. */
  formatY?: (v: number) => string;
  /** Format for the x captions under the chart. */
  formatX?: (v: number) => string;
  /**
   * Index from which the line turns lime. Omit to detect the last sustained
   * upturn automatically; pass `null` to never highlight.
   */
  highlightFrom?: number | null;
  /** Draw a faint fill under the line. */
  showArea?: boolean;
  /** Drag across the chart to read a value. */
  scrub?: boolean;
  onScrub?: (point: ChartPoint | null, index: number) => void;
  /** Shown instead of the chart when there is nothing to plot. */
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const INSET = 14;

/**
 * Editorial line chart. Black line, grey comparison, lime only where the data
 * is actually improving. No gridlines.
 */
export function LineChart({
  data,
  compare,
  height = 180,
  formatY = fmtAxis,
  formatX,
  highlightFrom,
  showArea = false,
  scrub = true,
  onScrub,
  emptyLabel = 'No data yet',
  style,
  testID,
}: LineChartProps) {
  const { c, radius, space } = useTheme();
  const [width, setWidth] = useState(0);
  const [cursor, setCursor] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const points = useMemo(() => data.filter((p) => Number.isFinite(p.y)), [data]);
  const comparePoints = useMemo(
    () => (compare ?? []).filter((p) => Number.isFinite(p.y)),
    [compare],
  );

  const b = useMemo(() => bounds([points, comparePoints]), [comparePoints, points]);
  const { sx, sy } = useMemo(
    () => makeScales(b, width, height, INSET),
    [b, height, width],
  );

  const hlIndex = useMemo(() => {
    if (highlightFrom === null) return -1;
    if (typeof highlightFrom === 'number') return highlightFrom;
    return improvingFrom(points);
  }, [highlightFrom, points]);

  const mainPath = useMemo(() => linePath(points, sx, sy), [points, sx, sy]);
  const cmpPath = useMemo(() => linePath(comparePoints, sx, sy), [comparePoints, sx, sy]);
  const hlPath = useMemo(
    () => (hlIndex >= 0 && hlIndex < points.length - 1 ? linePath(points.slice(hlIndex), sx, sy) : ''),
    [hlIndex, points, sx, sy],
  );
  const fillPath = useMemo(
    () => (showArea ? areaPath(points, sx, sy, height - INSET / 2) : ''),
    [height, points, showArea, sx, sy],
  );

  const handleTouch = useCallback(
    (e: GestureResponderEvent) => {
      if (!scrub || points.length === 0 || width === 0) return;
      const i = nearestIndex(points, sx, e.nativeEvent.locationX);
      setCursor((prev) => {
        if (prev !== i) hapticSelect();
        return i;
      });
      onScrub?.(points[i] ?? null, i);
    },
    [onScrub, points, scrub, sx, width],
  );

  const endTouch = useCallback(() => {
    setCursor(null);
    onScrub?.(null, -1);
  }, [onScrub]);

  if (points.length === 0) {
    return (
      <View
        testID={testID}
        style={[
          {
            height,
            borderRadius: radius.md,
            backgroundColor: c.surfaceAlt,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
        ]}
      >
        <Text variant="small" tone="faint">
          {emptyLabel}
        </Text>
      </View>
    );
  }

  const last = points[points.length - 1];
  const active = cursor !== null ? points[cursor] : null;
  const firstLabel = points[0].label ?? (formatX ? formatX(points[0].x) : undefined);
  const lastLabel = last.label ?? (formatX ? formatX(last.x) : undefined);

  return (
    <View style={style} testID={testID}>
      <View
        onLayout={onLayout}
        style={{ height }}
        onStartShouldSetResponder={() => scrub}
        onMoveShouldSetResponder={() => scrub}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={endTouch}
        onResponderTerminate={endTouch}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {fillPath ? <Path d={fillPath} fill={c.surfaceAlt} /> : null}

            {cmpPath ? (
              <Path
                d={cmpPath}
                stroke={c.textFaint}
                strokeWidth={1.5}
                strokeDasharray="4 5"
                strokeLinecap="round"
                fill="none"
              />
            ) : null}

            <Path
              d={mainPath}
              stroke={c.text}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />

            {hlPath ? (
              <Path
                d={hlPath}
                stroke={c.accent}
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            ) : null}

            {points.map((p, i) =>
              p.record ? (
                <Circle
                  key={`r-${i}`}
                  cx={round2(sx(p.x))}
                  cy={round2(sy(p.y))}
                  r={4.5}
                  fill={c.accent}
                  stroke={c.bg}
                  strokeWidth={2}
                />
              ) : null,
            )}

            <Circle
              cx={round2(sx(last.x))}
              cy={round2(sy(last.y))}
              r={3.5}
              fill={hlIndex >= 0 ? c.accent : c.text}
              stroke={c.bg}
              strokeWidth={2}
            />

            {active ? (
              <>
                <Line
                  x1={round2(sx(active.x))}
                  y1={INSET / 2}
                  x2={round2(sx(active.x))}
                  y2={height - INSET / 2}
                  stroke={c.borderStrong}
                  strokeWidth={1}
                />
                <Circle
                  cx={round2(sx(active.x))}
                  cy={round2(sy(active.y))}
                  r={5}
                  fill={c.text}
                  stroke={c.bg}
                  strokeWidth={2.5}
                />
              </>
            ) : null}
          </Svg>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space.sm,
          minHeight: 18,
        }}
      >
        <Text variant="small" tone="faint" numeric>
          {firstLabel ?? ''}
        </Text>

        {active ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              gap: space.sm,
              paddingHorizontal: space.md,
              paddingVertical: 2,
              borderRadius: radius.pill,
              backgroundColor: c.surfaceAlt,
              borderWidth: hairline,
              borderColor: c.border,
            }}
          >
            <Text variant="small" weight="700" numeric>
              {formatY(active.y)}
            </Text>
            {active.label ? (
              <Text variant="small" tone="faint">
                {active.label}
              </Text>
            ) : null}
          </View>
        ) : null}

        <Text variant="small" tone="faint" numeric>
          {lastLabel ?? ''}
        </Text>
      </View>
    </View>
  );
}
