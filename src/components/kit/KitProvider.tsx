import React from 'react';

import { ConfirmProvider } from './Confirm';
import { ToastProvider } from './Toast';

/**
 * Mounts the two kit primitives that need a host: toasts and confirmations.
 * Put it inside GestureHandlerRootView and SafeAreaProvider, above the router.
 * Without it `useToast` and `useConfirm` are safe no-ops.
 */
export function KitProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
