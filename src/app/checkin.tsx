import { router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { View } from 'react-native';

import { Button, Card, Divider, Screen, Segmented, Text } from '@/components/kit';
import { ScaleRow } from '@/components/profile/ScaleRow';
import { VerdictPanel } from '@/components/profile/Verdict';
import { uid } from '@/data/ids';
import { isoDate, todayReadiness } from '@/data/selectors';
import { useActions, useStore } from '@/data/store';
import type { MuscleGroup, Readiness } from '@/data/types';
import { Battery, Body, BodyMap, Brain, Flame, type IconProps, Joint, Sleep } from '@/icons';
import { success as hapticSuccess } from '@/lib/haptics';
import { useTheme } from '@/theme';

type Key = 'energy' | 'sleep' | 'motivation' | 'stress' | 'soreness' | 'joints';

const ROWS: {
  key: Key;
  label: string;
  icon: React.ComponentType<IconProps>;
  descriptors: readonly string[];
}[] = [
  { key: 'energy', label: 'Energy', icon: Battery, descriptors: ['Empty', 'Low', 'Okay', 'Good', 'High'] },
  { key: 'sleep', label: 'Sleep', icon: Sleep, descriptors: ['Awful', 'Poor', 'Okay', 'Good', 'Excellent'] },
  { key: 'motivation', label: 'Motivation', icon: Flame, descriptors: ['None', 'Low', 'Okay', 'Keen', 'Very keen'] },
  { key: 'stress', label: 'Stress', icon: Brain, descriptors: ['Calm', 'Settled', 'Some', 'High', 'Very high'] },
  { key: 'soreness', label: 'Muscle soreness', icon: Body, descriptors: ['None', 'Slight', 'Moderate', 'Sore', 'Very sore'] },
  { key: 'joints', label: 'Joint discomfort', icon: Joint, descriptors: ['Fine', 'Niggle', 'Noticeable', 'Achy', 'Painful'] },
];

const SIDES = [
  { value: 'front' as const, label: 'Front' },
  { value: 'back' as const, label: 'Back' },
];

function blank(): Readiness {
  return {
    id: uid('rd'),
    date: isoDate(Date.now()),
    energy: 3,
    sleep: 3,
    motivation: 3,
    stress: 3,
    soreness: 2,
    joints: 2,
    soreAreas: [],
  };
}

export default function CheckinScreen(): React.JSX.Element {
  const state = useStore();
  const { saveReadiness } = useActions();
  const { space } = useTheme();

  const existing = useMemo(() => todayReadiness(state), [state]);
  const [draft, setDraft] = useState<Readiness>(() => existing ?? blank());
  const [done, setDone] = useState(Boolean(existing));
  const [side, setSide] = useState<'front' | 'back'>('front');

  const set = useCallback((key: Key, v: number) => {
    setDraft((d) => ({ ...d, [key]: v }));
  }, []);

  const toggleArea = useCallback((m: MuscleGroup) => {
    setDraft((d) => ({
      ...d,
      soreAreas: d.soreAreas.includes(m) ? d.soreAreas.filter((x) => x !== m) : [...d.soreAreas, m],
    }));
  }, []);

  const save = useCallback(() => {
    hapticSuccess();
    saveReadiness(draft);
    setDone(true);
  }, [draft, saveReadiness]);

  if (done) {
    return (
      <Screen
        title="Today’s readiness"
        subtitle="Saved. It shapes what the app suggests, nothing more."
        onBack={() => router.back()}
        footer={
          <View style={{ gap: space.sm }}>
            <Button label="Done" variant="primary" fullWidth onPress={() => router.back()} />
            <Button label="Change my answers" variant="ghost" fullWidth onPress={() => setDone(false)} />
          </View>
        }
      >
        <VerdictPanel readiness={draft} />
      </Screen>
    );
  }

  return (
    <Screen
      title="Daily check-in"
      subtitle="Six taps. No typing."
      onBack={() => router.back()}
      footer={<Button label="Save check-in" variant="primary" fullWidth onPress={save} />}
    >
      <Card tone="plain">
        <View style={{ gap: space.xl }}>
          {ROWS.map((row, i) => (
            <View key={row.key} style={{ gap: space.xl }}>
              {i > 0 ? <Divider /> : null}
              <ScaleRow
                icon={row.icon}
                label={row.label}
                descriptors={row.descriptors}
                value={draft[row.key]}
                onChange={(v) => set(row.key, v)}
              />
            </View>
          ))}
        </View>
      </Card>

      <View style={{ marginTop: space.xxl, gap: space.md }}>
        <Text variant="label" tone="faint" style={{ marginLeft: space.xs }}>
          Sore or painful areas
        </Text>
        <Card tone="plain">
          <View style={{ gap: space.lg, alignItems: 'center' }}>
            <Segmented items={SIDES} value={side} onChange={setSide} style={{ alignSelf: 'stretch' }} />
            <BodyMap side={side} selected={draft.soreAreas} onToggle={toggleArea} size={340} />
            <Text variant="small" tone="faint" center>
              {draft.soreAreas.length === 0
                ? 'Tap anywhere that is sore. Optional.'
                : `${draft.soreAreas.length} area${draft.soreAreas.length === 1 ? '' : 's'} marked. Tap again to clear.`}
            </Text>
          </View>
        </Card>
      </View>

      <Text variant="small" tone="faint" style={{ marginTop: space.lg }}>
        Answers are stored on this device only.
      </Text>
    </Screen>
  );
}
