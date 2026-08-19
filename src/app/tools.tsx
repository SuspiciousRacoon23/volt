import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Screen, Sheet, Text } from '@/components/kit';
import { ToolConvert } from '@/components/profile/ToolConvert';
import { ToolDuration } from '@/components/profile/ToolDuration';
import { ToolOneRM } from '@/components/profile/ToolOneRM';
import { ToolPlates } from '@/components/profile/ToolPlates';
import { ToolSubstitute } from '@/components/profile/ToolSubstitute';
import { ToolSummary } from '@/components/profile/ToolSummary';
import { ToolWarmup } from '@/components/profile/ToolWarmup';
import { Calculator, Flame, type IconProps, Note, Plate, Ruler, Swap, Timer } from '@/icons';
import { press as hapticPress } from '@/lib/haptics';
import { hairline, useTheme } from '@/theme';

type ToolId = 'plates' | 'onerm' | 'warmup' | 'duration' | 'convert' | 'substitute' | 'summary';

const TOOLS: {
  id: ToolId;
  title: string;
  blurb: string;
  sheetTitle: string;
  sheetSubtitle: string;
  icon: React.ComponentType<IconProps>;
}[] = [
  {
    id: 'plates',
    title: 'Plates',
    blurb: 'What to load, per side',
    sheetTitle: 'Plate calculator',
    sheetSubtitle: 'Built from the plates you own',
    icon: Plate,
  },
  {
    id: 'onerm',
    title: 'One-rep max',
    blurb: 'Estimate from any set',
    sheetTitle: 'One-rep max',
    sheetSubtitle: 'Blended Epley and Brzycki',
    icon: Calculator,
  },
  {
    id: 'warmup',
    title: 'Warm-up',
    blurb: 'A ramp to your top set',
    sheetTitle: 'Warm-up sets',
    sheetSubtitle: 'Every rung loadable',
    icon: Flame,
  },
  {
    id: 'duration',
    title: 'Duration',
    blurb: 'How long a session runs',
    sheetTitle: 'Duration estimator',
    sheetSubtitle: 'Working sets plus rest',
    icon: Timer,
  },
  {
    id: 'convert',
    title: 'kg and lb',
    blurb: 'Convert either way',
    sheetTitle: 'Unit converter',
    sheetSubtitle: 'Kilograms and pounds',
    icon: Ruler,
  },
  {
    id: 'substitute',
    title: 'Substitutes',
    blurb: 'Swap a blocked lift',
    sheetTitle: 'Substitution finder',
    sheetSubtitle: 'Ranked by what it trains',
    icon: Swap,
  },
  {
    id: 'summary',
    title: 'Last session',
    blurb: 'A shareable recap',
    sheetTitle: 'Last session',
    sheetSubtitle: 'Your most recent finished workout',
    icon: Note,
  },
];

export default function ToolsScreen(): React.JSX.Element {
  const { space } = useTheme();
  const [open, setOpen] = useState<ToolId | null>(null);
  const tool = TOOLS.find((t) => t.id === open) ?? null;

  return (
    <>
      <Screen title="Tools" subtitle="Seven calculators, no guessing" onBack={() => router.back()}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
          {TOOLS.map((t) => (
            <ToolCard
              key={t.id}
              title={t.title}
              blurb={t.blurb}
              icon={t.icon}
              onPress={() => {
                hapticPress();
                setOpen(t.id);
              }}
            />
          ))}
        </View>

        <Text variant="small" tone="faint" style={{ marginTop: space.xxl }}>
          Every number here comes from the same maths the app uses when it logs a
          set, so a figure you check by hand will match the one it records.
        </Text>
      </Screen>

      <Sheet
        visible={open !== null}
        onClose={() => setOpen(null)}
        title={tool?.sheetTitle}
        subtitle={tool?.sheetSubtitle}
        scrollable
        maxHeightRatio={0.92}
      >
        {open === 'plates' ? <ToolPlates /> : null}
        {open === 'onerm' ? <ToolOneRM /> : null}
        {open === 'warmup' ? <ToolWarmup /> : null}
        {open === 'duration' ? <ToolDuration /> : null}
        {open === 'convert' ? <ToolConvert /> : null}
        {open === 'substitute' ? <ToolSubstitute onNavigate={() => setOpen(null)} /> : null}
        {open === 'summary' ? <ToolSummary /> : null}
      </Sheet>
    </>
  );
}

/* ------------------------------------------------------------------ parts */

function ToolCard({
  title,
  blurb,
  icon: Icon,
  onPress,
}: {
  title: string;
  blurb: string;
  icon: React.ComponentType<IconProps>;
  onPress: () => void;
}): React.JSX.Element {
  const { c, space, radius } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({
        flexGrow: 1,
        flexBasis: '46%',
        minHeight: 132,
        borderRadius: radius.lg,
        borderWidth: hairline,
        borderColor: c.border,
        backgroundColor: pressed ? c.surfaceAlt : c.surface,
        padding: space.lg,
        justifyContent: 'space-between',
        gap: space.lg,
      })}
    >
      <Icon size={22} color={c.textMuted} />
      <View style={{ gap: 2 }}>
        <Text variant="h2">{title}</Text>
        <Text variant="small" tone="faint">
          {blurb}
        </Text>
      </View>
    </Pressable>
  );
}
