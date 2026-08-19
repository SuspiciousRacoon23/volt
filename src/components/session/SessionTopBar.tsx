import React from 'react';
import { View } from 'react-native';

import { Button, IconButton, ProgressBar, Text } from '@/components/kit';
import type { Unit } from '@/data/types';
import { ChevronDown } from '@/icons';
import { fmtVolume } from '@/lib/units';
import { useTheme } from '@/theme';

export type SessionTopBarProps = {
  name: string;
  elapsedMs: number;
  volumeKg: number;
  unit: Unit;
  index: number;
  total: number;
  /** 0..1 across every set in the session. */
  progress: number;
  onClose: () => void;
  onFinish: () => void;
};

/** Running clock: m:ss, and h:mm:ss once the session passes an hour. */
function clock(value: number): string {
  const total = Math.max(0, Math.floor(value / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${s}`;
  return `${m}:${s}`;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 1 }}>
      <Text variant="label" tone="faint">
        {label}
      </Text>
      <Text variant="body" numeric weight="700">
        {value}
      </Text>
    </View>
  );
}

/** Slim, factual, and out of the way. Nothing here competes with the set. */
export function SessionTopBar({
  name,
  elapsedMs,
  volumeKg,
  unit,
  index,
  total,
  progress,
  onClose,
  onFinish,
}: SessionTopBarProps) {
  const { space } = useTheme();

  return (
    <View style={{ gap: space.sm, paddingHorizontal: space.lg, paddingBottom: space.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <IconButton
          icon={ChevronDown}
          label="Leave the session running and go back"
          variant="surface"
          size={44}
          onPress={onClose}
        />

        <View style={{ flex: 1, flexDirection: 'row', gap: space.xl }}>
          <Stat label="Elapsed" value={clock(elapsedMs)} />
          <Stat label="Volume" value={fmtVolume(volumeKg, unit)} />
          <Stat label="Exercise" value={`${index + 1}/${total}`} />
        </View>

        <Button label="Finish" variant="secondary" size="sm" onPress={onFinish} />
      </View>

      <View style={{ gap: 4 }}>
        <ProgressBar value={progress} tone="neutral" height={3} accessibilityLabel={`${Math.round(progress * 100)} percent of sets logged`} />
        <Text variant="label" tone="faint" numberOfLines={1}>
          {name}
        </Text>
      </View>
    </View>
  );
}
