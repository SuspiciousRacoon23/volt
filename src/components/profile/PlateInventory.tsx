import React, { useMemo } from 'react';
import { View } from 'react-native';

import { Chip, Text } from '@/components/kit';
import type { Unit } from '@/data/types';
import { fmtWeightValue, lbToKg, unitLabel } from '@/lib';
import { useTheme } from '@/theme';

const KG_DENOMINATIONS = [25, 20, 15, 10, 5, 2.5, 1.25, 1, 0.5];
const LB_DENOMINATIONS = [45, 35, 25, 10, 5, 2.5, 1.25];

const EPS = 0.01;

function near(a: number, b: number): boolean {
  return Math.abs(a - b) < EPS;
}

/**
 * The plates you actually own. Everything that suggests a load — warm-ups,
 * progression, the plate calculator — is snapped to this set, so a number the
 * app prints is always a number you can build.
 */
export function PlateInventory({
  unit,
  plates,
  onChange,
}: {
  unit: Unit;
  plates: number[];
  onChange: (next: number[]) => void;
}): React.JSX.Element {
  const { space } = useTheme();

  const options = useMemo(
    () => (unit === 'kg' ? KG_DENOMINATIONS : LB_DENOMINATIONS.map((v) => lbToKg(v))),
    [unit],
  );

  const toggle = (kg: number) => {
    const on = plates.some((p) => near(p, kg));
    const next = on ? plates.filter((p) => !near(p, kg)) : [...plates, kg];
    onChange(next.sort((a, b) => b - a));
  };

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {options.map((kg) => (
          <Chip
            key={kg}
            label={fmtWeightValue(kg, unit)}
            selected={plates.some((p) => near(p, kg))}
            onPress={() => toggle(kg)}
            size="sm"
          />
        ))}
      </View>
      <Text variant="small" tone="faint">
        {plates.length === 0
          ? `No plates selected. Loads will fall back to the bar.`
          : `${plates.length} denominations, in ${unitLabel(unit)}.`}
      </Text>
    </View>
  );
}
