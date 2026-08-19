import React, { useCallback, useEffect } from 'react';
import { Modal, Pressable, ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Close } from '@/icons';
import { dur, hairline, springs, useReducedMotion, useTheme } from '@/theme';

import { IconButton } from './IconButton';
import { Text } from './Text';

export type SheetProps = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
  /** Pinned below the scroll area, above the home indicator. */
  footer?: React.ReactNode;
  /** Wrap children in a ScrollView. Defaults to true. */
  scrollable?: boolean;
  /** Fraction of the screen the sheet may occupy. Defaults to 0.88. */
  maxHeightRatio?: number;
  /** Hide the close button and ignore scrim taps — for a required choice. */
  dismissable?: boolean;
  /** Show the top-right close button. Defaults to true when dismissable. */
  showClose?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
};

const DISMISS_DISTANCE = 96;
const DISMISS_VELOCITY = 900;

/**
 * Bottom sheet. Drags to dismiss from the grabber, taps the scrim to close,
 * and never covers the home indicator.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  footer,
  scrollable = true,
  maxHeightRatio = 0.88,
  dismissable = true,
  showClose,
  contentStyle,
  testID,
}: SheetProps) {
  const { c, radius, space } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const y = useSharedValue(reduced ? 0 : 600);
  const scrim = useSharedValue(0);

  useEffect(() => {
    if (!visible) return;
    y.value = reduced ? 0 : withSpring(0, springs.sheet);
    scrim.value = reduced ? 1 : withTiming(1, { duration: dur.base });
  }, [reduced, scrim, visible, y]);

  const close = useCallback(() => {
    onClose();
  }, [onClose]);

  const pan = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetY(-12)
    .enabled(dismissable)
    .onUpdate((e) => {
      y.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        y.value = withTiming(700, { duration: dur.base });
        scrim.value = withTiming(0, { duration: dur.base });
        runOnJS(close)();
      } else {
        y.value = withSpring(0, springs.sheet);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const scrimStyle = useAnimatedStyle(() => ({ opacity: scrim.value }));

  const canClose = dismissable;
  const withClose = showClose ?? canClose;

  const body = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[
        { paddingHorizontal: space.xl, paddingBottom: space.xl },
        contentStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ paddingHorizontal: space.xl, paddingBottom: space.xl }, contentStyle]}>
      {children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={() => {
        if (canClose) close();
      }}
      testID={testID}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: c.scrim }, scrimStyle]}>
          <Pressable
            accessibilityLabel="Close"
            accessibilityRole="button"
            style={{ flex: 1 }}
            onPress={() => {
              if (canClose) close();
            }}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              maxHeight: `${Math.round(maxHeightRatio * 100)}%`,
              backgroundColor: c.bg,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              borderTopWidth: hairline,
              borderColor: c.border,
              paddingBottom: Math.max(insets.bottom, space.lg),
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={pan}>
            <View style={{ paddingTop: space.md, paddingHorizontal: space.xl }}>
              <View
                style={{
                  alignSelf: 'center',
                  width: 40,
                  height: 4,
                  borderRadius: radius.pill,
                  backgroundColor: c.borderStrong,
                }}
              />
              {title || withClose ? (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: space.md,
                    marginTop: space.lg,
                    marginBottom: subtitle ? space.md : space.lg,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    {title ? <Text variant="h1">{title}</Text> : null}
                    {subtitle ? (
                      <Text variant="small" tone="muted">
                        {subtitle}
                      </Text>
                    ) : null}
                  </View>
                  {withClose ? (
                    <IconButton icon={Close} label="Close" onPress={close} variant="surface" size={44} iconSize={18} />
                  ) : null}
                </View>
              ) : (
                <View style={{ height: space.lg }} />
              )}
            </View>
          </GestureDetector>

          {body}

          {footer ? (
            <View
              style={{
                paddingHorizontal: space.xl,
                paddingTop: space.md,
                borderTopWidth: hairline,
                borderColor: c.border,
              }}
            >
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </View>
    </Modal>
  );
}
