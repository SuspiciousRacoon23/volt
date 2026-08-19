import { router } from 'expo-router';
import React, { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { ScrollView, SectionList, View } from 'react-native';

import { Chip, Divider, EmptyState, IconButton, Screen, Text } from '@/components/kit';
import { CreateExerciseSheet } from '@/components/library/CreateExerciseSheet';
import { ExerciseRow } from '@/components/library/ExerciseRow';
import { FilterSheet, type Filters } from '@/components/library/FilterSheet';
import { SearchField } from '@/components/library/SearchField';
import { buildExerciseStats } from '@/components/library/stats';
import { useStore } from '@/data';
import type { Exercise } from '@/data/types';
import { Clock, Filter, Plus, Search, Star } from '@/icons';
import { useTheme } from '@/theme';

type Quick = 'all' | 'favourites' | 'recent';
type Section = { title: string; caption?: string; data: Exercise[] };

const EMPTY_FILTERS: Filters = { muscles: [], equipment: [], movements: [] };

export default function LibraryScreen() {
  const state = useStore();
  const { c, space } = useTheme();

  const [query, setQuery] = useState('');
  const [quick, setQuick] = useState<Quick>('all');
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const deferred = useDeferredValue(query);

  const stats = useMemo(() => buildExerciseStats(state), [state]);

  /** Pre-lowercased haystack per exercise — built once, searched on every key. */
  const index = useMemo(
    () =>
      Object.values(state.exercises).map((e) => ({
        e,
        hay: `${e.name} ${e.primary.join(' ')} ${e.secondary.join(' ')} ${e.equipment} ${e.movement}`.toLowerCase(),
      })),
    [state.exercises],
  );

  const byFilters = useMemo(() => {
    const { muscles, equipment, movements } = filters;
    if (!muscles.length && !equipment.length && !movements.length) return index;
    return index.filter(({ e }) => {
      if (equipment.length && !equipment.includes(e.equipment)) return false;
      if (movements.length && !movements.includes(e.movement)) return false;
      if (muscles.length) {
        const hit = muscles.some((m) => e.primary.includes(m) || e.secondary.includes(m));
        if (!hit) return false;
      }
      return true;
    });
  }, [filters, index]);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    let list = byFilters;
    if (q) {
      const terms = q.split(/\s+/);
      list = list.filter(({ hay }) => terms.every((t) => hay.includes(t)));
    }
    if (quick === 'favourites') list = list.filter(({ e }) => e.favourite);
    if (quick === 'recent') {
      list = list.filter(({ e }) => (e.lastUsed ?? stats[e.id]?.lastTs ?? 0) > 0);
    }
    return list.map(({ e }) => e);
  }, [byFilters, deferred, quick, stats]);

  const sections = useMemo<Section[]>(() => {
    if (!results.length) return [];

    if (quick === 'recent') {
      const sorted = [...results].sort(
        (a, b) => (b.lastUsed ?? stats[b.id]?.lastTs ?? 0) - (a.lastUsed ?? stats[a.id]?.lastTs ?? 0),
      );
      return [{ title: 'Recently used', caption: `${sorted.length}`, data: sorted }];
    }

    const sorted = [...results].sort((a, b) => a.name.localeCompare(b.name));

    if (quick === 'favourites') {
      return [{ title: 'Favourites', caption: `${sorted.length}`, data: sorted }];
    }
    if (deferred.trim()) {
      return [{ title: 'Results', caption: `${sorted.length}`, data: sorted }];
    }

    const groups = new Map<string, Exercise[]>();
    for (const e of sorted) {
      const key = (e.name[0] ?? '#').toUpperCase();
      const bucket = groups.get(key);
      if (bucket) bucket.push(e);
      else groups.set(key, [e]);
    }
    return Array.from(groups, ([title, data]) => ({ title, data }));
  }, [deferred, quick, results, stats]);

  const openExercise = useCallback((id: string) => {
    router.push({ pathname: '/exercise/[id]', params: { id } });
  }, []);

  const unit = state.settings.unit;

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseRow exercise={item} stat={stats[item.id]} unit={unit} onOpen={openExercise} />
    ),
    [openExercise, stats, unit],
  );

  const activeFilters =
    filters.muscles.length + filters.equipment.length + filters.movements.length;

  const clearAll = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setQuick('all');
    setQuery('');
  }, []);

  const header = (
    <View style={{ paddingTop: space.sm, paddingBottom: space.md, gap: space.lg }}>
      <View
        style={{
          paddingHorizontal: space.xl,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: space.md,
        }}
      >
        <View style={{ flex: 1, gap: 2 }}>
          <Text variant="title">Library</Text>
          <Text variant="small" tone="muted">
            {index.length} exercises, offline and yours
          </Text>
        </View>
        <IconButton
          icon={Plus}
          label="New exercise"
          variant="surface"
          size={46}
          onPress={() => setCreateOpen(true)}
        />
      </View>

      <View style={{ paddingHorizontal: space.xl }}>
        <SearchField value={query} onChange={setQuery} />
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: space.xl, gap: space.sm }}
      >
        <Chip
          label="Filters"
          icon={Filter}
          count={activeFilters || undefined}
          selected={activeFilters > 0}
          onPress={() => setFilterOpen(true)}
        />
        <Chip
          label="Favourites"
          icon={Star}
          selected={quick === 'favourites'}
          onPress={() => setQuick(quick === 'favourites' ? 'all' : 'favourites')}
        />
        <Chip
          label="Recently used"
          icon={Clock}
          selected={quick === 'recent'}
          onPress={() => setQuick(quick === 'recent' ? 'all' : 'recent')}
        />
      </ScrollView>
    </View>
  );

  return (
    <Screen header={header} scroll={false} bottomInset={44}>
      <SectionList<Exercise, Section>
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        stickySectionHeadersEnabled
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={12}
        windowSize={9}
        removeClippedSubviews
        ItemSeparatorComponent={() => <Divider />}
        renderSectionHeader={({ section }) => (
          <View
            style={{
              backgroundColor: c.bg,
              paddingTop: space.lg,
              paddingBottom: space.sm,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Text variant="label" tone="faint">
              {section.title}
            </Text>
            {section.caption ? (
              <Text variant="label" tone="faint" numeric>
                {section.caption}
              </Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon={Search}
            title="Nothing matches"
            body={
              quick === 'favourites'
                ? 'Star an exercise on its page and it will collect here.'
                : 'Try a shorter search, or loosen the filters.'
            }
            action={{ label: 'Clear everything', onPress: clearAll }}
            secondaryAction={{ label: 'Create an exercise', onPress: () => setCreateOpen(true) }}
            style={{ marginTop: space.xxl }}
          />
        }
        ListFooterComponent={<View style={{ height: space.xxl }} />}
      />

      <FilterSheet
        visible={filterOpen}
        onClose={() => setFilterOpen(false)}
        value={filters}
        onChange={setFilters}
        matches={byFilters.length}
      />
      <CreateExerciseSheet
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={openExercise}
      />
    </Screen>
  );
}
