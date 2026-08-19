import React from 'react';
import { TextInput, View } from 'react-native';

import { fmtClock } from '@/lib/dates';
import { hairline, useTheme } from '@/theme';
import { Chip, Sheet, Stepper, Text } from '@/components/kit';

export type RestNotesSheetProps = {
  visible: boolean;
  onClose: () => void;
  name: string;
  restSec: number;
  notes: string;
  onChangeRest: (sec: number) => void;
  onChangeNotes: (notes: string) => void;
};

const PRESETS = [60, 90, 120, 180, 240];

/** Rest and the one line of coaching you want to see mid-set. Saves as you type. */
export function RestNotesSheet({
  visible, onClose, name, restSec, notes, onChangeRest, onChangeNotes,
}: RestNotesSheetProps) {
  const { c, radius, space } = useTheme();

  return (
    <Sheet visible={visible} onClose={onClose} title="Rest and notes" subtitle={name}>
      <View style={{ gap: space.xl }}>
        <View style={{ gap: space.md }}>
          <Stepper
            label="Rest between sets"
            value={restSec}
            min={0}
            max={600}
            step={15}
            formatValue={(v) => fmtClock(v)}
            onChange={onChangeRest}
          />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {PRESETS.map((p) => (
              <Chip
                key={p}
                size="sm"
                label={fmtClock(p)}
                selected={restSec === p}
                onPress={() => onChangeRest(p)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: space.sm }}>
          <Text variant="label" tone="faint">Note</Text>
          <TextInput
            value={notes}
            onChangeText={onChangeNotes}
            multiline
            placeholder="Add 2.5 kg once all sets hit the target."
            placeholderTextColor={c.textFaint}
            style={{
              minHeight: 96,
              padding: space.md,
              borderRadius: radius.md,
              borderWidth: hairline,
              borderColor: c.border,
              backgroundColor: c.surfaceAlt,
              color: c.text,
              fontSize: 16,
              lineHeight: 22,
              textAlignVertical: 'top',
            }}
          />
          <Text variant="small" tone="faint">
            You will see this while the exercise is in focus during a workout.
          </Text>
        </View>
      </View>
    </Sheet>
  );
}
