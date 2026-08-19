import React, { useCallback, useMemo, useState } from 'react';
import { LayoutChangeEvent, View, type GestureResponderEvent } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { Text } from '@/components/kit';
import { clamp, maxOf } from '@/lib';
import { useTheme } from '@/theme';

export type CompareDatum = { label: string; value: number; previous: number };

/**
 * Paired bars: the previous period sits behind in grey, the current period in
 * front in ink. Lime appears once at most — on the latest bar, and only when
 * it beats the same slot in the period before.
 */
export function CompareBars({
  data,
  height = 168,
  formatValue,
  currentLabel,
  previousLabel,
}: {
  data: readonly CompareDatum[];
  height?: number;
  formatValue: (v: number) => string;
  currentLabel: string;
  previousLabel: string;
}) {
  const { c, radius, space } = useTheme();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  const onLayout = useCallback((e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width), []);

  const n = data.length;
  const top = useMemo(
    () => Math.max(1, maxOf(data.flatMap((d) => [d.value, d.previous]), 1)),
    [data],
  );

  const gap = n > 10 ? 5 : 8;
  const slot = n > 0 && width > 0 ? (width - gap * (n - 1)) / n : 0;
  const backW = Math.max(3, slot);
  const frontW = Math.max(3, slot * 0.56);

  const improvedIndex = useMemo(() => {
    const last = n - 1;
    if (last < 0) return -1;
    const d = data[last];
    return d.value > 0 && d.previous > 0 && d.value > d.previous ? last : -1;
  }, [data, n]);

  const handle = useCallback(
    (e: GestureResponderEvent) => {
      if (n === 0 || slot === 0) return;
      setSelected(clamp(Math.floor(e.nativeEvent.locationX / (slot + gap)), 0, n - 1));
    },
    [gap, n, slot],
  );

  const plotH = height - 6;
  const active = selected !== null ? data[selected] : null;

  if (n === 0) {
    return (
      <View
        style={{
          height,
          borderRadius: radius.md,
          backgroundColor: c.surfaceAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text variant="small" tone="faint">
          No volume logged yet
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View
        onLayout={onLayout}
        style={{ height }}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handle}
        onResponderMove={handle}
        onResponderRelease={() => setSelected(null)}
        onResponderTerminate={() => setSelected(null)}
      >
        {width > 0 ? (
          <Svg width={width} height={height}>
            {data.map((d, i) => {
              const x = i * (slot + gap);
              const hPrev = Math.max(2, (clamp(d.previous, 0, top) / top) * plotH);
              const hNow = Math.max(2, (clamp(d.value, 0, top) / top) * plotH);
              const lime = i === improvedIndex;
              return (
                <React.Fragment key={d.label}>
                  <Rect
                    x={x}
                    y={plotH - hPrev}
                    width={backW}
                    height={hPrev}
                    rx={Math.min(backW / 2, 5)}
                    fill={c.textFaint}
                    fillOpacity={0.3}
                  />
                  <Rect
                    x={x + (backW - frontW) / 2}
                    y={plotH - hNow}
                    width={frontW}
                    height={hNow}
                    rx={Math.min(frontW / 2, 4)}
                    fill={lime ? c.accent : c.text}
                    fillOpacity={lime ? 1 : selected === i ? 1 : 0.85}
                  />
                </React.Fragment>
              );
            })}
          </Svg>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: space.sm,
          marginTop: space.sm,
          minHeight: 18,
        }}
      >
        {active ? (
          <>
            <Text variant="small" weight="700" numeric>
              {formatValue(active.value)}
            </Text>
            <Text variant="small" tone="faint" numeric>
              {active.label} · was {formatValue(active.previous)}
            </Text>
          </>
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
      </View>

      <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.sm }}>
        <Legend colour={c.text} label={currentLabel} />
        <Legend colour={c.textFaint} label={previousLabel} />
      </View>
    </View>
  );
}

function Legend({ colour, label }: { colour: string; label: string }) {
  const { space } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs + 2 }}>
      <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: colour }} />
      <Text variant="small" tone="faint">
        {label}
      </Text>
    </View>
  );
}
