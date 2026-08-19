import React from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { Close, Search } from '@/icons';
import { hairline, useTheme } from '@/theme';

export type SearchFieldProps = {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
};

/** Always visible, never inside the scroll. Typing is the fastest filter. */
export function SearchField({ value, onChange, placeholder = 'Search exercises' }: SearchFieldProps) {
  const { c, radius, space } = useTheme();

  return (
    <View
      style={{
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        gap: space.sm,
        paddingHorizontal: space.lg - 2,
        borderRadius: radius.md,
        backgroundColor: c.surfaceAlt,
        borderWidth: hairline,
        borderColor: value ? c.borderStrong : c.border,
      }}
    >
      <Search size={18} color={value ? c.text : c.textFaint} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={c.textFaint}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="never"
        accessibilityLabel="Search exercises"
        style={{
          flex: 1,
          color: c.text,
          fontSize: 16,
          fontWeight: '500',
          paddingVertical: 0,
        }}
      />
      {value.length > 0 ? (
        <Pressable
          onPress={() => onChange('')}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          hitSlop={12}
          style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
        >
          <Close size={16} color={c.textMuted} strokeWidth={2} />
        </Pressable>
      ) : null}
    </View>
  );
}
