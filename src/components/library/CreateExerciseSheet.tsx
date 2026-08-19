import React, { useCallback, useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';

import { Button, Chip, Segmented, Sheet, Text, useToast } from '@/components/kit';
import { useActions } from '@/data';
import { uid } from '@/data/ids';
import type { Equipment, Exercise, Movement, MuscleGroup } from '@/data/types';
import { EQUIPMENT, MOVEMENTS, MUSCLE_GROUPS } from '@/data/types';
import { hairline, useTheme } from '@/theme';

import { EQUIPMENT_LABEL, MOVEMENT_LABEL, MUSCLE_LABEL } from './labels';

export type CreateExerciseSheetProps = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (id: string) => void;
};

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  const { space } = useTheme();
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="label" tone="faint">
        {label}
      </Text>
      {children}
      {hint ? (
        <Text variant="small" tone="faint">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  multiline = false,
  autoFocus = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  multiline?: boolean;
  autoFocus?: boolean;
}) {
  const { c, radius, space } = useTheme();
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={c.textFaint}
      multiline={multiline}
      autoFocus={autoFocus}
      accessibilityLabel={placeholder}
      style={{
        minHeight: multiline ? 104 : 48,
        borderRadius: radius.md,
        backgroundColor: c.surfaceAlt,
        borderWidth: hairline,
        borderColor: c.border,
        paddingHorizontal: space.lg - 2,
        paddingTop: multiline ? space.md : 0,
        paddingBottom: multiline ? space.md : 0,
        color: c.text,
        fontSize: 16,
        fontWeight: '500',
        textAlignVertical: multiline ? 'top' : 'center',
      }}
    />
  );
}

const SIDE_ITEMS = [
  { value: 'both', label: 'Both sides' },
  { value: 'single', label: 'One side at a time' },
] as const;

export function CreateExerciseSheet({ visible, onClose, onCreated }: CreateExerciseSheetProps) {
  const { space } = useTheme();
  const actions = useActions();
  const toast = useToast();

  const [name, setName] = useState('');
  const [cue, setCue] = useState('');
  const [instructions, setInstructions] = useState('');
  const [primary, setPrimary] = useState<MuscleGroup[]>([]);
  const [secondary, setSecondary] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState<Equipment>('barbell');
  const [movement, setMovement] = useState<Movement>('push');
  const [side, setSide] = useState<'both' | 'single'>('both');

  const reset = useCallback(() => {
    setName('');
    setCue('');
    setInstructions('');
    setPrimary([]);
    setSecondary([]);
    setEquipment('barbell');
    setMovement('push');
    setSide('both');
  }, []);

  const valid = name.trim().length > 1 && primary.length > 0;

  const close = useCallback(() => {
    onClose();
    reset();
  }, [onClose, reset]);

  const save = useCallback(() => {
    if (!valid) return;
    const exercise: Exercise = {
      id: uid('ex'),
      name: name.trim(),
      primary,
      secondary: secondary.filter((m) => !primary.includes(m)),
      equipment,
      movement,
      unilateral: side === 'single',
      instructions: instructions
        .split('\n')
        .map((l) => l.replace(/^\s*\d+[.)]\s*/, '').trim())
        .filter(Boolean),
      mistakes: [],
      alternates: [],
      custom: true,
      cues: cue.trim() || undefined,
    };
    actions.upsertExercise(exercise);
    toast.success('Added to your library.');
    onCreated?.(exercise.id);
    close();
  }, [actions, close, cue, equipment, instructions, movement, name, onCreated, primary, secondary, side, toast, valid]);

  const secondaryOptions = useMemo(
    () => MUSCLE_GROUPS.filter((m) => !primary.includes(m)),
    [primary],
  );

  return (
    <Sheet
      visible={visible}
      onClose={close}
      title="New exercise"
      subtitle="It behaves exactly like the built-in ones."
      footer={
        <Button label="Save exercise" variant="primary" size="lg" fullWidth disabled={!valid} onPress={save} />
      }
    >
      <View style={{ gap: space.xxl, paddingBottom: space.lg }}>
        <Field label="Name">
          <Input value={name} onChange={setName} placeholder="Incline dumbbell press" autoFocus={visible} />
        </Field>

        <Field label="Primary muscles" hint="At least one. These drive your volume totals.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MUSCLE_GROUPS.map((m) => (
              <Chip
                key={m}
                label={MUSCLE_LABEL[m]}
                size="sm"
                selected={primary.includes(m)}
                onPress={() => {
                  setPrimary(toggle(primary, m));
                  setSecondary((prev) => prev.filter((x) => x !== m));
                }}
              />
            ))}
          </View>
        </Field>

        <Field label="Secondary muscles" hint="Optional. Credited at half volume.">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {secondaryOptions.map((m) => (
              <Chip
                key={m}
                label={MUSCLE_LABEL[m]}
                size="sm"
                selected={secondary.includes(m)}
                onPress={() => setSecondary(toggle(secondary, m))}
              />
            ))}
          </View>
        </Field>

        <Field label="Equipment">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {EQUIPMENT.map((e) => (
              <Chip
                key={e}
                label={EQUIPMENT_LABEL[e]}
                size="sm"
                selected={equipment === e}
                onPress={() => setEquipment(e)}
              />
            ))}
          </View>
        </Field>

        <Field label="Movement">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>
            {MOVEMENTS.map((m) => (
              <Chip
                key={m}
                label={MOVEMENT_LABEL[m]}
                size="sm"
                selected={movement === m}
                onPress={() => setMovement(m)}
              />
            ))}
          </View>
        </Field>

        <Field label="Loading">
          <Segmented items={SIDE_ITEMS} value={side} onChange={setSide} />
        </Field>

        <Field label="Coaching cue" hint="One line you want to read mid-set.">
          <Input value={cue} onChange={setCue} placeholder="Ribs down, elbows under the bar" />
        </Field>

        <Field label="Instructions" hint="One step per line.">
          <Input
            value={instructions}
            onChange={setInstructions}
            placeholder={'Set the bench to 30 degrees.\nPress the dumbbells over your collarbone.'}
            multiline
          />
        </Field>
      </View>
    </Sheet>
  );
}
