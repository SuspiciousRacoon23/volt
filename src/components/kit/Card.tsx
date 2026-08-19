import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { tap as hapticTap } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

import { Text } from './Text';
import { usePressAnim } from './press';

export type CardProps = {
  children?: React.ReactNode;
  /** Small uppercase label rendered above the content. */
  title?: string;
  /** Node placed at the right of the title row. */
  headerRight?: React.ReactNode;
  onPress?: () => void;
  /** `plain` sits on the page, `raised` lifts off it, `flat` has no border. */
  tone?: 'plain' | 'raised' | 'flat' | 'accent';
  padding?: number;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
};

/** The container everything in VOLT sits inside. Rounded, quiet, generous. */
export function Card({
  children,
  title,
  headerRight,
  onPress,
  tone = 'plain',
  padding,
  style,
  testID,
  accessibilityLabel,
}: CardProps) {
  const { c, radius, space, shadow } = useTheme();
  const anim = usePressAnim(0.985);

  const pad = padding ?? space.lg;

  const surface: ViewStyle =
    tone === 'accent'
      ? { backgroundColor: c.accentSoft, borderWidth: hairline, borderColor: c.accent }
      : tone === 'flat'
        ? { backgroundColor: c.surface }
        : { backgroundColor: c.surface, borderWidth: hairline, borderColor: c.border };

  const body = (
    <>
      {title || headerRight ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: space.md,
            minHeight: 16,
          }}
        >
          {title ? (
            <Text variant="label" tone="faint">
              {title}
            </Text>
          ) : (
            <View />
          )}
          {headerRight}
        </View>
      ) : null}
      {children}
    </>
  );

  const container: StyleProp<ViewStyle> = [
    surface,
    { borderRadius: radius.lg, padding: pad },
    tone === 'raised' ? shadow.card : null,
    style,
  ];

  if (!onPress) {
    return (
      <View testID={testID} style={container}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        hapticTap();
        onPress();
      }}
      onPressIn={anim.onPressIn}
      onPressOut={anim.onPressOut}
    >
      <Animated.View style={[container, anim.style]}>{body}</Animated.View>
    </Pressable>
  );
}
