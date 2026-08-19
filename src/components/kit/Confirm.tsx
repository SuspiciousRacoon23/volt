import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

import { press as hapticPress, warn as hapticWarn } from '@/lib/haptics';
import { useTheme } from '@/theme';

import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

export type ConfirmOptions = {
  title: string;
  /** One calm sentence saying what will happen. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Renders the confirm button in the danger style. */
  destructive?: boolean;
};

export type ConfirmProps = ConfirmOptions & {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** Controlled confirmation sheet. Quiet, two choices, cancel is always first. */
export function Confirm({
  visible,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmProps) {
  const { space } = useTheme();

  useEffect(() => {
    if (visible && destructive) hapticWarn();
  }, [destructive, visible]);

  return (
    <Sheet visible={visible} onClose={onCancel} scrollable={false} showClose={false}>
      <View style={{ gap: space.sm, paddingBottom: space.lg }}>
        <Text variant="h1">{title}</Text>
        {message ? (
          <Text variant="body" tone="muted">
            {message}
          </Text>
        ) : null}
      </View>
      <View style={{ gap: space.sm }}>
        <Button
          label={confirmLabel}
          variant={destructive ? 'danger' : 'primary'}
          size="lg"
          fullWidth
          onPress={() => {
            hapticPress();
            onConfirm();
          }}
        />
        <Button label={cancelLabel} variant="ghost" fullWidth onPress={onCancel} />
      </View>
    </Sheet>
  );
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn>(async () => true);

/** Mount once near the root to enable `useConfirm()`. */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    setOptions(null);
    resolver.current?.(value);
    resolver.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options ? (
        <Confirm
          visible
          {...options}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      ) : null}
    </ConfirmContext.Provider>
  );
}

/** `const ok = await confirm({ title: 'Discard this workout?' })`. */
export function useConfirm(): ConfirmFn {
  return useContext(ConfirmContext);
}
