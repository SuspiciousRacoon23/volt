import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoreProvider, useActions, useStore } from '@/data/store';
import { Logo } from '@/icons';
import { relative } from '@/lib/dates';
import { press as hapticPress } from '@/lib/haptics';
import { ThemeProvider, dur, hairline, ms, useReducedMotion, useTheme } from '@/theme';

export const unstable_settings = { anchor: '(tabs)' };

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StoreProvider>
          <ThemeProvider>
            <Shell />
          </ThemeProvider>
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

/* ------------------------------------------------------------------ shell */

function Shell(): React.JSX.Element {
  const { c, scheme } = useTheme();
  const { hydrated } = useStore();

  useEffect(() => {
    if (hydrated) void SplashScreen.hideAsync().catch(() => undefined);
  }, [hydrated]);

  return (
    <View style={[styles.root, { backgroundColor: c.bg }]}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {hydrated ? (
        <>
          <Navigator />
          <RestorePrompt />
        </>
      ) : (
        <Splash />
      )}
    </View>
  );
}

function Navigator(): React.JSX.Element {
  const { c } = useTheme();
  const reduced = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: c.bg },
        animation: reduced ? 'none' : 'slide_from_right',
        animationDuration: ms(dur.base, reduced),
      }}>
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen
        name="session"
        options={{
          presentation: 'fullScreenModal',
          gestureEnabled: false,
          animation: reduced ? 'none' : 'fade',
        }}
      />
      <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
      <Stack.Screen name="tools" options={{ presentation: 'modal' }} />
      <Stack.Screen name="routine/[id]" />
      <Stack.Screen name="exercise/[id]" />
    </Stack>
  );
}

/* ----------------------------------------------------------------- splash */

/** Branded hold while the store rehydrates. The mark only — no spinner, no chrome. */
function Splash(): React.JSX.Element {
  const { c } = useTheme();
  const reduced = useReducedMotion();
  const o = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    o.value = withTiming(1, { duration: ms(dur.slow, reduced) });
  }, [o, reduced]);

  const style = useAnimatedStyle(() => ({ opacity: o.value }));

  return (
    <View style={[styles.splash, { backgroundColor: c.bg }]}>
      <Animated.View style={style}>
        <Logo size={30} color={c.text} accent={c.accent} />
      </Animated.View>
    </View>
  );
}

/* ---------------------------------------------------------- restore prompt */

/**
 * A workout left open by a closed app or a dead phone. Quiet, sits above the
 * screen underneath without blocking it, and leaves only when acted on.
 */
function RestorePrompt(): React.JSX.Element | null {
  const { c, space, radius, type, shadow } = useTheme();
  const { active } = useStore();
  const { discardSession } = useActions();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const pathname = usePathname();

  // Only a session that already existed when the app opened counts as unfinished.
  const seen = useRef(false);
  const [armed, setArmed] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (seen.current) return;
    seen.current = true;
    if (active) setArmed(true);
  }, [active]);

  const visible = armed && Boolean(active) && pathname !== '/session';

  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withTiming(visible ? 1 : 0, { duration: ms(dur.slow, reduced) });
  }, [t, visible, reduced]);

  const anim = useAnimatedStyle(() => ({
    opacity: t.value,
    transform: [{ translateY: (1 - t.value) * 16 }],
  }));

  const onResume = useCallback(() => {
    hapticPress();
    setArmed(false);
    router.navigate('/session');
  }, []);

  const onDiscard = useCallback(() => {
    hapticPress();
    discardSession();
    setArmed(false);
    setConfirming(false);
  }, [discardSession]);

  if (!armed || !active) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        StyleSheet.absoluteFill,
        styles.promptLayer,
        {
          paddingBottom: insets.bottom + space.xxxl + space.xxl,
          paddingHorizontal: space.lg,
        },
      ]}>
      <Animated.View
        pointerEvents={visible ? 'auto' : 'none'}
        style={[
          anim,
          shadow.lifted,
          {
            backgroundColor: c.surface,
            borderColor: c.border,
            borderWidth: hairline,
            borderRadius: radius.lg,
            padding: space.lg,
            gap: space.md,
          },
        ]}>
        <View style={{ gap: space.xs }}>
          <Text style={[type.label, styles.upper, { color: c.textFaint }]}>
            {confirming ? 'Confirm' : 'In progress'}
          </Text>
          <Text style={[type.h2, { color: c.text }]}>
            {confirming ? 'Discard this workout' : 'You have an unfinished workout'}
          </Text>
          <Text style={[type.small, { color: c.textMuted }]}>
            {confirming
              ? 'Every set logged in it will be removed.'
              : `${active.name} · started ${relative(active.startedAt)}`}
          </Text>
        </View>

        {confirming ? (
          <View style={[styles.row, { gap: space.sm }]}>
            <PromptButton label="Keep it" onPress={() => setConfirming(false)} />
            <PromptButton label="Discard" tone="danger" onPress={onDiscard} />
          </View>
        ) : (
          <View style={[styles.row, { gap: space.sm }]}>
            <PromptButton label="Discard" onPress={() => setConfirming(true)} />
            <PromptButton label="Resume" tone="primary" onPress={onResume} />
          </View>
        )}
      </Animated.View>
    </View>
  );
}

function PromptButton({
  label,
  onPress,
  tone = 'secondary',
}: {
  label: string;
  onPress: () => void;
  tone?: 'primary' | 'secondary' | 'danger';
}): React.JSX.Element {
  const { c, radius, type } = useTheme();
  const bg = tone === 'primary' ? c.accent : c.surfaceAlt;
  const fg = tone === 'primary' ? c.accentInk : tone === 'danger' ? c.danger : c.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderRadius: radius.md, opacity: pressed ? 0.82 : 1 },
      ]}>
      <Text style={[type.body, styles.buttonLabel, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

/* ----------------------------------------------------------------- styles */

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  promptLayer: { justifyContent: 'flex-end' },
  row: { flexDirection: 'row' },
  button: {
    flex: 1,
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: { fontWeight: '700' },
  upper: { textTransform: 'uppercase' },
});
