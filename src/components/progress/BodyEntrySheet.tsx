import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button, Sheet, Stepper, Text } from '@/components/kit';
import { useActions, type BodyEntry, type Unit } from '@/data';
import { dayKey, displayWeight, toKg, unitLabel } from '@/lib';
import { useTheme } from '@/theme';

import { MEASUREMENT_KEYS, MEASUREMENT_LABELS, type MeasurementKey } from './progressData';

type Draft = { weight: number; fat: number; sizes: Record<MeasurementKey, number> };

function emptySizes(): Record<MeasurementKey, number> {
  return MEASUREMENT_KEYS.reduce(
    (acc, k) => ({ ...acc, [k]: 0 }),
    {} as Record<MeasurementKey, number>,
  );
}

function draftFrom(entry: BodyEntry | null, unit: Unit): Draft {
  const sizes = emptySizes();
  for (const k of MEASUREMENT_KEYS) sizes[k] = Number(entry?.measurements?.[k] ?? 0);
  return {
    weight: entry?.weightKg ? Math.round(displayWeight(entry.weightKg, unit) * 2) / 2 : 0,
    fat: entry?.bodyFat ?? 0,
    sizes,
  };
}

/** Record today's bodyweight, body fat and girths. Everything is optional. */
export function BodyEntrySheet({
  visible,
  onClose,
  latest,
  today,
  unit,
}: {
  visible: boolean;
  onClose: () => void;
  latest: BodyEntry | null;
  today: BodyEntry | null;
  unit: Unit;
}) {
  const { space } = useTheme();
  const { saveBody } = useActions();
  const [draft, setDraft] = useState<Draft>(() => draftFrom(today ?? latest, unit));

  useEffect(() => {
    if (visible) setDraft(draftFrom(today ?? latest, unit));
  }, [latest, today, unit, visible]);

  const save = () => {
    const measurements: NonNullable<BodyEntry['measurements']> = {};
    for (const k of MEASUREMENT_KEYS) {
      if (draft.sizes[k] > 0) measurements[k] = Math.round(draft.sizes[k] * 10) / 10;
    }
    const entry: BodyEntry = {
      id: today?.id ?? `body_${Date.now().toString(36)}`,
      date: today?.date ?? dayKey(),
      ...(draft.weight > 0 ? { weightKg: Math.round(toKg(draft.weight, unit) * 100) / 100 } : {}),
      ...(draft.fat > 0 ? { bodyFat: Math.round(draft.fat * 10) / 10 } : {}),
      ...(Object.keys(measurements).length > 0 ? { measurements } : {}),
      ...(today?.photoUri ? { photoUri: today.photoUri } : {}),
    };
    saveBody(entry);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Today's entry"
      subtitle="Leave anything you did not measure at zero"
      footer={<Button label="Save entry" variant="primary" fullWidth onPress={save} />}
    >
      <View style={{ gap: space.lg }}>
        <Stepper
          label="Bodyweight"
          value={draft.weight}
          onChange={(weight) => setDraft((d) => ({ ...d, weight }))}
          step={0.5}
          min={0}
          max={400}
          unit={unitLabel(unit)}
          formatValue={(v) => v.toFixed(1)}
        />

        <Stepper
          label="Body fat"
          value={draft.fat}
          onChange={(fat) => setDraft((d) => ({ ...d, fat }))}
          step={0.5}
          min={0}
          max={60}
          unit="%"
          formatValue={(v) => v.toFixed(1)}
        />

        <View style={{ gap: space.sm, marginTop: space.sm }}>
          <Text variant="label" tone="faint">
            Measurements · cm
          </Text>
          {MEASUREMENT_KEYS.map((k) => (
            <Stepper
              key={k}
              label={MEASUREMENT_LABELS[k]}
              value={draft.sizes[k]}
              onChange={(v) => setDraft((d) => ({ ...d, sizes: { ...d.sizes, [k]: v } }))}
              step={0.5}
              min={0}
              max={250}
              size="sm"
              unit="cm"
              formatValue={(v) => v.toFixed(1)}
            />
          ))}
        </View>
      </View>
    </Sheet>
  );
}
