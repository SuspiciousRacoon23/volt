import React from 'react';
import { View } from 'react-native';

import { Text } from '@/components/kit';
import { dateLabel } from '@/lib';
import { hairline, useTheme } from '@/theme';

import { MEASUREMENT_LABELS, type MeasurementRow } from './progressData';

/** Latest girths with the change since the entry before. Centimetres. */
export function MeasurementsTable({ rows }: { rows: readonly MeasurementRow[] }) {
  const { c, space } = useTheme();

  if (rows.length === 0) {
    return (
      <Text variant="small" tone="muted">
        No measurements recorded yet. Add an entry to start a baseline.
      </Text>
    );
  }

  return (
    <View>
      {rows.map((r, i) => (
        <View
          key={r.key}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.md,
            minHeight: 48,
            paddingVertical: space.sm,
            borderTopWidth: i === 0 ? 0 : hairline,
            borderTopColor: c.border,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="body" weight="600">
              {MEASUREMENT_LABELS[r.key]}
            </Text>
            <Text variant="small" tone="faint">
              {dateLabel(r.when)}
            </Text>
          </View>

          <Text variant="h2" numeric>
            {r.latest % 1 === 0 ? r.latest : r.latest.toFixed(1)}
          </Text>
          <Text variant="small" tone="faint">
            cm
          </Text>

          <View style={{ width: 62, alignItems: 'flex-end' }}>
            <Text variant="small" tone={r.delta === null || r.delta === 0 ? 'faint' : 'muted'} numeric weight="700">
              {r.delta === null
                ? '—'
                : r.delta === 0
                  ? '0.0'
                  : `${r.delta > 0 ? '+' : '−'}${Math.abs(r.delta).toFixed(1)}`}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
