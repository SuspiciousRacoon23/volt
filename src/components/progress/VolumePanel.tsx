import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import { Card, EmptyState, StatTile, Text } from '@/components/kit';
import type { AppState } from '@/data';
import { BodyMap, Chart, Timer } from '@/icons';
import { fmtDuration, fmtVolume, pctChange, fmtPct } from '@/lib';
import { useTheme } from '@/theme';

import { CompareBars } from './CompareBars';
import { ConsistencyGrid } from './ConsistencyGrid';
import { MuscleRanking } from './MuscleRanking';
import { Headline, RangeSwitch, Section } from './PanelKit';
import {
  averageDurationMs,
  finishedSessions,
  heatFrom,
  pickHeadline,
  rankedMuscleSets,
  weeklyVolume,
} from './progressData';

const WEEKS = 8;

const WINDOWS = [
  { value: '7' as const, label: '7 days' },
  { value: '28' as const, label: '28 days' },
];

const SIDES = [
  { value: 'front' as const, label: 'Front' },
  { value: 'back' as const, label: 'Back' },
];

export function VolumePanel({ state }: { state: AppState }) {
  const { c, space } = useTheme();
  const unit = state.settings.unit;

  const [span, setSpan] = useState<'7' | '28'>('7');
  const [side, setSide] = useState<'front' | 'back'>('front');

  const bars = useMemo(() => weeklyVolume(state, WEEKS), [state]);
  const rows = useMemo(() => rankedMuscleSets(state, Number(span)), [state, span]);
  const heat = useMemo(() => heatFrom(rows), [rows]);
  const avgMs = useMemo(() => averageDurationMs(state, 28), [state]);
  const sessions28 = useMemo(() => {
    const since = Date.now() - 28 * 86_400_000;
    return finishedSessions(state).filter((s) => s.startedAt >= since).length;
  }, [state]);

  const hasVolume = bars.some((b) => b.value > 0 || b.previous > 0);
  const thisWeek = bars[bars.length - 1];
  const lastWeek = bars[bars.length - 2];
  const weekChange = thisWeek && lastWeek ? pctChange(lastWeek.value, thisWeek.value) : 0;

  const headline = pickHeadline(
    state,
    ['volume-trend', 'balance', 'neglected', 'volume-total', 'frequency', 'goal'],
    hasVolume
      ? `You have moved ${fmtVolume(thisWeek.value, unit)} this week.`
      : 'Finish a workout and your volume will start building here.',
  );

  if (!hasVolume) {
    return (
      <View>
        <Headline caption="Volume" text={headline} />
        <EmptyState
          icon={Chart}
          title="No volume yet"
          body="Volume is weight times reps across your working sets. It appears once you finish a session."
        />
      </View>
    );
  }

  return (
    <View>
      <Headline caption="Volume" text={headline} />

      <Section title="Weekly volume">
        <Card padding={space.lg}>
          <CompareBars
            data={bars}
            formatValue={(v) => fmtVolume(v, unit)}
            currentLabel={`Last ${WEEKS} weeks`}
            previousLabel={`The ${WEEKS} before`}
          />
        </Card>
      </Section>

      <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.md }}>
        <StatTile
          label="This week"
          value={fmtVolume(thisWeek.value, unit).replace(` ${unit}`, '')}
          unit={unit}
          delta={lastWeek && Math.abs(weekChange) >= 1 ? `${weekChange > 0 ? '+' : '−'}${fmtPct(weekChange)}%` : undefined}
          deltaTone={weekChange > 0 ? 'up' : 'flat'}
          footnote="on last week"
        />
        <StatTile
          label="Average session"
          value={avgMs > 0 ? fmtDuration(avgMs) : '—'}
          icon={Timer}
          footnote={sessions28 > 0 ? `${sessions28} in 28 days` : 'no sessions yet'}
        />
      </View>

      <Section
        title="Sets per muscle"
        right={<RangeSwitch options={WINDOWS} value={span} onChange={setSpan} />}
      >
        <Card padding={space.lg}>
          <View style={{ alignItems: 'center', marginBottom: space.lg }}>
            <BodyMap
              side={side}
              heat={heat}
              size={260}
              base={c.surfaceAlt}
              active={c.text}
              border={c.border}
              color={c.textFaint}
            />
            <View style={{ marginTop: space.md }}>
              <RangeSwitch options={SIDES} value={side} onChange={setSide} />
            </View>
          </View>

          <MuscleRanking rows={rows} />

          <Text variant="small" tone="faint" style={{ marginTop: space.lg }}>
            Secondary movers count as half a set. Warm-ups are not counted.
          </Text>
        </Card>
      </Section>

      <Section title="Consistency">
        <Card padding={space.lg}>
          <ConsistencyGrid state={state} />
        </Card>
      </Section>
    </View>
  );
}
