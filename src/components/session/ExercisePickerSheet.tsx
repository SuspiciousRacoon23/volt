import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Sheet, Text } from '@/components/kit';
import type { Exercise, ID } from '@/data/types';
import { ChevronRight, Search } from '@/icons';
import { press as hapticPress } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

export type PickerGroup = { label: string; items: Exercise[] };

export type ExercisePickerSheetProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  groups: PickerGroup[];
  searchable?: boolean;
  onPick: (id: ID) => void;
};

function meta(e: Exercise): string {
  const muscle = e.primary[0] ?? '';
  return [e.equipment, muscle].filter(Boolean).join(' · ');
}

/** Shared picker for replacing an exercise and for adding an unplanned one. */
export function ExercisePickerSheet({
  visible,
  onClose,
  title,
  subtitle,
  groups,
  searchable = false,
  onPick,
}: ExercisePickerSheetProps) {
  const { c, radius, space } = useTheme();
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    const all = groups.flatMap((g) => g.items);
    const seen = new Set<ID>();
    const items = all.filter((e) => {
      if (seen.has(e.id)) return false;
      seen.add(e.id);
      return e.name.toLowerCase().includes(q) || e.primary.some((m) => m.includes(q)) || e.equipment.includes(q);
    });
    return [{ label: `${items.length} match${items.length === 1 ? '' : 'es'}`, items: items.slice(0, 40) }];
  }, [groups, query]);

  return (
    <Sheet visible={visible} onClose={onClose} title={title} subtitle={subtitle}>
      <View style={{ gap: space.lg, paddingBottom: space.lg }}>
        {searchable ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.sm,
              height: 52,
              paddingHorizontal: space.md,
              borderRadius: radius.md,
              borderWidth: hairline,
              borderColor: c.border,
              backgroundColor: c.surfaceAlt,
            }}>
            <Search size={18} color={c.textFaint} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search exercises"
              placeholderTextColor={c.textFaint}
              autoCorrect={false}
              returnKeyType="search"
              style={{ flex: 1, color: c.text, fontSize: 16, fontWeight: '500' }}
            />
          </View>
        ) : null}

        {shown.map((group) => (
          <View key={group.label} style={{ gap: space.xs }}>
            <Text variant="label" tone="faint">
              {group.label}
            </Text>
            {group.items.length === 0 ? (
              <Text variant="small" tone="muted">
                Nothing here yet.
              </Text>
            ) : (
              group.items.map((e) => (
                <Pressable
                  key={e.id}
                  accessibilityRole="button"
                  accessibilityLabel={e.name}
                  onPress={() => {
                    hapticPress();
                    onPick(e.id);
                  }}
                  style={({ pressed }) => ({
                    minHeight: 60,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    paddingHorizontal: space.md,
                    borderRadius: radius.md,
                    backgroundColor: pressed ? c.surfaceAlt : 'transparent',
                  })}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body" weight="700">
                      {e.name}
                    </Text>
                    <Text variant="small" tone="faint">
                      {meta(e)}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={c.textFaint} />
                </Pressable>
              ))
            )}
          </View>
        ))}
      </View>
    </Sheet>
  );
}
