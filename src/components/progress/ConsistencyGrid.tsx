import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/kit';
import type { AppState } from '@/data';
import { DAY_MS, monthLabel, startOfDay, startOfWeek } from '@/lib';
import { hairline, useTheme } from '@/theme';

import { finishedSessions } from './progressData';

const WEEKS = 12;
const ROWS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/** Twelve weeks of days. A day you trained is lime; everything else is quiet. */
export function ConsistencyGrid({ state }: { state: AppState }) {
  const { c, space } = useTheme();

  const { columns, trained, total } = useMemo(() => {
    const days = new Set(finishedSessions(state).map((s) => startOfDay(s.startedAt)));
    const firstMonday = startOfWeek(Date.now()) - (WEEKS - 1) * 7 * DAY_MS;
    const today = startOfDay(Date.now());
    let count = 0;
    const cols = Array.from({ length: WEEKS }, (_, w) => {
      const start = firstMonday + w * 7 * DAY_MS;
      const cells = Array.from({ length: 7 }, (_, d) => {
        const ts = start + d * DAY_MS;
        const did = days.has(ts);
        if (did) count += 1;
        return { ts, did, future: ts > today };
      });
      return { start, cells };
    });
    return { columns: cols, trained: count, total: WEEKS * 7 };
  }, [state]);

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: space.xs + 2 }}>
        <View style={{ gap: 4, justifyContent: 'space-between', paddingRight: 2 }}>
          {ROWS.map((r, i) => (
            <View key={`${r}-${i}`} style={{ height: 14, justifyContent: 'center' }}>
              <Text variant="small" tone="faint" style={{ fontSize: 9, lineHeight: 10 }}>
                {i % 2 === 0 ? r : ''}
              </Text>
            </View>
          ))}
        </View>

        {columns.map((col) => (
          <View key={col.start} style={{ flex: 1, gap: 4 }}>
            {col.cells.map((cell) => (
              <View
                key={cell.ts}
                style={{
                  height: 14,
                  borderRadius: 4,
                  backgroundColor: cell.did ? c.accent : cell.future ? 'transparent' : c.surfaceAlt,
                  borderWidth: cell.future ? hairline : 0,
                  borderColor: c.border,
                }}
              />
            ))}
          </View>
        ))}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: space.md,
        }}
      >
        <Text variant="small" tone="faint">
          {monthLabel(columns[0].start)}
        </Text>
        <Text variant="small" tone="muted" numeric>
          {trained} of {total} days trained
        </Text>
        <Text variant="small" tone="faint">
          {monthLabel(columns[columns.length - 1].start)}
        </Text>
      </View>
    </View>
  );
}
