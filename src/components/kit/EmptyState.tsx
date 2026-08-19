import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import type { IconProps } from '@/icons';
import { hairline, useTheme } from '@/theme';

import { Button } from './Button';
import { Text } from './Text';

export type EmptyStateProps = {
  icon?: React.ComponentType<IconProps>;
  title: string;
  /** One calm sentence explaining what will appear here. */
  body?: string;
  action?: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  /** `inline` drops the framing for use inside an existing card. */
  variant?: 'card' | 'inline';
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
  secondaryAction,
  variant = 'card',
  style,
}: EmptyStateProps) {
  const { c, radius, space } = useTheme();

  return (
    <View
      style={[
        {
          alignItems: 'center',
          paddingVertical: space.xxl,
          paddingHorizontal: space.xl,
          gap: space.sm,
        },
        variant === 'card'
          ? {
              backgroundColor: c.surface,
              borderRadius: radius.lg,
              borderWidth: hairline,
              borderColor: c.border,
            }
          : null,
        style,
      ]}
    >
      {Icon ? (
        <View
          style={{
            width: 52,
            height: 52,
            borderRadius: radius.pill,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: c.surfaceAlt,
            marginBottom: space.xs,
          }}
        >
          <Icon size={24} color={c.textFaint} strokeWidth={1.75} />
        </View>
      ) : null}

      <Text variant="h2" center>
        {title}
      </Text>

      {body ? (
        <Text variant="small" tone="muted" center style={{ maxWidth: 320 }}>
          {body}
        </Text>
      ) : null}

      {action ? (
        <View style={{ marginTop: space.md, alignSelf: 'stretch', gap: space.sm }}>
          <Button label={action.label} onPress={action.onPress} variant="primary" fullWidth />
          {secondaryAction ? (
            <Button
              label={secondaryAction.label}
              onPress={secondaryAction.onPress}
              variant="ghost"
              fullWidth
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
