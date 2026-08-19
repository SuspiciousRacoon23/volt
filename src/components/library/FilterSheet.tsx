import React from 'react';
import { View } from 'react-native';

import { Button, Chip, Sheet, Text } from '@/components/kit';
import type { Equipment, Movement, MuscleGroup } from '@/data/types';
import { EQUIPMENT, MOVEMENTS, MUSCLE_GROUPS } from '@/data/types';
import { useTheme } from '@/theme';

import { EQUIPMENT_LABEL, MOVEMENT_LABEL, MUSCLE_LABEL } from './labels';

export type Filters = {
  muscles: MuscleGroup[];
  equipment: Equipment[];
  movements: Movement[];
};

export type FilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  value: Filters;
  onChange: (next: Filters) => void;
  /** How many exercises the current selection matches. */
  matches: number;
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Group<T extends string>({
  title,
  items,
  labels,
  selected,
  onToggle,
}: {
  title: string;
  items: readonly T[];
  labels: Record<T, string>;
  selected: readonly T[];
  onToggle: (item: T) => void;
}) {
  const { space } = useTheme();
  return (
    <View style={{ gap: space.md }}>
      <Text variant="label" tone="faint">
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {items.map((item) => (
          <Chip
            key={item}
            label={labels[item]}
            size="sm"
            selected={selected.includes(item)}
            onPress={() => onToggle(item)}
          />
        ))}
      </View>
    </View>
  );
}

export function FilterSheet({ visible, onClose, value, onChange, matches }: FilterSheetProps) {
  const { space } = useTheme();
  const active = value.muscles.length + value.equipment.length + value.movements.length;

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Filters"
      subtitle={active ? `${matches} exercises match` : 'Narrow the list down'}
      footer={
        <View style={{ flexDirection: 'row', gap: space.md }}>
          <Button
            label="Clear"
            variant="ghost"
            size="lg"
            disabled={active === 0}
            onPress={() => onChange({ muscles: [], equipment: [], movements: [] })}
            style={{ flex: 1 }}
          />
          <Button label="Show results" variant="primary" size="lg" onPress={onClose} style={{ flex: 2 }} />
        </View>
      }
    >
      <View style={{ gap: space.xxl, paddingBottom: space.lg }}>
        <Group
          title="Muscle group"
          items={MUSCLE_GROUPS}
          labels={MUSCLE_LABEL}
          selected={value.muscles}
          onToggle={(m) => onChange({ ...value, muscles: toggle(value.muscles, m) })}
        />
        <Group
          title="Equipment"
          items={EQUIPMENT}
          labels={EQUIPMENT_LABEL}
          selected={value.equipment}
          onToggle={(e) => onChange({ ...value, equipment: toggle(value.equipment, e) })}
        />
        <Group
          title="Movement"
          items={MOVEMENTS}
          labels={MOVEMENT_LABEL}
          selected={value.movements}
          onToggle={(m) => onChange({ ...value, movements: toggle(value.movements, m) })}
        />
      </View>
    </Sheet>
  );
}
