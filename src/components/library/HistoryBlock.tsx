import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Divider, LineChart, StatTile, Text, type ChartPoint } from '@/components/kit';
import type { LoggedSet, PR, Unit } from '@/data/types';
import { Trophy } from '@/icons';
import { bestPRs, dateLabel, describePR, fmtWeight, fmtWeightValue, relative, unitLabel } from '@/lib';
import { hairline, useTheme } from '@/theme';

import type { Performance } from './stats';

export type HistoryPoint = { ts: number; topSet: LoggedSet; e1rm: number; volume: number };

export type HistoryBlockProps = {
  exerciseName: string;
  history: readonly HistoryPoint[];
  prs: readonly PR[];
  performances: readonly Performance[];
  unit: Unit;
};

function setSummary(sets: readonly LoggedSet[], unit: Unit): string {
  return sets.map((s) => `${fmtWeightValue(s.weight, unit)} × ${s.reps}`).join('   ');
}

export function HistoryBlock({
  exerciseName,
  history,
  prs,
  performances,
  unit,
}: HistoryBlockProps) {
  const { c, radius, space } = useTheme();

  const points = useMemo<ChartPoint[]>(
    () => history.map((h) => ({ x: h.ts, y: h.e1rm })),
    [history],
  );

  const best = useMemo(
    () => history.reduce((m, h) => (h.e1rm > m ? h.e1rm : m), 0),
    [history],
  );
  const heaviest = useMemo(
    () => history.reduce<LoggedSet | null>((m, h) => (!m || h.topSet.weight > m.weight ? h.topSet : m), null),
    [history],
  );

  const records = useMemo(() => bestPRs(prs).slice(0, 4), [prs]);

  return (
    <View style={{ gap: space.xl }}>
      <Text variant="label" tone="faint">
        Your history
      </Text>

      <View style={{ flexDirection: 'row', gap: space.md }}>
        <StatTile
          label="Est. max"
          value={fmtWeightValue(best, unit)}
          unit={unitLabel(unit)}
          size="sm"
          style={{ flex: 1 }}
        />
        <StatTile
          label="Heaviest set"
          value={heaviest ? fmtWeightValue(heaviest.weight, unit) : '—'}
          unit={heaviest ? `× ${heaviest.reps}` : undefined}
          size="sm"
          style={{ flex: 1 }}
        />
        <StatTile label="Sessions" value={history.length} size="sm" style={{ flex: 1 }} />
      </View>

      {points.length >= 2 ? (
        <View style={{ gap: space.sm }}>
          <Text variant="small" tone="muted">
            Estimated one-rep max from your top set each session.
          </Text>
          <LineChart
            data={points}
            height={190}
            formatY={(v) => fmtWeight(v, unit)}
            formatX={(v) => dateLabel(v)}
            scrub
          />
        </View>
      ) : null}

      {records.length ? (
        <View
          style={{
            borderRadius: radius.lg,
            borderWidth: hairline,
            borderColor: c.border,
            backgroundColor: c.surface,
            padding: space.lg,
            gap: space.md,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Trophy size={16} color={c.accent} strokeWidth={2} />
            <Text variant="label" tone="faint">
              Records
            </Text>
          </View>
          {records.map((pr, i) => (
            <View key={pr.id} style={{ gap: space.md }}>
              {i > 0 ? <Divider /> : null}
              <View style={{ gap: 2 }}>
                <Text variant="small">{describePR(pr, exerciseName, (kg) => fmtWeight(kg, unit))}</Text>
                <Text variant="small" tone="faint">
                  {relative(pr.ts)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {performances.length ? (
        <View style={{ gap: space.md }}>
          <Text variant="label" tone="faint">
            Last performances
          </Text>
          {performances.map(({ session, sets }, i) => (
            <View key={session.id} style={{ gap: space.md }}>
              {i > 0 ? <Divider /> : null}
              <View style={{ gap: 4, paddingVertical: space.xs }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: space.md,
                  }}
                >
                  <Text variant="small" tone="muted">
                    {dateLabel(session.startedAt)}
                  </Text>
                  <Text variant="small" tone="faint" numeric>
                    {sets.length} sets
                  </Text>
                </View>
                <Text variant="body" numeric>
                  {setSummary(sets, unit)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
