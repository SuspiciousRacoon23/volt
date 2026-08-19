import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import type { Exercise, ID, MuscleGroup } from '@/data/types';
import { ChevronRight, Search } from '@/icons';
import { hairline, useTheme } from '@/theme';
import { Chip, Sheet, Text } from '@/components/kit';

import { titleCase } from './plannerUtils';

export type ExercisePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  exercises: Record<ID, Exercise>;
  /** Ids already in the routine, marked so you do not add one twice by mistake. */
  usedIds?: ID[];
  title?: string;
  onPick: (exerciseId: ID) => void;
};

const FILTERS: MuscleGroup[] = ['chest', 'back', 'shoulders', 'quads', 'hamstrings', 'glutes', 'biceps', 'triceps', 'core'];

/** Search the library and drop one exercise into the routine. */
export function ExercisePickerSheet({
  visible, onClose, exercises, usedIds = [], title = 'Add an exercise', onPick,
}: ExercisePickerSheetProps) {
  const { c, radius, space } = useTheme();
  const [query, setQuery] = useState('');
  const [muscle, setMuscle] = useState<MuscleGroup | null>(null);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.values(exercises)
      .filter((e) => (muscle ? e.primary.includes(muscle) : true))
      .filter((e) => (q ? e.name.toLowerCase().includes(q) || e.equipment.includes(q) : true))
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(0, 80);
  }, [exercises, muscle, query]);

  const used = new Set(usedIds);

  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle="Search by name or equipment.">
      <View style={{ gap: space.lg }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            height: 52,
            paddingHorizontal: space.md,
            borderRadius: radius.lg,
            backgroundColor: c.surfaceAlt,
          }}
        >
          <Search size={18} color={c.textFaint} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Bench press"
            placeholderTextColor={c.textFaint}
            autoCorrect={false}
            style={{ flex: 1, color: c.text, fontSize: 16, fontWeight: '500' }}
          />
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
          <Chip label="All" size="sm" selected={muscle === null} onPress={() => setMuscle(null)} />
          {FILTERS.map((m) => (
            <Chip
              key={m}
              label={titleCase(m)}
              size="sm"
              selected={muscle === m}
              onPress={() => setMuscle(muscle === m ? null : m)}
            />
          ))}
        </View>

        <View>
          {list.length === 0 ? (
            <Text variant="body" tone="muted">Nothing matches that. Try a shorter word.</Text>
          ) : null}
          {list.map((e, i) => (
            <Pressable
              key={e.id}
              accessibilityRole="button"
              accessibilityLabel={`Add ${e.name}`}
              onPress={() => onPick(e.id)}
              style={({ pressed }) => ({
                minHeight: 60,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingVertical: space.md,
                borderTopWidth: i === 0 ? 0 : hairline,
                borderTopColor: c.border,
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" weight="700" numberOfLines={1}>{e.name}</Text>
                <Text variant="small" tone="faint" numberOfLines={1}>
                  {`${titleCase(e.equipment)} · ${e.primary.map(titleCase).join(', ')}`}
                </Text>
              </View>
              {used.has(e.id) ? (
                <Text variant="small" tone="faint">In routine</Text>
              ) : null}
              <ChevronRight size={18} color={c.textFaint} />
            </Pressable>
          ))}
        </View>
      </View>
    </Sheet>
  );
}
