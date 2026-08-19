import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, EmptyState, LineChart, StatTile, Text, type ChartPoint } from '@/components/kit';
import type { AppState } from '@/data';
import { Body, Plus } from '@/icons';
import { dateLabel, dayKey, fmtBodyweight, toTs, unitLabel } from '@/lib';
import { useTheme } from '@/theme';

import { BodyEntrySheet } from './BodyEntrySheet';
import { MeasurementsTable } from './MeasurementsTable';
import { Headline, Section } from './PanelKit';
import { PhotoShelf } from './PhotoShelf';
import { bodyEntries, measurementRows, pickHeadline } from './progressData';

export function BodyPanel({ state }: { state: AppState }) {
  const { space } = useTheme();
  const unit = state.settings.unit;
  const [sheetOpen, setSheetOpen] = useState(false);

  const entries = useMemo(() => bodyEntries(state), [state]);
  const latest = entries.length ? entries[entries.length - 1] : null;
  const todayKey = useMemo(() => dayKey(), []);

  const weightPoints: ChartPoint[] = useMemo(
    () =>
      entries
        .filter((e) => typeof e.weightKg === 'number' && e.weightKg > 0)
        .map((e) => ({ x: toTs(e.date), y: Number(e.weightKg), label: dateLabel(e.date) })),
    [entries],
  );

  const fatPoints: ChartPoint[] = useMemo(
    () =>
      entries
        .filter((e) => typeof e.bodyFat === 'number' && e.bodyFat > 0)
        .map((e) => ({ x: toTs(e.date), y: Number(e.bodyFat), label: dateLabel(e.date) })),
    [entries],
  );

  const rows = useMemo(() => measurementRows(entries), [entries]);

  const todayEntry = useMemo(
    () => entries.find((e) => e.date === todayKey) ?? null,
    [entries, todayKey],
  );

  const weightDelta =
    weightPoints.length >= 2
      ? weightPoints[weightPoints.length - 1].y - weightPoints[0].y
      : null;

  const headline = pickHeadline(
    state,
    ['bodyweight'],
    latest?.weightKg
      ? `You last weighed in at ${fmtBodyweight(latest.weightKg, unit)}.`
      : 'Record a weigh-in and your body trend starts here.',
  );

  return (
    <View>
      <Headline caption="Body" text={headline} />

      <Button
        label={todayEntry ? 'Update today’s entry' : 'Add an entry'}
        icon={Plus}
        variant="primary"
        fullWidth
        onPress={() => setSheetOpen(true)}
      />

      {entries.length === 0 ? (
        <View style={{ marginTop: space.xl }}>
          <EmptyState
            icon={Body}
            title="Nothing recorded yet"
            body="Bodyweight, body fat and girths live here. One entry is enough to start a line."
          />
        </View>
      ) : (
        <>
          <Section title="Bodyweight">
            {weightPoints.length < 2 ? (
              <Card padding={space.lg}>
                <Text variant="small" tone="muted">
                  One weigh-in so far. A second gives this a trend.
                </Text>
              </Card>
            ) : (
              <Card padding={space.lg}>
                <LineChart
                  data={weightPoints}
                  height={180}
                  highlightFrom={null}
                  formatY={(v) => fmtBodyweight(v, unit)}
                />
              </Card>
            )}
          </Section>

          <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
            <StatTile
              label="Current"
              value={latest?.weightKg ? fmtBodyweight(latest.weightKg, unit).replace(` ${unitLabel(unit)}`, '') : '—'}
              unit={latest?.weightKg ? unitLabel(unit) : undefined}
              delta={
                weightDelta !== null && Math.abs(weightDelta) >= 0.1
                  ? `${weightDelta > 0 ? '+' : '−'}${fmtBodyweight(Math.abs(weightDelta), unit)}`
                  : undefined
              }
              deltaTone="flat"
              footnote={latest ? `logged ${dateLabel(latest.date)}` : undefined}
            />
            <StatTile
              label="Body fat"
              value={latest?.bodyFat ? latest.bodyFat.toFixed(1) : '—'}
              unit={latest?.bodyFat ? '%' : undefined}
              footnote={`${fatPoints.length} ${fatPoints.length === 1 ? 'reading' : 'readings'}`}
            />
          </View>

          <Section title="Body fat">
            {fatPoints.length < 2 ? (
              <Card padding={space.lg}>
                <Text variant="small" tone="muted">
                  Not enough body-fat readings to plot. Two or more draws a line.
                </Text>
              </Card>
            ) : (
              <Card padding={space.lg}>
                <LineChart
                  data={fatPoints}
                  height={160}
                  highlightFrom={null}
                  formatY={(v) => `${v.toFixed(1)}%`}
                />
              </Card>
            )}
          </Section>

          <Section title="Measurements">
            <Card padding={space.lg}>
              <MeasurementsTable rows={rows} />
            </Card>
          </Section>
        </>
      )}

      <Section title="Progress photos · private">
        <PhotoShelf entries={entries} />
      </Section>

      <BodyEntrySheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        latest={latest}
        today={todayEntry}
        unit={unit}
      />
    </View>
  );
}
