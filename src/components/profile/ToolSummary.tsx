import React, { useMemo } from 'react';
import { Share, View } from 'react-native';

import { Button, Card, Divider, EmptyState, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import type { AppState, Session } from '@/data/types';
import { Barbell as BarbellIcon, Export, Trophy } from '@/icons';
import {
  dateLabel,
  describePR,
  fmtDuration,
  fmtVolume,
  fmtWeight,
  sessionDurationMs,
  sessionInsight,
  sessionVolume,
  sessionWorkingSetCount,
  topSet,
} from '@/lib';
import { useTheme } from '@/theme';

function finished(s: AppState): Session[] {
  return Object.values(s.sessions)
    .filter((x) => x.endedAt !== null)
    .sort((a, b) => b.startedAt - a.startedAt);
}

/** A recap you can hand to someone without exporting your whole history. */
export function ToolSummary(): React.JSX.Element {
  const state = useStore();
  const { c, space } = useTheme();
  const unit = state.settings.unit;

  const history = useMemo(() => finished(state), [state]);
  const session = history[0] ?? null;

  const prs = useMemo(
    () => (session ? state.prs.filter((p) => p.sessionId === session.id) : []),
    [session, state.prs],
  );

  const lines = useMemo(() => {
    if (!session) return [];
    return session.exercises
      .map((le) => ({ le, top: topSet(le.sets) }))
      .filter((x) => x.top !== null)
      .map((x) => ({
        name: state.exercises[x.le.exerciseId]?.name ?? 'Exercise',
        sets: x.le.sets.filter((s) => s.done && s.kind !== 'warmup').length,
        top: x.top!,
      }));
  }, [session, state.exercises]);

  if (!session) {
    return (
      <EmptyState
        icon={BarbellIcon}
        title="No finished sessions yet"
        body="Once you complete a workout it will be recapped here, ready to share."
        variant="inline"
      />
    );
  }

  const volume = sessionVolume(session);
  const duration = sessionDurationMs(session);

  const text = [
    `${session.name} — ${dateLabel(session.startedAt)}`,
    `${fmtDuration(duration)} · ${fmtVolume(volume, unit)} · ${sessionWorkingSetCount(session)} working sets`,
    '',
    ...lines.map((l) => `${l.name}: ${l.sets} × top ${fmtWeight(l.top.weight, unit)} × ${l.top.reps}`),
    ...(prs.length
      ? ['', ...prs.map((p) => `PR — ${describePR(p, state.exercises[p.exerciseId]?.name ?? 'Exercise', (kg) => fmtWeight(kg, unit))}`)]
      : []),
  ].join('\n');

  const share = () => {
    void Share.share({ message: text }).catch(() => undefined);
  };

  return (
    <View style={{ gap: space.lg }}>
      <Card tone="plain">
        <View style={{ gap: space.md }}>
          <View style={{ gap: 2 }}>
            <Text variant="label" tone="faint">
              {dateLabel(session.startedAt)}
            </Text>
            <Text variant="h1">{session.name}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: space.xl }}>
            <Metric label="Duration" value={fmtDuration(duration)} />
            <Metric label="Volume" value={fmtVolume(volume, unit)} />
            <Metric label="Sets" value={`${sessionWorkingSetCount(session)}`} />
          </View>
        </View>
      </Card>

      <Card tone="plain" title="Top sets">
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {lines.map((l, i) => (
            <View key={`${l.name}-${i}`}>
              {i > 0 ? <Divider spacing={6} /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md }}>
                <Text variant="body" style={{ flex: 1 }} numberOfLines={1}>
                  {l.name}
                </Text>
                <Text variant="small" tone="faint" numeric>
                  {l.sets} sets
                </Text>
                <Text variant="body" numeric>
                  {fmtWeight(l.top.weight, unit)} × {l.top.reps}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {prs.length > 0 ? (
        <Card tone="accent">
          <View style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
              <Trophy size={18} color={c.accent} />
              <Text variant="label" tone="faint">
                Records set
              </Text>
            </View>
            {prs.map((p) => (
              <Text key={p.id} variant="body">
                {describePR(p, state.exercises[p.exerciseId]?.name ?? 'Exercise', (kg) => fmtWeight(kg, unit))}
              </Text>
            ))}
          </View>
        </Card>
      ) : null}

      <Text variant="small" tone="muted">
        {sessionInsight(session, history, unit)}
      </Text>

      <Button label="Share this recap" variant="secondary" icon={Export} fullWidth onPress={share} />
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="label" tone="faint">
        {label}
      </Text>
      <Text variant="h2" numeric>
        {value}
      </Text>
    </View>
  );
}
