import React, { useState } from 'react';
import { View } from 'react-native';

import { Card, Stepper, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import { Warning } from '@/icons';
import {
  INCREMENT_KG,
  INCREMENT_LB,
  displayWeight,
  fmtWeight,
  fmtWeightValue,
  platesFor,
  toKg,
  unitLabel,
} from '@/lib';
import { useTheme } from '@/theme';

import { Barbell } from './Barbell';

/** What to hang on the bar to hit a number, using only the plates you own. */
export function ToolPlates(): React.JSX.Element {
  const { settings } = useStore();
  const { c, space } = useTheme();
  const unit = settings.unit;
  const step = unit === 'kg' ? INCREMENT_KG : INCREMENT_LB;

  const [shown, setShown] = useState(() => displayWeight(60, unit));
  const targetKg = toKg(shown, unit);
  const solve = platesFor(targetKg, settings.barKg, settings.availablePlatesKg);

  return (
    <View style={{ gap: space.lg }}>
      <Stepper
        label="Target weight"
        value={shown}
        onChange={setShown}
        step={step}
        min={displayWeight(settings.barKg, unit)}
        max={displayWeight(400, unit)}
        size="lg"
        formatValue={(v) => `${fmtWeightValue(toKg(v, unit), unit)} ${unitLabel(unit)}`}
      />

      <Card tone="plain">
        <Barbell perSide={solve.perSide} unit={unit} inventory={settings.availablePlatesKg} />
      </Card>

      <Card tone="plain">
        <View style={{ gap: space.sm }}>
          <SummaryLine label="Bar" value={fmtWeight(settings.barKg, unit)} />
          <SummaryLine label="Plates" value={fmtWeight(solve.achievable - settings.barKg, unit)} />
          <SummaryLine label="Loaded total" value={fmtWeight(solve.achievable, unit)} strong />
        </View>
      </Card>

      {solve.leftover > 0.01 ? (
        <View style={{ flexDirection: 'row', gap: space.md, paddingHorizontal: space.xs }}>
          <Warning size={18} color={c.warn} />
          <Text variant="small" tone="muted" style={{ flex: 1 }}>
            Your plates cannot make that number. The closest you can build is{' '}
            {fmtWeight(solve.achievable, unit)} — {fmtWeight(solve.leftover, unit)} short.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

function SummaryLine({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <Text variant={strong ? 'body' : 'small'} tone={strong ? 'default' : 'muted'}>
        {label}
      </Text>
      <Text variant={strong ? 'h2' : 'body'} numeric>
        {value}
      </Text>
    </View>
  );
}
