import React from 'react';
import { TextInput, View } from 'react-native';

import { Button, Sheet, Text } from '@/components/kit';
import { hairline, useTheme } from '@/theme';

export type NoteSheetProps = {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  value: string;
  onChange: (v: string) => void;
};

/** A note against one exercise. Saved as it is typed. */
export function NoteSheet({ visible, onClose, exerciseName, value, onChange }: NoteSheetProps) {
  const { c, radius, space } = useTheme();

  return (
    <Sheet visible={visible} onClose={onClose} title="Note" subtitle={exerciseName} scrollable={false}>
      <View style={{ gap: space.md, paddingBottom: space.lg }}>
        <TextInput
          value={value}
          onChangeText={onChange}
          multiline
          autoCorrect
          placeholder="Bar felt heavy on the third set. Elbows drifting."
          placeholderTextColor={c.textFaint}
          style={{
            minHeight: 132,
            padding: space.lg,
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
          Saved as you type.
        </Text>
        <Button label="Done" variant="secondary" size="lg" fullWidth onPress={onClose} />
      </View>
    </Sheet>
  );
}
