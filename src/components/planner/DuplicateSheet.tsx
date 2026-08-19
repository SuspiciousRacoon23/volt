import React from 'react';
import { Pressable, View } from 'react-native';

import { sessionSetCount, sessionVolume } from '@/data/selectors';
import type { Session, Unit } from '@/data/types';
import { ChevronRight } from '@/icons';
import { dateLabel, relative } from '@/lib/dates';
import { fmtVolume } from '@/lib/units';
import { hairline, useTheme } from '@/theme';
import { EmptyState, Sheet, Text } from '@/components/kit';

export type DuplicateSheetProps = {
  visible: boolean;
  onClose: () => void;
  sessions: Session[];
  unit: Unit;
  onPick: (session: Session) => void;
};

/** Turn a workout you already did back into a routine, weights included. */
export function DuplicateSheet({ visible, onClose, sessions, unit, onPick }: DuplicateSheetProps) {
  const { c, space } = useTheme();

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Duplicate a workout"
      subtitle="The sets you logged become the targets of a new routine."
    >
      <View>
        {sessions.length === 0 ? (
          <EmptyState
            variant="inline"
            title="No finished workouts yet"
            body="Once you complete a session it will show up here."
          />
        ) : null}

        {sessions.map((s, i) => (
          <Pressable
            key={s.id}
            accessibilityRole="button"
            accessibilityLabel={`Duplicate ${s.name} from ${dateLabel(s.startedAt)}`}
            onPress={() => onPick(s)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              paddingVertical: space.lg,
              borderTopWidth: i === 0 ? 0 : hairline,
              borderTopColor: c.border,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="body" weight="700" numberOfLines={1}>{s.name}</Text>
              <Text variant="small" tone="faint" numeric>
                {`${dateLabel(s.startedAt)} · ${relative(s.startedAt)}`}
              </Text>
              <Text variant="small" tone="muted" numeric>
                {`${s.exercises.length} exercises · ${sessionSetCount(s)} sets · ${fmtVolume(sessionVolume(s), unit)}`}
              </Text>
            </View>
            <ChevronRight size={20} color={c.textFaint} />
          </Pressable>
        ))}
      </View>
    </Sheet>
  );
}
