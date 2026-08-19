import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { IconProps } from '@/icons';
import { tap as hapticTap } from '@/lib/haptics';
import { dur, hairline, springs, useReducedMotion, useTheme } from '@/theme';

import { Text } from './Text';

export type ToastTone = 'default' | 'success' | 'danger';

export type ToastOptions = {
  tone?: ToastTone;
  /** Milliseconds on screen. Defaults to 2600. */
  duration?: number;
  icon?: React.ComponentType<IconProps>;
  action?: { label: string; onPress: () => void };
};

export type ToastApi = {
  show: (message: string, options?: ToastOptions) => void;
  success: (message: string, options?: Omit<ToastOptions, 'tone'>) => void;
  error: (message: string, options?: Omit<ToastOptions, 'tone'>) => void;
  hide: () => void;
};

type ToastState = ToastOptions & { message: string; key: number };

const noop: ToastApi = {
  show: () => undefined,
  success: () => undefined,
  error: () => undefined,
  hide: () => undefined,
};

const ToastContext = createContext<ToastApi>(noop);

/** Mount once, near the root, inside SafeAreaProvider. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setToast(null);
  }, []);

  const show = useCallback(
    (message: string, options?: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      seq.current += 1;
      setToast({ message, key: seq.current, ...options });
      timer.current = setTimeout(hide, options?.duration ?? 2600);
    },
    [hide],
  );

  const api = useMemo<ToastApi>(
    () => ({
      show,
      success: (m, o) => show(m, { ...o, tone: 'success' }),
      error: (m, o) => show(m, { ...o, tone: 'danger' }),
      hide,
    }),
    [hide, show],
  );

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {toast ? <ToastView key={toast.key} toast={toast} onDismiss={hide} /> : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}

function ToastView({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
  const { c, radius, space, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();

  const p = useSharedValue(reduced ? 1 : 0);

  useEffect(() => {
    p.value = reduced ? 1 : withSpring(1, springs.glide);
  }, [p, reduced]);

  const anim = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [{ translateY: (1 - p.value) * 24 }],
  }));

  const Icon = toast.icon;
  const ink = toast.tone === 'success' ? c.accent : toast.tone === 'danger' ? c.danger : c.bg;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        {
          position: 'absolute',
          left: space.lg,
          right: space.lg,
          bottom: insets.bottom + 92,
          alignItems: 'center',
        },
        anim,
      ]}
    >
      <Pressable
        accessibilityRole="alert"
        accessibilityLabel={toast.message}
        onPress={() => {
          p.value = withTiming(0, { duration: dur.fast });
          onDismiss();
        }}
        style={{ maxWidth: 520, width: '100%' }}
      >
        <View
          style={[
            {
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              paddingVertical: space.md,
              paddingHorizontal: space.lg,
              borderRadius: radius.lg,
              backgroundColor: c.text,
              borderWidth: hairline,
              borderColor: c.text,
            },
            shadow.lifted,
          ]}
        >
          {Icon ? <Icon size={18} color={ink} strokeWidth={2} /> : null}
          <Text variant="small" weight="600" color={c.bg} style={{ flex: 1 }} numberOfLines={2}>
            {toast.message}
          </Text>
          {toast.action ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={toast.action.label}
              hitSlop={10}
              onPress={() => {
                hapticTap();
                toast.action?.onPress();
                onDismiss();
              }}
            >
              <Text variant="small" weight="700" color={c.accent}>
                {toast.action.label}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}
