import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Sheet, Text } from '@/components/kit';
import type { AppState, ID } from '@/data';
import { Check, Search } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { trainedRanking } from './progressData';

/** Choose which lift the strength panel is showing. Trained lifts only. */
export function ExercisePicker({
  visible,
  onClose,
  state,
  value,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  state: AppState;
  value: ID | null;
  onSelect: (id: ID) => void;
}) {
  const { c, radius, space } = useTheme();
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const all = trainedRanking(state);
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((r) => state.exercises[r.id].name.toLowerCase().includes(q));
  }, [query, state]);

  return (
    <Sheet visible={visible} onClose={onClose} title="Choose a lift" subtitle="Lifts you have logged">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          height: 48,
          paddingHorizontal: space.lg,
          borderRadius: radius.md,
          backgroundColor: c.surfaceAlt,
          borderWidth: hairline,
          borderColor: c.border,
          marginBottom: space.lg,
        }}
      >
        <Search size={18} color={c.textFaint} strokeWidth={2} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search"
          placeholderTextColor={c.textFaint}
          autoCorrect={false}
          style={{ flex: 1, color: c.text, fontSize: 16, fontWeight: '500' }}
        />
      </View>

      {rows.length === 0 ? (
        <Text variant="small" tone="muted">
          No logged lift matches that.
        </Text>
      ) : null}

      <View style={{ gap: 2 }}>
        {rows.map((r) => {
          const active = r.id === value;
          return (
            <Pressable
              key={r.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => {
                onSelect(r.id);
                onClose();
              }}
              style={{
                minHeight: 56,
                flexDirection: 'row',
                alignItems: 'center',
                gap: space.md,
                paddingHorizontal: space.lg,
                borderRadius: radius.md,
                backgroundColor: active ? c.surfaceAlt : 'transparent',
              }}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text variant="body" weight="600" numberOfLines={1}>
                  {state.exercises[r.id].name}
                </Text>
                <Text variant="small" tone="faint" numeric>
                  {r.count} {r.count === 1 ? 'session' : 'sessions'}
                </Text>
              </View>
              {active ? <Check size={20} color={c.text} strokeWidth={2} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
