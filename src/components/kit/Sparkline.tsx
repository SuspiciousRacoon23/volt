import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/theme';

import { areaPath, bounds, linePath, makeScales, round2, type ChartPoint } from './chartUtils';

export type SparklineProps = {
  /** Plain numbers in order, or full points if an x spacing matters. */
  data: readonly number[] | readonly ChartPoint[];
  width?: number;
  height?: number;
  /** `accent` only when the sparkline itself represents an improvement. */
  tone?: 'ink' | 'muted' | 'accent';
  strokeWidth?: number;
  /** Dot on the final value. */
  showEnd?: boolean;
  showArea?: boolean;
  style?: StyleProp<ViewStyle>;
};

const INSET = 3;

/** A one-line trend. No axes, no labels — it lives next to a number. */
export function Sparkline({
  data,
  width,
  height = 32,
  tone = 'muted',
  strokeWidth = 1.75,
  showEnd = true,
  showArea = false,
  style,
}: SparklineProps) {
  const { c, radius } = useTheme();
  const [measured, setMeasured] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setMeasured(e.nativeEvent.layout.width);
  }, []);

  const points: ChartPoint[] = useMemo(() => {
    const arr = data as readonly (number | ChartPoint)[];
    return arr
      .map((d, i) => (typeof d === 'number' ? { x: i, y: d } : d))
      .filter((p) => Number.isFinite(p.y));
  }, [data]);

  const w = width ?? measured;
  const b = useMemo(() => bounds([points]), [points]);
  const { sx, sy } = useMemo(() => makeScales(b, w, height, INSET), [b, height, w]);

  const colour = tone === 'accent' ? c.accent : tone === 'ink' ? c.text : c.textFaint;

  if (points.length < 2) {
    return (
      <View
        onLayout={onLayout}
        style={[
          { width: width ?? '100%', height, justifyContent: 'center' },
          style,
        ]}
      >
        <View style={{ height: 2, borderRadius: radius.pill, backgroundColor: c.surfaceAlt }} />
      </View>
    );
  }

  const last = points[points.length - 1];

  return (
    <View onLayout={onLayout} style={[{ width: width ?? '100%', height }, style]}>
      {w > 0 ? (
        <Svg width={w} height={height}>
          {showArea ? (
            <Path d={areaPath(points, sx, sy, height)} fill={colour} fillOpacity={0.1} />
          ) : null}
          <Path
            d={linePath(points, sx, sy)}
            stroke={colour}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {showEnd ? (
            <Circle cx={round2(sx(last.x))} cy={round2(sy(last.y))} r={2.5} fill={colour} />
          ) : null}
        </Svg>
      ) : null}
    </View>
  );
}
