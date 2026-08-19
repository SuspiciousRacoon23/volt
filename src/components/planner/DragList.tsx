import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Gesture, type PanGesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS, useAnimatedStyle, useSharedValue, withSpring, type SharedValue,
} from 'react-native-reanimated';

import { springs, useReducedMotion } from '@/theme';

export type DragBinding = {
  /** Attach to the handle with <GestureDetector gesture={gesture}>. */
  gesture: PanGesture;
  /** True while this card is the one being carried. */
  dragging: boolean;
};

export type DragListProps = {
  /** Stable keys, in display order. Length drives the list. */
  keys: string[];
  gap: number;
  onReorder: (from: number, to: number) => void;
  renderItem: (index: number, drag: DragBinding) => React.ReactNode;
};

function slotTops(heights: number[]): number[] {
  'worklet';
  const out: number[] = [];
  let acc = 0;
  for (let i = 0; i < heights.length; i += 1) {
    out.push(acc);
    acc += heights[i] ?? 0;
  }
  return out;
}

/**
 * Vertical drag-to-reorder over a normal, variable-height flow layout.
 *
 * A long press on the handle lifts the card; the cards it passes slide out of
 * the way and settle with a spring. On release the card is dropped straight
 * into its slot, so the reorder never flickers. Reduced motion keeps the same
 * behaviour without the springs.
 */
export function DragList({ keys, gap, onReorder, renderItem }: DragListProps) {
  const reduced = useReducedMotion();

  const heights = useSharedValue<number[]>([]);
  const active = useSharedValue(-1);
  const target = useSharedValue(-1);
  const dragY = useSharedValue(0);
  const committed = useSharedValue(0);

  const [activeIndex, setActiveIndex] = useState(-1);
  const measured = useRef<number[]>([]);
  const order = keys.join('|');

  // After a commit the list re-renders in its new order; the carried card is
  // already sitting exactly in its new slot, so clearing here is invisible.
  useEffect(() => {
    committed.value = 0;
    active.value = -1;
    target.value = -1;
    dragY.value = 0;
    setActiveIndex(-1);
  }, [order, active, committed, dragY, target]);

  const onMeasure = useCallback(
    (index: number, e: LayoutChangeEvent) => {
      const h = e.nativeEvent.layout.height + gap;
      if (Math.abs((measured.current[index] ?? 0) - h) < 0.5) return;
      measured.current[index] = h;
      heights.value = measured.current.slice(0, keys.length);
    },
    [gap, heights, keys.length],
  );

  const commit = useCallback(
    (from: number, to: number) => {
      onReorder(from, to);
    },
    [onReorder],
  );

  return (
    <View>
      {keys.map((key, index) => (
        <DragItem
          key={key}
          index={index}
          gap={gap}
          reduced={reduced}
          heights={heights}
          active={active}
          target={target}
          dragY={dragY}
          committed={committed}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onMeasure={onMeasure}
          commit={commit}
          renderItem={renderItem}
        />
      ))}
    </View>
  );
}

type ItemProps = {
  index: number;
  gap: number;
  reduced: boolean;
  heights: SharedValue<number[]>;
  active: SharedValue<number>;
  target: SharedValue<number>;
  dragY: SharedValue<number>;
  committed: SharedValue<number>;
  activeIndex: number;
  setActiveIndex: (i: number) => void;
  onMeasure: (index: number, e: LayoutChangeEvent) => void;
  commit: (from: number, to: number) => void;
  renderItem: (index: number, drag: DragBinding) => React.ReactNode;
};

function DragItem({
  index, gap, reduced, heights, active, target, dragY, committed,
  activeIndex, setActiveIndex, onMeasure, commit, renderItem,
}: ItemProps) {
  const dragging = activeIndex === index;

  const gesture = Gesture.Pan()
    .activateAfterLongPress(200)
    .onStart(() => {
      active.value = index;
      target.value = index;
      dragY.value = 0;
      committed.value = 0;
      runOnJS(setActiveIndex)(index);
    })
    .onUpdate((e) => {
      dragY.value = e.translationY;
      const hs = heights.value;
      if (hs.length < 2) return;
      const tops = slotTops(hs);
      const centre = (tops[index] ?? 0) + e.translationY + (hs[index] ?? 0) / 2;
      let best = index;
      let bestDistance = Number.MAX_VALUE;
      for (let j = 0; j < hs.length; j += 1) {
        const d = Math.abs((tops[j] ?? 0) + (hs[j] ?? 0) / 2 - centre);
        if (d < bestDistance) {
          bestDistance = d;
          best = j;
        }
      }
      target.value = best;
    })
    .onEnd(() => {
      const from = active.value;
      const to = target.value;
      if (to >= 0 && from >= 0 && to !== from) {
        const tops = slotTops(heights.value);
        dragY.value = (tops[to] ?? 0) - (tops[from] ?? 0);
        committed.value = 1;
        runOnJS(commit)(from, to);
      }
    })
    .onFinalize(() => {
      if (committed.value === 1) return;
      active.value = -1;
      target.value = -1;
      dragY.value = reduced ? 0 : withSpring(0, springs.press);
      runOnJS(setActiveIndex)(-1);
    });

  const style = useAnimatedStyle(() => {
    const a = active.value;
    if (a === index) {
      return { transform: [{ translateY: dragY.value }, { scale: reduced ? 1 : 1.015 }] };
    }
    let shift = 0;
    if (a >= 0) {
      const h = heights.value[a] ?? 0;
      const t = target.value;
      if (a < index && index <= t) shift = -h;
      else if (t <= index && index < a) shift = h;
    }
    return {
      transform: [
        { translateY: reduced ? shift : withSpring(shift, springs.glide) },
        { scale: 1 },
      ],
    };
  });

  return (
    <Animated.View
      onLayout={(e) => onMeasure(index, e)}
      style={[{ marginBottom: gap, zIndex: dragging ? 20 : 1 }, style]}
    >
      {renderItem(index, { gesture, dragging })}
    </Animated.View>
  );
}
