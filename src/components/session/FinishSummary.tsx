import React, { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, StatTile, Text } from '@/components/kit';
import type { Exercise, ID, PR, Session, Unit } from '@/data/types';
import { Trophy } from '@/icons';
import { fmtDuration } from '@/lib/dates';
import { describePR } from '@/lib/prs';
import { sessionVolume, sessionWorkingSetCount } from '@/lib/sets';
import { fmtVolume, fmtWeight } from '@/lib/units';
import { dur, hairline, ms, useReducedMotion, useTheme } from '@/theme';

export type FinishSummaryProps = {
  session: Session;
  unit: Unit;
  prs: PR[];
  exercises: Record<ID, Exercise>;
  insight: string;
  onSave: () => void;
  onResume: () => void;
  onDiscard: () => void;
};

/** The end of the workout. One lime moment, and it belongs to the records. */
export function FinishSummary({
  session,
  unit,
  prs,
  exercises,
  insight,
  onSave,
  onResume,
  onDiscard,
}: FinishSummaryProps) {
  const { c, radius, space } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const t = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    t.value = withTiming(1, { duration: ms(dur.slow, reduced) });
  }, [reduced, t]);

  const anim = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 12 }],
  }));

  const duration = Math.max(0, (session.endedAt ?? Date.now()) - session.startedAt);
  const volume = sessionVolume(session);
  const sets = sessionWorkingSetCount(session);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top + space.lg }}>
      <Animated.View style={[{ flex: 1 }, anim]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: space.lg,
            paddingBottom: insets.bottom + space.xxl,
            gap: space.xl,
          }}>
          <View style={{ gap: space.xs }}>
            <Text variant="label" tone="faint">
              Workout complete
            </Text>
            <Text variant="title">{session.name}</Text>
          </View>

          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <StatTile label="Duration" value={fmtDuration(duration)} style={{ flex: 1 }} />
            <StatTile label="Volume" value={fmtVolume(volume, unit)} style={{ flex: 1 }} />
            <StatTile label="Sets" value={sets} style={{ flex: 1 }} />
          </View>

          {prs.length > 0 ? (
            <View
              style={{
                gap: space.sm,
                padding: space.lg,
                borderRadius: radius.lg,
                backgroundColor: c.accentSoft,
              }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
                <Trophy size={20} color={c.accent} strokeWidth={2} />
                <Text variant="h2">
                  {prs.length === 1 ? 'One personal record' : `${prs.length} personal records`}
                </Text>
              </View>
              {prs.map((pr) => (
                <Text key={pr.id} variant="small" tone="muted">
                  {describePR(pr, exercises[pr.exerciseId]?.name ?? 'this lift', (kg) => fmtWeight(kg, unit))}
                </Text>
              ))}
            </View>
          ) : null}

          <View
            style={{
              padding: space.lg,
              borderRadius: radius.lg,
              borderWidth: hairline,
              borderColor: c.border,
            }}>
            <Text variant="body" tone="muted">
              {insight}
            </Text>
          </View>

          <View style={{ gap: space.sm }}>
            <Button label="Save workout" variant="primary" size="lg" fullWidth onPress={onSave} />
            <Button label="Back to the workout" variant="ghost" size="lg" fullWidth onPress={onResume} />
            <Button label="Discard workout" variant="danger" size="lg" fullWidth onPress={onDiscard} />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
