import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Share, TextInput, View } from 'react-native';

import {
  Button, Card, Confirm, Screen, Segmented, Sheet, StatTile, Stepper, Text,
} from '@/components/kit';
import { MonthlyRecap } from '@/components/profile/MonthlyRecap';
import { PlateInventory } from '@/components/profile/PlateInventory';
import { Reminders } from '@/components/profile/Reminders';
import { NavRow, Row, RowRule, Section, StackRow, SwitchRow } from '@/components/profile/Rows';
import { fmtLongDuration, lifetimeStats } from '@/components/profile/lifetime';
import { todayReadiness } from '@/data/selectors';
import { useActions, useStore } from '@/data/store';
import type { Unit } from '@/data/types';
import {
  Barbell,
  Battery,
  Bolt,
  Calculator,
  Export,
  Moon,
  Note,
  Plate,
  Rest,
  Streak,
  Sun,
  Target,
  Timer,
  Trash,
} from '@/icons';
import {
  displayWeight,
  fmtClock,
  fmtVolume,
  fmtWeightValue,
  readinessVerdict,
  setHapticsEnabled,
  toKg,
  unitLabel,
} from '@/lib';
import { useTheme } from '@/theme';

const UNITS = [
  { value: 'kg' as const, label: 'Kilograms' },
  { value: 'lb' as const, label: 'Pounds' },
];

const THEMES = [
  { value: 'system' as const, label: 'System' },
  { value: 'light' as const, label: 'Light' },
  { value: 'dark' as const, label: 'Dark' },
];

export default function ProfileScreen(): React.JSX.Element {
  const state = useStore();
  const { updateSettings, resetAll, exportJSON } = useActions();
  const { c, space } = useTheme();

  const s = state.settings;
  const unit: Unit = s.unit;

  const [reminders, setReminders] = useState<number[]>([]);
  const [recapOpen, setRecapOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [payload, setPayload] = useState('');

  // Keep the haptics engine in step with the setting that governs it.
  useEffect(() => {
    setHapticsEnabled(s.haptics);
  }, [s.haptics]);

  const life = useMemo(() => lifetimeStats(state), [state]);
  const readiness = useMemo(() => todayReadiness(state), [state]);

  const openExport = () => {
    setPayload(exportJSON());
    setExportOpen(true);
  };

  const shareExport = () => {
    const data = payload || exportJSON();
    void Share.share({ message: data, title: 'VOLT export' }).catch(() => undefined);
  };

  const sizeKb = payload ? Math.max(1, Math.round(payload.length / 1024)) : 0;

  return (
    <Screen title="Profile" subtitle="Everything here stays on this device">
      <NameField
        value={s.name}
        onChange={(name) => updateSettings({ name })}
        color={c.text}
        placeholder={c.textFaint}
      />

      {/* ------------------------------------------------------- lifetime */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.md }}>
        <StatTile label="Workouts" value={life.workouts} style={{ flexGrow: 1, flexBasis: '46%' }} />
        <StatTile
          label="Lifted"
          value={fmtVolume(life.volumeKg, unit)}
          style={{ flexGrow: 1, flexBasis: '46%' }}
        />
        <StatTile
          label="Time under the bar"
          value={fmtLongDuration(life.durationMs)}
          style={{ flexGrow: 1, flexBasis: '46%' }}
        />
        <StatTile
          label="Longest streak"
          value={life.longestStreak}
          unit={life.longestStreak === 1 ? 'day' : 'days'}
          style={{ flexGrow: 1, flexBasis: '46%' }}
        />
      </View>

      <Section title="Today">
        <NavRow
          icon={Battery}
          label="Daily check-in"
          hint={readiness ? 'Answered today' : 'Six taps, under ten seconds'}
          value={readiness ? readinessVerdict(readiness) : undefined}
          onPress={() => router.push('/checkin')}
        />
        <RowRule />
        <NavRow
          icon={Calculator}
          label="Tools"
          hint="Plates, one-rep max, warm-ups, substitutes"
          onPress={() => router.push('/tools')}
        />
      </Section>

      {/* ------------------------------------------------------- training */}
      <Section
        title="Training"
        footnote="Loads suggested anywhere in the app are snapped to this bar and these plates."
      >
        <StackRow icon={Barbell} label="Units" hint="Used everywhere a weight is shown">
          <Segmented
            items={UNITS}
            value={unit}
            onChange={(v) => updateSettings({ unit: v })}
          />
        </StackRow>
        <RowRule />
        <StackRow icon={Rest} label="Default rest" hint="Starting point for a new set">
          <Stepper
            value={s.defaultRestSec}
            onChange={(v) => updateSettings({ defaultRestSec: v })}
            step={15}
            min={30}
            max={360}
            formatValue={(v) => fmtClock(v)}
          />
        </StackRow>
        <RowRule />
        <StackRow icon={Barbell} label="Bar weight">
          <Stepper
            value={displayWeight(s.barKg, unit)}
            onChange={(v) => updateSettings({ barKg: toKg(v, unit) })}
            step={unit === 'kg' ? 1.25 : 5}
            min={displayWeight(5, unit)}
            max={displayWeight(35, unit)}
            formatValue={(v) => `${fmtWeightValue(toKg(v, unit), unit)} ${unitLabel(unit)}`}
          />
        </StackRow>
        <RowRule />
        <StackRow icon={Plate} label="Plates you own">
          <PlateInventory
            unit={unit}
            plates={s.availablePlatesKg}
            onChange={(next) => updateSettings({ availablePlatesKg: next })}
          />
        </StackRow>
        <RowRule />
        <StackRow icon={Target} label="Weekly goal" hint="Sessions a week you are aiming for">
          <Stepper
            value={s.weeklyGoal}
            onChange={(v) => updateSettings({ weeklyGoal: v })}
            step={1}
            min={1}
            max={7}
            formatValue={(v) => `${v} a week`}
          />
        </StackRow>
      </Section>

      {/* ----------------------------------------------------- appearance */}
      <Section title="Appearance">
        <StackRow icon={s.themeMode === 'dark' ? Moon : Sun} label="Theme">
          <Segmented
            items={THEMES}
            value={s.themeMode}
            onChange={(v) => updateSettings({ themeMode: v })}
          />
        </StackRow>
        <RowRule />
        <SwitchRow
          icon={Timer}
          label="Reduced motion"
          hint="Removes every transition and animation"
          value={s.reducedMotion}
          onChange={(v) => updateSettings({ reducedMotion: v })}
        />
        <RowRule />
        <SwitchRow
          icon={Bolt}
          label="Haptics"
          hint="A tap when a set lands and a timer ends"
          value={s.haptics}
          onChange={(v) => updateSettings({ haptics: v })}
        />
      </Section>

      {/* ----------------------------------------------------- motivation */}
      <Section title="Motivation">
        <SwitchRow
          icon={Streak}
          label="Show streaks"
          hint="Scheduled rest days never break one"
          value={s.streaksEnabled}
          onChange={(v) => updateSettings({ streaksEnabled: v })}
        />
        <RowRule />
        <StackRow icon={Timer} label="Reminder times">
          <Reminders times={reminders} onChange={setReminders} />
        </StackRow>
        <RowRule />
        <NavRow
          icon={Note}
          label="Monthly recap"
          hint="What this month actually contained"
          onPress={() => setRecapOpen(true)}
        />
      </Section>

      {/* ----------------------------------------------------------- data */}
      <Section title="Data" footnote="No account, no sync, no network calls. Ever.">
        <NavRow
          icon={Export}
          label="Export your data"
          hint="One JSON file with everything logged"
          onPress={openExport}
        />
        <RowRule />
        <Row
          icon={Trash}
          label="Reset everything"
          hint="Deletes every session, routine and record"
          right={
            <Button
              label="Reset"
              variant="danger"
              size="sm"
              onPress={() => setConfirming(true)}
            />
          }
        />
      </Section>

      <View style={{ marginTop: space.xxxl, alignItems: 'center', gap: space.xs }}>
        <Text variant="label" tone="faint">
          VOLT
        </Text>
        <Text variant="small" tone="faint" center>
          {life.workouts > 0
            ? `${life.workouts} sessions kept since you started.`
            : 'Your first session is the one that starts the record.'}
        </Text>
      </View>

      {/* --------------------------------------------------------- sheets */}
      <Sheet
        visible={recapOpen}
        onClose={() => setRecapOpen(false)}
        title="Monthly recap"
        subtitle="Arithmetic on what you logged"
        scrollable
        maxHeightRatio={0.9}
      >
        <MonthlyRecap />
      </Sheet>

      <Sheet
        visible={exportOpen}
        onClose={() => setExportOpen(false)}
        title="Export"
        subtitle={sizeKb ? `${sizeKb} KB of JSON` : undefined}
        scrollable
        footer={
          <Button label="Share or copy" variant="primary" icon={Export} fullWidth onPress={shareExport} />
        }
      >
        <View style={{ gap: space.md }}>
          <Text variant="small" tone="muted">
            The whole store: {Object.keys(state.sessions).length} sessions,{' '}
            {Object.keys(state.routines).length} routines,{' '}
            {Object.keys(state.exercises).length} exercises and {state.prs.length} records.
          </Text>
          <Card tone="flat">
            <Text
              variant="small"
              tone="faint"
              numeric
              selectable
              style={{ fontSize: 11, lineHeight: 15 }}
            >
              {payload.slice(0, 1200)}
              {payload.length > 1200 ? '\n…' : ''}
            </Text>
          </Card>
          <Text variant="small" tone="faint">
            Select the text to copy it by hand, or use the share sheet to send
            the file somewhere you control.
          </Text>
        </View>
      </Sheet>

      <Confirm
        visible={confirming}
        title="Reset everything"
        message="Every session, routine, record and check-in on this device is deleted. This cannot be undone."
        confirmLabel="Delete it all"
        cancelLabel="Keep my data"
        destructive
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          resetAll();
        }}
      />

    </Screen>
  );
}

function NameField({
  value,
  onChange,
  color,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  color: string;
  placeholder: string;
}): React.JSX.Element {
  const { space } = useTheme();
  return (
    <View style={{ marginBottom: space.xl, gap: space.xs }}>
      <Text variant="label" tone="faint">
        Your name
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Optional"
        placeholderTextColor={placeholder}
        style={{ color, fontSize: 19, fontWeight: '700', paddingVertical: 8 }}
        autoCorrect={false}
      />
    </View>
  );
}
