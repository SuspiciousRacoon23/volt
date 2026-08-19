import React, { useState } from 'react';
import { View } from 'react-native';

import { Card, Divider, Stepper, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import {
  INCREMENT_KG,
  INCREMENT_LB,
  describePlates,
  displayWeight,
  fmtWeight,
  fmtWeightValue,
  platesFor,
  toKg,
  unitLabel,
  warmupReps,
  warmupSets,
} from '@/lib';
import { useTheme } from '@/theme';

/** A ramp that arrives primed rather than tired. Every rung is loadable. */
export function ToolWarmup(): React.JSX.Element {
  const { settings } = useStore();
  const { space } = useTheme();
  const unit = settings.unit;
  const step = unit === 'kg' ? INCREMENT_KG : INCREMENT_LB;

  const [shown, setShown] = useState(() => displayWeight(100, unit));
  const workKg = toKg(shown, unit);
  const sets = warmupSets(workKg, settings.barKg, settings.availablePlatesKg);

  return (
    <View style={{ gap: space.lg }}>
      <Stepper
        label="Working weight"
        value={shown}
        onChange={setShown}
        step={step}
        min={0}
        max={displayWeight(400, unit)}
        size="lg"
        formatValue={(v) => `${fmtWeightValue(toKg(v, unit), unit)} ${unitLabel(unit)}`}
      />

      <Card tone="plain">
        <View style={{ gap: space.md }}>
          {sets.length === 0 ? (
            <Text variant="small" tone="muted">
              Set a working weight above the bar to get a ramp.
            </Text>
          ) : (
            sets.map((s, i) => (
              <View key={`${s.weight}-${i}`} style={{ gap: space.md }}>
                {i > 0 ? <Divider /> : null}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
                  <Text variant="label" tone="faint" numeric style={{ width: 24 }}>
                    {i + 1}
                  </Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="h2" numeric>
                      {fmtWeight(s.weight, unit)} × {s.reps}
                    </Text>
                    <Text variant="small" tone="faint" numeric>
                      {Math.round(s.pct * 100)}% · {describePlates(
                        platesFor(s.weight, settings.barKg, settings.availablePlatesKg).perSide,
                      )}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </Card>

      {sets.length > 0 ? (
        <Text variant="small" tone="faint">
          {sets.length} ramp sets, {warmupReps(sets)} reps before your first
          working set. Rest just long enough to stay warm.
        </Text>
      ) : null}
    </View>
  );
}
