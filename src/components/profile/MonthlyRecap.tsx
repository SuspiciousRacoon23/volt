import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Card, Divider, StatTile, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import { volumeByMuscle } from '@/data/selectors';
import { buildInsights, fmtDuration, fmtVolume, monthLabel, sessionDurationMs, sessionVolume, sessionWorkingSetCount } from '@/lib';
import { useTheme } from '@/theme';

import { finishedSessions } from './lifetime';

/** The last calendar month, stated plainly. No badges, no congratulation. */
export function MonthlyRecap(): React.JSX.Element {
  const state = useStore();
  const { space } = useTheme();
  const unit = state.settings.unit;

  const from = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  const sessions = useMemo(
    () => finishedSessions(state).filter((s) => s.startedAt >= from),
    [state, from],
  );

  const volume = sessions.reduce((n, s) => n + sessionVolume(s), 0);
  const sets = sessions.reduce((n, s) => n + sessionWorkingSetCount(s), 0);
  const time = sessions.reduce((n, s) => n + sessionDurationMs(s), 0);
  const prs = state.prs.filter((p) => p.ts >= from);

  const leader = useMemo(() => {
    const byMuscle = volumeByMuscle(state, from);
    const entries = Object.entries(byMuscle).sort((a, b) => b[1] - a[1]);
    return entries[0] && entries[0][1] > 0 ? entries[0][0] : null;
  }, [state, from]);

  const insights = useMemo(
    () =>
      buildInsights(
        {
          sessions: state.sessions,
          exercises: state.exercises,
          prs: state.prs,
          body: state.body,
          settings: { unit, weeklyGoal: state.settings.weeklyGoal },
        },
        { limit: 3 },
      ),
    [state, unit],
  );

  if (sessions.length === 0) {
    return (
      <Text variant="body" tone="muted">
        Nothing logged in {monthLabel(Date.now())} yet. The recap fills itself in
        as you train.
      </Text>
    );
  }

  return (
    <View style={{ gap: space.lg }}>
      <Text variant="label" tone="faint">
        {monthLabel(Date.now())}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        <StatTile label="Workouts" value={sessions.length} style={{ flexGrow: 1, flexBasis: '46%' }} />
        <StatTile label="Volume" value={fmtVolume(volume, unit)} style={{ flexGrow: 1, flexBasis: '46%' }} />
        <StatTile label="Working sets" value={sets} style={{ flexGrow: 1, flexBasis: '46%' }} />
        <StatTile label="Time" value={fmtDuration(time)} style={{ flexGrow: 1, flexBasis: '46%' }} />
      </View>

      <Card tone="plain">
        <View style={{ gap: space.sm }}>
          <Text variant="small" tone="muted">
            {prs.length === 0
              ? 'No records this month. Records are not the only way a month works.'
              : `${prs.length} record${prs.length === 1 ? '' : 's'} set this month.`}
          </Text>
          {leader ? (
            <>
              <Divider spacing={4} />
              <Text variant="small" tone="muted">
                Most volume went to your {leader}.
              </Text>
            </>
          ) : null}
        </View>
      </Card>

      {insights.length > 0 ? (
        <View style={{ gap: space.md }}>
          {insights.map((line) => (
            <Text key={line} variant="body">
              {line}
            </Text>
          ))}
        </View>
      ) : null}
    </View>
  );
}
