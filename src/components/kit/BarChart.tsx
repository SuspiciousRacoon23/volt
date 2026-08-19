import React, { useCallback, useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { select as hapticSelect } from '@/lib/haptics';
import { clamp, maxOf } from '@/lib/num';
import { useTheme } from '@/theme';

import { Text } from './Text';
import { fmtAxis, round2 } from './chartUtils';

export type BarDatum = {
  label: string;
  value: number;
  /** Lime. Reserve it for a record week or a genuine improvement. */
  highlight?: boolean;
};

export type BarChartProps = {
  data: readonly BarDatum[];
  height?: number;
  formatValue?: (v: number) => string;
  /** Fix the scale — useful when two charts must be comparable. */
  maxValue?: number;
  /** Faint dashed line across the chart, e.g. an average or a goal. */
  reference?: number;
  referenceLabel?: string;
  /** Tap a bar to read it. */
  selectable?: boolean;
  onSelect?: (datum: BarDatum | null, index: number) => void;
  emptyLabel?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** Vertical bars with soft caps. No axes, no gridlines, one optional reference. */
export function BarChart({
  data,
  height = 160,
  formatValue = fmtAxis,
  maxValue,
  reference,
  referenceLabel,
  selectable = true,
  onSelect,
  emptyLabel = 'No data yet',
  style,
  testID,
}: BarChartProps) {
  const { c, radius, space } = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const values = useMemo(() => data.map((d) => d.value), [data]);
  const top = Math.max(maxValue ?? 0, maxOf(values, 1), reference ?? 0, 1);

  const n = data.length;
  const gap = n > 14 ? 3 : n > 8 ? 5 : 8;
  const barW = n > 0 && width > 0 ? Math.max(3, (width - gap * (n - 1)) / n) : 0;

  const handleTouch = useCallback(
    (e: GestureResponderEvent) => {
      if (!selectable || n === 0 || width === 0) return;
      const i = clamp(Math.floor(e.nativeEvent.locationX / (barW + gap)), 0, n - 1);
      setSelected((prev) => {
        if (prev !== i) hapticSelect();
        return i;
      });
      onSelect?.(data[i] ?? null, i);
    },
    [barW, data, gap, n, onSelect, selectable, width],
  );

  const endTouch = useCallback(() => {
    setSelected(null);
    onSelect?.(null, -1);
  }, [onSelect]);

  if (n === 0) {
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

  const plotH = height - 6;
  const active = selected !== null ? data[selected] : null;
  const showEveryLabel = n <= 8;

  return (
    <View style={style} testID={testID}>
      <View
        onLayout={onLayout}
        style={{ height }}
        onStartShouldSetResponder={() => selectable}
        onMoveShouldSetResponder={() => selectable}
        onResponderGrant={handleTouch}
        onResponderMove={handleTouch}
        onResponderRelease={endTouch}
        onResponderTerminate={endTouch}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {typeof reference === 'number' && reference > 0 ? (
              <Line
                x1={0}
                y1={round2(plotH - (reference / top) * plotH)}
                x2={width}
                y2={round2(plotH - (reference / top) * plotH)}
                stroke={c.borderStrong}
                strokeWidth={1}
                strokeDasharray="3 5"
              />
            ) : null}

            {data.map((d, i) => {
              const h = Math.max(2, (clamp(d.value, 0, top) / top) * plotH);
              const x = i * (barW + gap);
              const isActive = selected === i;
              return (
                <Rect
                  key={`${d.label}-${i}`}
                  x={round2(x)}
                  y={round2(plotH - h)}
                  width={round2(barW)}
                  height={round2(h)}
                  rx={Math.min(barW / 2, 5)}
                  fill={d.highlight ? c.accent : c.text}
                  fillOpacity={d.highlight ? 1 : isActive ? 0.95 : 0.28}
                />
              );
            })}
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
          gap: space.sm,
        }}
      >
        {showEveryLabel && !active ? (
          <View style={{ flex: 1, flexDirection: 'row', gap }}>
            {data.map((d, i) => (
              <View key={`l-${i}`} style={{ width: barW, alignItems: 'center' }}>
                <Text variant="small" tone="faint" numberOfLines={1}>
                  {d.label}
                </Text>
              </View>
            ))}
          </View>
        ) : active ? (
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'baseline', gap: space.sm }}>
            <Text variant="small" weight="700" numeric>
              {formatValue(active.value)}
            </Text>
            <Text variant="small" tone="faint">
              {active.label}
            </Text>
          </View>
        ) : (
          <>
            <Text variant="small" tone="faint">
              {data[0].label}
            </Text>
            <Text variant="small" tone="faint">
              {data[n - 1].label}
            </Text>
          </>
        )}

        {referenceLabel && !active ? (
          <Text variant="small" tone="faint">
            {referenceLabel}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
