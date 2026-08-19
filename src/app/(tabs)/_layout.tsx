import { Tabs, type BottomTabBarProps } from 'expo-router/js-tabs';
import React, { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { Barbell, Chart, Library, Profile, Today, type IconProps } from '@/icons';
import { select as hapticSelect } from '@/lib/haptics';
import { dur, hairline, ms, springs, useReducedMotion, useTheme } from '@/theme';

type IconComponent = (props: IconProps) => React.JSX.Element;

/** Route name → mark. Order here is the order on screen. */
const TABS: { name: string; label: string; Icon: IconComponent }[] = [
  { name: 'index', label: 'Today', Icon: Today as IconComponent },
  { name: 'train', label: 'Train', Icon: Barbell as IconComponent },
  { name: 'progress', label: 'Progress', Icon: Chart as IconComponent },
  { name: 'library', label: 'Library', Icon: Library as IconComponent },
  { name: 'profile', label: 'Profile', Icon: Profile as IconComponent },
];

const BAR_HEIGHT = 62;

export default function TabsLayout(): React.JSX.Element {
  const { c } = useTheme();

  return (
    <Tabs
      tabBar={(props: BottomTabBarProps) => <VoltTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: c.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: 'Today' }} />
      <Tabs.Screen name="train" options={{ title: 'Train' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}

/* --------------------------------------------------------------- the bar */

/**
 * A floating rail rather than a framework tab bar: hairline border, soft lift,
 * and a single lime mark for where you are. It sits in the layout flow, so a
 * screen never has to guess how much room to leave under its content.
 */
function VoltTabBar({ state, descriptors, navigation, insets }: BottomTabBarProps): React.JSX.Element {
  const { c, radius, space, shadow } = useTheme();

  const onPress = useCallback(
    (routeKey: string, routeName: string, focused: boolean) => {
      const event = navigation.emit({ type: 'tabPress', target: routeKey, canPreventDefault: true });
      if (focused || event.defaultPrevented) return;
      hapticSelect();
      navigation.navigate(routeName);
    },
    [navigation],
  );

  return (
    <View
      style={[
        styles.dock,
        {
          backgroundColor: c.bg,
          paddingBottom: Math.max(insets.bottom, space.md),
          paddingHorizontal: space.lg,
          paddingTop: space.sm,
        },
      ]}>
      <View
        style={[
          styles.bar,
          shadow.lifted,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            borderWidth: hairline,
            borderRadius: radius.xl,
          },
        ]}>
        {state.routes.map((route, index) => {
          const meta = TABS.find((t) => t.name === route.name);
          if (!meta) return null;
          const options = descriptors[route.key]?.options;
          const focused = state.index === index;

          return (
            <TabItem
              key={route.key}
              label={options?.title ?? meta.label}
              Icon={meta.Icon}
              focused={focused}
              onPress={() => onPress(route.key, route.name, focused)}
              onLongPress={() =>
                navigation.emit({ type: 'tabLongPress', target: route.key })
              }
            />
          );
        })}
      </View>
    </View>
  );
}

function TabItem({
  label,
  Icon,
  focused,
  onPress,
  onLongPress,
}: {
  label: string;
  Icon: IconComponent;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
}): React.JSX.Element {
  const { c, type } = useTheme();
  const reduced = useReducedMotion();

  const pressed = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.07 }],
    opacity: 1 - pressed.value * 0.18,
  }));

  const set = (v: number) => {
    if (reduced) {
      pressed.value = withTiming(v, { duration: ms(dur.fast, reduced) });
      return;
    }
    pressed.value = withSpring(v, springs.press);
  };

  const tint = focused ? c.accent : c.textFaint;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => set(1)}
      onPressOut={() => set(0)}
      style={styles.item}>
      <Animated.View style={[styles.itemInner, animStyle]}>
        <Icon size={23} color={tint} strokeWidth={focused ? 1.9 : 1.75} filled={focused} />
        <Text
          numberOfLines={1}
          style={[
            type.label,
            styles.label,
            { color: focused ? c.text : c.textFaint },
          ]}>
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

/* ---------------------------------------------------------------- styles */

const styles = StyleSheet.create({
  dock: { width: '100%' },
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: BAR_HEIGHT,
    overflow: 'hidden',
  },
  item: { flex: 1, minHeight: 44 },
  itemInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { textTransform: 'uppercase', fontSize: 9, letterSpacing: 1.1, lineHeight: 12 },
});
