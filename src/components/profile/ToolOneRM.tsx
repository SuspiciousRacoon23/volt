import React, { useState } from 'react';
import { View } from 'react-native';

import { Card, Divider, Stepper, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import {
  INCREMENT_KG,
  INCREMENT_LB,
  displayWeight,
  e1rm,
  fmtWeight,
  fmtWeightValue,
  nearestAchievable,
  percentOf1RM,
  toKg,
  unitLabel,
  weightForReps,
} from '@/lib';
import { useTheme } from '@/theme';

const TARGET_REPS = [1, 3, 5, 8, 10, 12];

/** A blended Epley/Brzycki estimate, with the training loads that follow from it. */
export function ToolOneRM(): React.JSX.Element {
  const { settings } = useStore();
  const { space } = useTheme();
  const unit = settings.unit;
  const step = unit === 'kg' ? INCREMENT_KG : INCREMENT_LB;

  const [shown, setShown] = useState(() => displayWeight(80, unit));
  const [reps, setReps] = useState(5);

  const weightKg = toKg(shown, unit);
  const max = e1rm(weightKg, reps);

  return (
    <View style={{ gap: space.lg }}>
      <Stepper
        label="Weight lifted"
        value={shown}
        onChange={setShown}
        step={step}
        min={0}
        max={displayWeight(400, unit)}
        size="lg"
        formatValue={(v) => `${fmtWeightValue(toKg(v, unit), unit)} ${unitLabel(unit)}`}
      />
      <Stepper label="Reps completed" value={reps} onChange={setReps} step={1} min={1} max={15} size="lg" />

      <Card tone="plain">
        <View style={{ alignItems: 'center', gap: space.xs, paddingVertical: space.sm }}>
          <Text variant="label" tone="faint">
            Estimated one-rep max
          </Text>
          <Text variant="display" numeric>
            {fmtWeightValue(max, unit)}
          </Text>
          <Text variant="small" tone="muted">
            {unitLabel(unit)}
          </Text>
        </View>
      </Card>

      <Card tone="plain" title="Training loads">
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {TARGET_REPS.map((r, i) => {
            const raw = weightForReps(max, r);
            const loadable = nearestAchievable(raw, settings.barKg, settings.availablePlatesKg);
            return (
              <View key={r}>
                {i > 0 ? <Divider spacing={6} /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: space.md }}>
                  <Text variant="body" numeric style={{ width: 64 }}>
                    {r} rep{r === 1 ? '' : 's'}
                  </Text>
                  <Text variant="small" tone="faint" numeric style={{ flex: 1 }}>
                    {Math.round(percentOf1RM(r) * 100)}%
                  </Text>
                  <Text variant="h2" numeric>
                    {fmtWeight(loadable, unit)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Text variant="small" tone="faint">
        Estimates, snapped to plates you own. They drift once a set runs past ten
        reps, and they are not a substitute for testing a real single.
      </Text>
    </View>
  );
}
