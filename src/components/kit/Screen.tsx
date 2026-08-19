import React from 'react';
import {
  ScrollView,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronLeft } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export type ScreenProps = {
  children?: React.ReactNode;
  /** Large page title. Omit for a screen that owns its own header. */
  title?: string;
  subtitle?: string;
  /** Node placed at the right of the title row — usually an `IconButton`. */
  headerRight?: React.ReactNode;
  /** Shows a back control at the left of the title row. */
  onBack?: () => void;
  /** Replaces the entire default header. */
  header?: React.ReactNode;
  /** Scrolls by default. Set false for a screen that manages its own list. */
  scroll?: boolean;
  /** Horizontal page padding. Defaults to 20. */
  padded?: boolean;
  /** Pinned above the home indicator, e.g. a primary action bar. */
  footer?: React.ReactNode;
  /** Extra bottom padding so content clears a floating tab bar. */
  bottomInset?: number;
  refreshControl?: ScrollViewProps['refreshControl'];
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * The page frame: safe areas, one scroll container, one header slot.
 * Every screen in VOLT starts here so spacing stays identical throughout.
 */
export function Screen({
  children,
  title,
  subtitle,
  headerRight,
  onBack,
  header,
  scroll = true,
  padded = true,
  footer,
  bottomInset = 0,
  refreshControl,
  contentStyle,
  style,
  testID,
}: ScreenProps) {
  const { c, space } = useTheme();
  const insets = useSafeAreaInsets();

  const padH = padded ? space.xl : 0;

  const head =
    header ??
    (title || headerRight || onBack ? (
      <View
        style={{
          paddingHorizontal: padH,
          paddingTop: space.sm,
          paddingBottom: space.lg,
          gap: space.sm,
        }}
      >
        {onBack ? (
          <View style={{ marginLeft: -10, marginBottom: space.xs }}>
            <IconButton icon={ChevronLeft} label="Back" onPress={onBack} iconSize={22} />
          </View>
        ) : null}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: space.md,
          }}
        >
          <View style={{ flex: 1, gap: 2 }}>
            {title ? (
              <Text variant="title" numberOfLines={2}>
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text variant="small" tone="muted">
                {subtitle}
              </Text>
            ) : null}
          </View>
          {headerRight}
        </View>
      </View>
    ) : null);

  const padBottom = (footer ? space.lg : insets.bottom + space.xxl) + bottomInset;

  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      contentContainerStyle={[
        { paddingHorizontal: padH, paddingBottom: padBottom },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1, paddingHorizontal: padH, paddingBottom: padBottom }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <View
      testID={testID}
      style={[{ flex: 1, backgroundColor: c.bg, paddingTop: insets.top }, style]}
    >
      {head}
      {body}
      {footer ? (
        <View
          style={{
            paddingHorizontal: padH || space.xl,
            paddingTop: space.md,
            paddingBottom: Math.max(insets.bottom, space.md),
            borderTopWidth: hairline,
            borderTopColor: c.border,
            backgroundColor: c.bg,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
  );
}
