import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { hairline, useTheme } from '@/theme';

export type DividerProps = {
  /** Left/right inset in points. */
  inset?: number;
  vertical?: boolean;
  /** Vertical space above and below. */
  spacing?: number;
  strong?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Divider({ inset = 0, vertical = false, spacing = 0, strong = false, style }: DividerProps) {
  const { c } = useTheme();
  const colour = strong ? c.borderStrong : c.border;

  if (vertical) {
    return (
      <View
        style={[{ width: hairline, alignSelf: 'stretch', backgroundColor: colour, marginHorizontal: spacing }, style]}
      />
    );
  }

  return (
    <View
      style={[
        { height: hairline, backgroundColor: colour, marginLeft: inset, marginRight: inset, marginVertical: spacing },
        style,
      ]}
    />
  );
}
