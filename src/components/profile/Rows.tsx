import React from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Card, Text } from '@/components/kit';
import { ChevronRight, type IconProps } from '@/icons';
import { select as hapticSelect } from '@/lib/haptics';
import { hairline, hit, useTheme } from '@/theme';

type Glyph = React.ComponentType<IconProps>;

/** A titled group of rows. The title is the only uppercase text on the screen. */
export function Section({
  title,
  footnote,
  children,
}: {
  title: string;
  footnote?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  const { space } = useTheme();
  return (
    <View style={{ gap: space.sm, marginTop: space.xxl }}>
      <Text variant="label" tone="faint" style={{ marginLeft: space.xs }}>
        {title}
      </Text>
      <Card tone="plain" padding={0}>
        {children}
      </Card>
      {footnote ? (
        <Text variant="small" tone="faint" style={{ marginHorizontal: space.xs }}>
          {footnote}
        </Text>
      ) : null}
    </View>
  );
}

/** Hairline between rows inside a Section. Never after the last one. */
export function RowRule(): React.JSX.Element {
  const { c, space } = useTheme();
  return (
    <View
      style={{
        height: hairline,
        backgroundColor: c.border,
        marginLeft: space.lg,
      }}
    />
  );
}

function RowFrame({
  icon: Icon,
  label,
  hint,
  right,
  onPress,
  stacked,
  children,
}: {
  icon?: Glyph;
  label: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  stacked?: boolean;
  children?: React.ReactNode;
}): React.JSX.Element {
  const { c, space } = useTheme();

  const body = (
    <View style={{ paddingHorizontal: space.lg, paddingVertical: space.md, gap: space.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, minHeight: 28 }}>
        {Icon ? <Icon size={20} color={c.textMuted} /> : null}
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="body">{label}</Text>
          {hint ? (
            <Text variant="small" tone="faint">
              {hint}
            </Text>
          ) : null}
        </View>
        {right}
      </View>
      {stacked ? children : null}
    </View>
  );

  if (!onPress) return body;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: hit.min,
        backgroundColor: pressed ? c.surfaceAlt : 'transparent',
      })}
    >
      {body}
    </Pressable>
  );
}

/** Label + a value or control on the right. */
export function Row(props: {
  icon?: Glyph;
  label: string;
  hint?: string;
  right?: React.ReactNode;
  onPress?: () => void;
}): React.JSX.Element {
  return <RowFrame {...props} />;
}

/** Label on top, a wide control (Segmented, Stepper, chips) underneath. */
export function StackRow({
  icon,
  label,
  hint,
  children,
}: {
  icon?: Glyph;
  label: string;
  hint?: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <RowFrame icon={icon} label={label} hint={hint} stacked>
      {children}
    </RowFrame>
  );
}

/**
 * A binary setting. The switch stays monochrome on purpose — lime is reserved
 * for actions, progress and records, and a settings screen has too many
 * toggles to spend it here.
 */
export function SwitchRow({
  icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon?: Glyph;
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}): React.JSX.Element {
  const { c } = useTheme();
  return (
    <RowFrame
      icon={icon}
      label={label}
      hint={hint}
      right={
        <Switch
          value={value}
          onValueChange={(v) => {
            hapticSelect();
            onChange(v);
          }}
          accessibilityLabel={label}
          trackColor={{ false: c.surfaceAlt, true: c.text }}
          thumbColor={value ? c.bg : c.surface}
          ios_backgroundColor={c.surfaceAlt}
        />
      }
    />
  );
}

/** A row that opens something else. */
export function NavRow({
  icon,
  label,
  hint,
  value,
  onPress,
}: {
  icon?: Glyph;
  label: string;
  hint?: string;
  value?: string;
  onPress: () => void;
}): React.JSX.Element {
  const { c, space } = useTheme();
  return (
    <RowFrame
      icon={icon}
      label={label}
      hint={hint}
      onPress={onPress}
      right={
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}>
          {value ? (
            <Text variant="small" tone="muted" numeric>
              {value}
            </Text>
          ) : null}
          <ChevronRight size={18} color={c.textFaint} />
        </View>
      }
    />
  );
}
