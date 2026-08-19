import React, { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import type { IconProps } from '@/icons';
import { select as hapticSelect } from '@/lib/haptics';
import { hairline, springs, useReducedMotion, useTheme } from '@/theme';

import { Text } from './Text';

export type SegmentedItem<T extends string = string> = {
  value: T;
  label: string;
  icon?: React.ComponentType<IconProps>;
};

export type SegmentedProps<T extends string = string> = {
  items: readonly SegmentedItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** 44 by default; 52 for a primary in-screen switch. */
  height?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** A sliding-thumb switch. The thumb is a raised surface, never lime. */
export function Segmented<T extends string = string>({
  items,
  value,
  onChange,
  height = 44,
  disabled = false,
  style,
  testID,
}: SegmentedProps<T>) {
  const { c, radius, space, shadow } = useTheme();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);

  const index = Math.max(
    0,
    items.findIndex((i) => i.value === value),
  );
  const count = Math.max(1, items.length);
  const seg = width > 0 ? (width - 4) / count : 0;

  const x = useSharedValue(0);

  useEffect(() => {
    const target = index * seg;
    x.value = reduced ? target : withSpring(target, springs.glide);
  }, [index, reduced, seg, x]);

  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  return (
    <View
      testID={testID}
      onLayout={onLayout}
      accessibilityRole="tablist"
      style={[
        {
          height,
          flexDirection: 'row',
          padding: 2,
          borderRadius: radius.md,
          backgroundColor: c.surfaceAlt,
          borderWidth: hairline,
          borderColor: c.border,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {seg > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 2,
              left: 2,
              width: seg,
              height: height - 4 - hairline * 2,
              borderRadius: radius.md - 3,
              backgroundColor: c.bg,
            },
            shadow.card,
            thumb,
          ]}
        />
      ) : null}

      {items.map((item) => {
        const active = item.value === value;
        const Icon = item.icon;
        return (
          <Pressable
            key={item.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled }}
            accessibilityLabel={item.label}
            disabled={disabled}
            onPress={() => {
              if (active) return;
              hapticSelect();
              onChange(item.value);
            }}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space.xs + 2,
            }}
          >
            {Icon ? (
              <Icon size={16} color={active ? c.text : c.textFaint} strokeWidth={2} />
            ) : null}
            <Text
              variant="small"
              weight="700"
              color={active ? c.text : c.textMuted}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
