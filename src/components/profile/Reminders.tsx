import React, { useState } from 'react';
import { View } from 'react-native';

import { Button, Chip, Sheet, Stepper, Text } from '@/components/kit';
import { Close, Plus } from '@/icons';
import { useTheme } from '@/theme';

const pad = (n: number) => `${n}`.padStart(2, '0');

function label(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/**
 * Times live on this device and in this session only — VOLT does not schedule
 * notifications, so the honest thing is to say so rather than imply a push.
 */
export function Reminders({
  times,
  onChange,
}: {
  times: number[];
  onChange: (next: number[]) => void;
}): React.JSX.Element {
  const { c, space } = useTheme();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(18 * 60);

  const add = () => {
    if (!times.includes(draft)) onChange([...times, draft].sort((a, b) => a - b));
    setOpen(false);
  };

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {times.map((t) => (
          <Chip
            key={t}
            label={label(t)}
            icon={Close}
            onPress={() => onChange(times.filter((x) => x !== t))}
            size="sm"
          />
        ))}
        <Chip label="Add a time" icon={Plus} onPress={() => setOpen(true)} size="sm" />
      </View>

      <Text variant="small" tone="faint">
        {times.length === 0
          ? 'No reminder times set.'
          : 'Kept on this device for the session. Nothing is pushed to you.'}
      </Text>

      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title="Reminder time"
        subtitle="Round numbers are easier to keep"
        footer={<Button label="Add time" variant="primary" fullWidth onPress={add} />}
      >
        <View style={{ gap: space.lg }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="display" numeric color={c.text}>
              {label(draft)}
            </Text>
          </View>
          <Stepper
            label="Hour"
            value={Math.floor(draft / 60)}
            onChange={(h) => setDraft(h * 60 + (draft % 60))}
            step={1}
            min={0}
            max={23}
          />
          <Stepper
            label="Minute"
            value={draft % 60}
            onChange={(m) => setDraft(Math.floor(draft / 60) * 60 + m)}
            step={15}
            min={0}
            max={45}
          />
        </View>
      </Sheet>
    </View>
  );
}
