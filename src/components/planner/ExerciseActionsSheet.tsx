import React from 'react';
import { Pressable, View } from 'react-native';

import type { GroupKind } from '@/data/types';
import { ChevronDown, ChevronUp, Close, Duplicate, Superset, Swap, Trash, type IconProps } from '@/icons';
import { hairline, useTheme } from '@/theme';
import { Sheet, Text } from '@/components/kit';

export type ActionRowProps = {
  icon: React.ComponentType<IconProps>;
  label: string;
  hint?: string;
  danger?: boolean;
  first?: boolean;
  onPress: () => void;
};

/** One line in a sheet menu: icon, label, quiet explanation underneath. */
export function ActionRow({ icon: Icon, label, hint, danger, first, onPress }: ActionRowProps) {
  const { c, space } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.md,
        paddingVertical: space.md,
        borderTopWidth: first ? 0 : hairline,
        borderTopColor: c.border,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon size={20} color={danger ? c.danger : c.text} />
      <View style={{ flex: 1, gap: 1 }}>
        <Text variant="body" weight="700" tone={danger ? 'danger' : 'default'}>{label}</Text>
        {hint ? <Text variant="small" tone="faint">{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

export type ExerciseActionsSheetProps = {
  visible: boolean;
  onClose: () => void;
  name: string;
  canGroupNext: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  groupKind: GroupKind | null;
  onReplace: () => void;
  onDuplicate: () => void;
  onGroupNext: (kind: GroupKind) => void;
  onSetGroupKind: (kind: GroupKind) => void;
  onUngroup: () => void;
  onMoveTop: () => void;
  onMoveBottom: () => void;
  onRemove: () => void;
};

/** Everything you can do to one exercise, behind one button. */
export function ExerciseActionsSheet({
  visible, onClose, name, canGroupNext, canMoveUp, canMoveDown, groupKind,
  onReplace, onDuplicate, onGroupNext, onSetGroupKind, onUngroup,
  onMoveTop, onMoveBottom, onRemove,
}: ExerciseActionsSheetProps) {
  const grouped = groupKind !== null;

  return (
    <Sheet visible={visible} onClose={onClose} title={name}>
      <View>
        <ActionRow
          first
          icon={Swap}
          label="Replace exercise"
          hint="Keeps the sets, swaps the movement."
          onPress={onReplace}
        />
        <ActionRow
          icon={Duplicate}
          label="Duplicate"
          hint="Adds a copy directly below."
          onPress={onDuplicate}
        />

        {!grouped && canGroupNext ? (
          <ActionRow
            icon={Superset}
            label="Superset with the next exercise"
            hint="Alternate the two, rest once at the end."
            onPress={() => onGroupNext('superset')}
          />
        ) : null}
        {!grouped && canGroupNext ? (
          <ActionRow
            icon={Superset}
            label="Circuit with the next exercise"
            hint="Move straight through, minimal rest."
            onPress={() => onGroupNext('circuit')}
          />
        ) : null}

        {grouped && canGroupNext ? (
          <ActionRow
            icon={Superset}
            label="Add the next exercise to the group"
            onPress={() => onGroupNext(groupKind ?? 'superset')}
          />
        ) : null}
        {grouped ? (
          <ActionRow
            icon={Superset}
            label={groupKind === 'circuit' ? 'Make it a superset' : 'Make it a circuit'}
            onPress={() => onSetGroupKind(groupKind === 'circuit' ? 'superset' : 'circuit')}
          />
        ) : null}
        {grouped ? (
          <ActionRow icon={Close} label="Remove from the group" onPress={onUngroup} />
        ) : null}

        {canMoveUp ? (
          <ActionRow icon={ChevronUp} label="Move to the top" onPress={onMoveTop} />
        ) : null}
        {canMoveDown ? (
          <ActionRow icon={ChevronDown} label="Move to the bottom" onPress={onMoveBottom} />
        ) : null}

        <ActionRow icon={Trash} label="Remove exercise" danger onPress={onRemove} />
      </View>
    </Sheet>
  );
}
