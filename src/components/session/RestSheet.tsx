import React from 'react';
import { View } from 'react-native';

import { Button, Ring, Sheet, Text } from '@/components/kit';
import { fmtClock } from '@/lib/dates';
import { useTheme } from '@/theme';

import type { RestTimer } from './timers';

export type RestSheetProps = {
  visible: boolean;
  onClose: () => void;
  timer: RestTimer;
  /** 'Next: Incline Press, set 2, 30 kg × 10'. */
  preview: string;
};

/** The countdown at full size, with the only three controls it needs. */
export function RestSheet({ visible, onClose, timer, preview }: RestSheetProps) {
  const { c, radius, space } = useTheme();
  const progress = timer.duration > 0 ? timer.remaining / timer.duration : 0;

  return (
    <Sheet visible={visible} onClose={onClose} scrollable={false} showClose>
      <View style={{ alignItems: 'center', gap: space.xl, paddingBottom: space.lg }}>
        <Text variant="label" tone="faint">
          Rest
        </Text>

        <Ring
          progress={timer.finished ? 1 : progress}
          size={216}
          thickness={12}
          duration={240}
          accessibilityLabel={`${timer.remaining} seconds remaining`}>
          <Text variant="display" numeric>
            {fmtClock(timer.remaining)}
          </Text>
          <Text variant="small" tone="faint">
            {timer.finished ? 'Rest complete' : `of ${fmtClock(timer.duration)}`}
          </Text>
        </Ring>

        <View style={{ flexDirection: 'row', gap: space.sm, alignSelf: 'stretch' }}>
          <View style={{ flex: 1 }}>
            <Button label="−15s" variant="secondary" size="lg" fullWidth onPress={() => timer.adjust(-15)} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="+15s" variant="secondary" size="lg" fullWidth onPress={() => timer.adjust(15)} />
          </View>
        </View>

        <View
          style={{
            alignSelf: 'stretch',
            padding: space.lg,
            borderRadius: radius.md,
            backgroundColor: c.surfaceAlt,
          }}>
          <Text variant="small" tone="muted">
            {preview}
          </Text>
        </View>

        <Button
          label="Skip rest"
          variant="ghost"
          size="lg"
          fullWidth
          onPress={() => {
            timer.skip();
            onClose();
          }}
        />
      </View>
    </Sheet>
  );
}
