import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { Screen, Segmented, SkeletonGroup, type SegmentedItem } from '@/components/kit';
import { BodyPanel } from '@/components/progress/BodyPanel';
import { StrengthPanel } from '@/components/progress/StrengthPanel';
import { VolumePanel } from '@/components/progress/VolumePanel';
import { useStore } from '@/data';
import { Barbell, Body, Chart } from '@/icons';
import { dur, useReducedMotion, useTheme } from '@/theme';

type Tab = 'strength' | 'volume' | 'body';

const TABS: SegmentedItem<Tab>[] = [
  { value: 'strength', label: 'Strength', icon: Barbell },
  { value: 'volume', label: 'Volume', icon: Chart },
  { value: 'body', label: 'Body', icon: Body },
];

export default function ProgressScreen(): React.JSX.Element {
  const state = useStore();
  const { space } = useTheme();
  const reduced = useReducedMotion();
  const [tab, setTab] = useState<Tab>('strength');

  return (
    <Screen title="Progress" subtitle="What the log actually says" bottomInset={68}>
      <Segmented items={TABS} value={tab} onChange={setTab} height={48} />

      <View style={{ marginTop: space.xl }}>
        {!state.hydrated ? (
          <SkeletonGroup lines={4} />
        ) : (
          <Animated.View key={tab} entering={reduced ? undefined : FadeIn.duration(dur.base)}>
            {tab === 'strength' ? <StrengthPanel state={state} /> : null}
            {tab === 'volume' ? <VolumePanel state={state} /> : null}
            {tab === 'body' ? <BodyPanel state={state} /> : null}
          </Animated.View>
        )}
      </View>
    </Screen>
  );
}
