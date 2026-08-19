import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { buildRoutines } from '@/data/templates';
import type { Routine } from '@/data/types';
import { ChevronRight } from '@/icons';
import { estimateMinutes } from '@/lib/estimate';
import { hairline, useTheme } from '@/theme';
import { Sheet, Text } from '@/components/kit';

export type TemplateSheetProps = {
  visible: boolean;
  onClose: () => void;
  /** Receives fresh copies of the template routines to save. */
  onAdd: (routines: Routine[], programme: string) => void;
};

type Programme = { key: string; name: string; body: string; ids: string[] };

const PROGRAMMES: Programme[] = [
  {
    key: 'ppl',
    name: 'Push · Pull · Legs',
    body: 'Three sessions, one per movement pattern. Runs at three or six days a week.',
    ids: ['r-push', 'r-pull', 'r-legs'],
  },
  {
    key: 'ul',
    name: 'Upper · Lower',
    body: 'Two sessions alternated. Four days covers everything twice.',
    ids: ['r-upper', 'r-lower'],
  },
  {
    key: 'fb',
    name: 'Full Body',
    body: 'One session that covers everything. The plan that survives a bad week.',
    ids: ['r-full'],
  },
];

/** Three proven splits, each one tap away from being your own routine. */
export function TemplateSheet({ visible, onClose, onAdd }: TemplateSheetProps) {
  const { c, space } = useTheme();
  const source = useMemo(() => buildRoutines(), []);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Start from a template"
      subtitle="A copy is added to your routines. Edit it however you like."
    >
      <View>
        {PROGRAMMES.map((p, i) => {
          const routines = p.ids.map((id) => source[id]).filter(Boolean);
          return (
            <Pressable
              key={p.key}
              accessibilityRole="button"
              accessibilityLabel={`Add ${p.name}`}
              onPress={() => onAdd(routines, p.name)}
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
              <View style={{ flex: 1, gap: space.xs }}>
                <Text variant="h2">{p.name}</Text>
                <Text variant="small" tone="muted">{p.body}</Text>
                <Text variant="small" tone="faint" numeric>
                  {routines
                    .map((r) => `${r.name} ${estimateMinutes(r)} min`)
                    .join('  ·  ')}
                </Text>
              </View>
              <ChevronRight size={20} color={c.textFaint} />
            </Pressable>
          );
        })}
      </View>
    </Sheet>
  );
}
