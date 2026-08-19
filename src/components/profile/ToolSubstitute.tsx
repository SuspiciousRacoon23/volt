import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Chip, Divider, Text } from '@/components/kit';
import { useStore } from '@/data/store';
import type { Exercise } from '@/data/types';
import { ChevronRight, Search, Swap } from '@/icons';
import { press as hapticPress } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

function overlap(a: readonly string[], b: readonly string[]): number {
  return a.filter((x) => b.includes(x)).length;
}

/**
 * Ranked by what the movement actually trains, not by name. A listed alternate
 * always wins; after that, matching the pattern matters more than matching the kit.
 */
function score(source: Exercise, candidate: Exercise): number {
  if (candidate.id === source.id) return -1;
  let n = 0;
  if (source.alternates.includes(candidate.id)) n += 100;
  if (candidate.movement === source.movement) n += 6;
  n += overlap(source.primary, candidate.primary) * 5;
  n += overlap(source.primary, candidate.secondary) * 2;
  n += overlap(source.secondary, candidate.primary) * 1;
  if (candidate.equipment !== source.equipment) n += 2;
  if (candidate.unilateral === source.unilateral) n += 1;
  return n;
}

export function ToolSubstitute({ onNavigate }: { onNavigate?: () => void }): React.JSX.Element {
  const state = useStore();
  const { c, space, radius } = useTheme();
  const [query, setQuery] = useState('');
  const [sourceId, setSourceId] = useState<string | null>(null);

  const all = useMemo(() => Object.values(state.exercises), [state.exercises]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const pool = q
      ? all.filter((e) => e.name.toLowerCase().includes(q))
      : [...all].sort((a, b) => (b.lastUsed ?? 0) - (a.lastUsed ?? 0));
    return pool.slice(0, 8);
  }, [all, query]);

  const source = sourceId ? state.exercises[sourceId] : null;

  const options = useMemo(() => {
    if (!source) return [];
    return all
      .map((e) => ({ e, n: score(source, e) }))
      .filter((x) => x.n > 4)
      .sort((a, b) => b.n - a.n)
      .slice(0, 6);
  }, [all, source]);

  const open = (id: string) => {
    hapticPress();
    onNavigate?.();
    router.push({ pathname: '/exercise/[id]', params: { id } });
  };

  return (
    <View style={{ gap: space.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: space.sm,
          backgroundColor: c.surfaceAlt,
          borderRadius: radius.md,
          paddingHorizontal: space.md,
          height: 52,
        }}
      >
        <Search size={18} color={c.textFaint} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Find the exercise you want to replace"
          placeholderTextColor={c.textFaint}
          style={{ flex: 1, color: c.text, fontSize: 16, fontWeight: '500' }}
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
        {matches.map((e) => (
          <Chip
            key={e.id}
            label={e.name}
            selected={e.id === sourceId}
            onPress={() => setSourceId(e.id)}
            size="sm"
          />
        ))}
      </View>

      {source ? (
        <View style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm }}>
            <Swap size={18} color={c.textMuted} />
            <Text variant="small" tone="muted" style={{ flex: 1 }}>
              Trains {source.primary.join(', ')} — closest matches first.
            </Text>
          </View>

          {options.length === 0 ? (
            <Text variant="small" tone="faint">
              Nothing in your library trains this closely enough to swap safely.
            </Text>
          ) : (
            options.map((o, i) => (
              <View key={o.e.id}>
                {i > 0 ? <Divider spacing={4} /> : null}
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={o.e.name}
                  onPress={() => open(o.e.id)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: space.md,
                    minHeight: 56,
                    paddingVertical: space.sm,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text variant="body">{o.e.name}</Text>
                    <Text variant="small" tone="faint">
                      {o.e.equipment} · {o.e.primary.join(', ')}
                      {source.alternates.includes(o.e.id) ? ' · listed alternate' : ''}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={c.textFaint} />
                </Pressable>
              </View>
            ))
          )}
        </View>
      ) : (
        <View
          style={{
            borderRadius: radius.md,
            borderWidth: hairline,
            borderColor: c.border,
            padding: space.lg,
          }}
        >
          <Text variant="small" tone="faint">
            Pick an exercise to see what can stand in for it — a busy rack, a
            missing machine, a joint that objects today.
          </Text>
        </View>
      )}
    </View>
  );
}
