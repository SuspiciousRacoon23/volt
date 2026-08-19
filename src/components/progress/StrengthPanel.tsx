import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Card,
  EmptyState,
  LineChart,
  StatTile,
  Text,
  type ChartPoint,
} from '@/components/kit';
import { prsForExercise, type AppState, type ID } from '@/data';
import { Barbell, Chart, ChevronDown, Trophy } from '@/icons';
import {
  DAY_MS,
  dateLabel,
  fmtPct,
  fmtWeight,
  fmtWeightValue,
  pctChange,
  relative,
  unitLabel,
} from '@/lib';
import { hairline, useTheme } from '@/theme';

import { ExercisePicker } from './ExercisePicker';
import { Headline, RangeSwitch, Section } from './PanelKit';
import { allSetsFor, pickHeadline, repMaxRows, strengthSeries, trainedRanking } from './progressData';

type Range = '8w' | '6m' | 'all';

const RANGES = [
  { value: '8w' as const, label: '8w' },
  { value: '6m' as const, label: '6m' },
  { value: 'all' as const, label: 'All' },
];

const SPAN: Record<Range, number> = { '8w': 56 * DAY_MS, '6m': 183 * DAY_MS, all: Infinity };

const PR_LABEL: Record<string, string> = {
  weight: 'Heaviest set',
  reps: 'Most reps',
  e1rm: 'Estimated max',
  volume: 'Most volume',
};

export function StrengthPanel({ state }: { state: AppState }) {
  const { c, radius, space } = useTheme();
  const unit = state.settings.unit;

  const ranking = useMemo(() => trainedRanking(state), [state]);
  const [picked, setPicked] = useState<ID | null>(null);
  const [range, setRange] = useState<Range>('8w');
  const [pickerOpen, setPickerOpen] = useState(false);

  const exerciseId = picked && state.exercises[picked] ? picked : (ranking[0]?.id ?? null);
  const exercise = exerciseId ? state.exercises[exerciseId] : null;

  const series = useMemo(
    () => (exerciseId ? strengthSeries(state, exerciseId) : []),
    [exerciseId, state],
  );

  const inRange = useMemo(() => {
    if (range === 'all') return series;
    const from = Date.now() - SPAN[range];
    return series.filter((p) => p.ts >= from);
  }, [range, series]);

  const points: ChartPoint[] = useMemo(() => {
    const lastRecord = inRange.reduce((acc, p, i) => (p.record ? i : acc), -1);
    return inRange.map((p, i) => ({
      x: p.ts,
      y: p.e1rm,
      label: dateLabel(p.ts),
      record: i === lastRecord,
    }));
  }, [inRange]);

  const prs = useMemo(() => (exerciseId ? prsForExercise(state, exerciseId) : []), [exerciseId, state]);
  const current = series.length ? series[series.length - 1].e1rm : 0;
  const rows = useMemo(
    () => (exerciseId ? repMaxRows(allSetsFor(state, exerciseId), current) : []),
    [current, exerciseId, state],
  );

  const change = inRange.length >= 2 ? pctChange(inRange[0].e1rm, inRange[inRange.length - 1].e1rm) : 0;

  // The headline sits directly above the lift picker and the chart, so it must
  // describe the SELECTED lift — a global insight about a different exercise
  // reads as a caption for this one.
  const rangeLabel = range === 'all' ? 'all time' : range === '8w' ? 'the last 8 weeks' : 'the last 6 months';
  const headline = useMemo(() => {
    if (!exercise || current <= 0) {
      return pickHeadline(
        state,
        ['strength-up', 'strength-down', 'prs', 'heaviest'],
        'Log a few working sets and your strength trend will appear here.',
      );
    }
    const name = exercise.name.toLowerCase();
    // Bodyweight lifts store ADDED load only, so a percentage of it overstates
    // the change in what was actually moved. Report the load instead.
    if (exercise.equipment === 'bodyweight') {
      return `Your ${name} is carrying ${fmtWeight(current, unit)} of estimated max over ${rangeLabel}.`;
    }
    if (Math.abs(change) >= 2) {
      return `Your ${name} is ${change > 0 ? 'up' : 'down'} ${Math.abs(change).toFixed(1)}% over ${rangeLabel}.`;
    }
    return `Your ${name} estimated max sits at ${fmtWeight(current, unit)}.`;
  }, [change, current, exercise, rangeLabel, state, unit]);

  if (!exercise) {
    return (
      <View>
        <Headline caption="Strength" text="Nothing has been logged yet." />
        <EmptyState
          icon={Barbell}
          title="No lifts logged"
          body="Finish a workout and every lift you trained becomes trackable here."
        />
      </View>
    );
  }

  return (
    <View>
      <Headline caption="Strength" text={headline} />

      <Card
        onPress={() => setPickerOpen(true)}
        accessibilityLabel={`Change lift, currently ${exercise.name}`}
        padding={space.lg}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ flex: 1, gap: 2 }}>
            <Text variant="label" tone="faint">
              Lift
            </Text>
            <Text variant="h2" numberOfLines={1}>
              {exercise.name}
            </Text>
          </View>
          <ChevronDown size={20} color={c.textMuted} strokeWidth={2} />
        </View>
      </Card>

      <Section
        title="Estimated 1RM over time"
        right={<RangeSwitch options={RANGES} value={range} onChange={setRange} />}
      >
        {points.length < 2 ? (
          <EmptyState
            icon={Chart}
            title="Not enough in this range"
            body={`You have ${points.length === 1 ? 'one session' : 'no sessions'} of ${exercise.name.toLowerCase()} here. Widen the range or train it again.`}
          />
        ) : (
          <Card padding={space.lg}>
            <LineChart
              data={points}
              height={200}
              formatY={(v) => `${fmtWeightValue(v, unit)} ${unitLabel(unit)}`}
            />
          </Card>
        )}
      </Section>

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
        <StatTile
          label="Estimated 1RM"
          value={fmtWeightValue(current, unit)}
          unit={unitLabel(unit)}
          delta={inRange.length >= 2 && Math.abs(change) >= 0.5 ? `${change > 0 ? '+' : '−'}${fmtPct(change)}%` : undefined}
          deltaTone={change > 0 ? 'up' : 'flat'}
          footnote={range === 'all' ? 'all time' : `last ${range === '8w' ? '8 weeks' : '6 months'}`}
        />
        <StatTile
          label="Sessions"
          value={series.length}
          footnote={series.length ? relative(series[series.length - 1].ts) : undefined}
          size="md"
        />
      </View>

      <Section title="Personal records">
        {prs.length === 0 ? (
          <Card padding={space.lg}>
            <Text variant="small" tone="muted">
              No records for this lift yet. The first working set you log sets the baseline.
            </Text>
          </Card>
        ) : (
          <Card padding={0}>
            {prs.slice(0, 6).map((pr, i) => (
              <View
                key={pr.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: space.md,
                  paddingHorizontal: space.lg,
                  paddingVertical: space.md,
                  minHeight: 56,
                  borderTopWidth: i === 0 ? 0 : hairline,
                  borderTopColor: c.border,
                }}
              >
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: radius.pill,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: c.surfaceAlt,
                  }}
                >
                  <Trophy size={17} color={c.textMuted} strokeWidth={1.75} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="body" weight="600">
                    {PR_LABEL[pr.kind] ?? 'Record'}
                  </Text>
                  <Text variant="small" tone="faint">
                    {relative(pr.ts)}
                  </Text>
                </View>
                <Text variant="h2" numeric>
                  {pr.kind === 'reps'
                    ? `${Math.round(pr.value)}`
                    : fmtWeightValue(pr.value, unit)}
                </Text>
                <Text variant="small" tone="faint">
                  {pr.kind === 'reps' ? 'reps' : unitLabel(unit)}
                </Text>
              </View>
            ))}
          </Card>
        )}
      </Section>

      <Section title="Rep maxes">
        <Card padding={0}>
          <View
            style={{
              flexDirection: 'row',
              paddingHorizontal: space.lg,
              paddingTop: space.md,
              paddingBottom: space.sm,
            }}
          >
            <Text variant="label" tone="faint" style={{ width: 64 }}>
              Reps
            </Text>
            <Text variant="label" tone="faint" style={{ flex: 1, textAlign: 'right' }}>
              Best done
            </Text>
            <Text variant="label" tone="faint" style={{ flex: 1, textAlign: 'right' }}>
              Estimated
            </Text>
          </View>
          {rows.map((r) => (
            <View
              key={r.reps}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: space.lg,
                paddingVertical: space.md,
                minHeight: 48,
                borderTopWidth: hairline,
                borderTopColor: c.border,
              }}
            >
              <Text variant="body" weight="700" numeric style={{ width: 64 }}>
                {r.reps}
              </Text>
              <Text variant="body" numeric tone={r.best === null ? 'faint' : 'default'} style={{ flex: 1, textAlign: 'right' }}>
                {r.best === null ? '—' : fmtWeightValue(r.best, unit)}
              </Text>
              <Text variant="body" numeric tone="muted" style={{ flex: 1, textAlign: 'right' }}>
                {r.est > 0 ? fmtWeightValue(r.est, unit) : '—'}
              </Text>
            </View>
          ))}
          <View style={{ paddingHorizontal: space.lg, paddingVertical: space.md }}>
            <Text variant="small" tone="faint">
              Estimated loads come from your current estimated max, in {unitLabel(unit)}.
            </Text>
          </View>
        </Card>
      </Section>

      <ExercisePicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        state={state}
        value={exerciseId}
        onSelect={setPicked}
      />
    </View>
  );
}
