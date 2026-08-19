import React from 'react';
import { View } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';

import { Text } from '@/components/kit';
import type { Unit } from '@/data/types';
import { fmtWeightValue, groupPlates, maxOf } from '@/lib';
import { useTheme } from '@/theme';

const W = 320;
const H = 132;
const MID = H / 2;
const CENTER = W / 2;
const COLLAR = 26;

/** Bigger plates are taller and wider, exactly as they are on the floor. */
function geometry(weight: number, heaviest: number): { h: number; w: number } {
  const ratio = heaviest > 0 ? Math.min(1, weight / heaviest) : 1;
  return {
    h: 34 + 74 * Math.sqrt(ratio),
    w: weight >= 15 ? 13 : weight >= 5 ? 10 : 7,
  };
}

/**
 * One side's plates, mirrored. Drawn rather than listed because loading a bar
 * is a visual act — you match the picture, you do not read a table.
 */
export function Barbell({
  perSide,
  unit,
  inventory,
}: {
  perSide: number[];
  unit: Unit;
  inventory: number[];
}): React.JSX.Element {
  const { c, space } = useTheme();
  const heaviest = maxOf(inventory.length ? inventory : perSide, 25);

  let offset = COLLAR;
  const plates = perSide.map((weight, i) => {
    const g = geometry(weight, heaviest);
    const x = offset;
    offset += g.w + 2;
    const shade = 0.35 + 0.65 * Math.min(1, weight / (heaviest || 1));
    return { key: `${i}-${weight}`, x, ...g, shade };
  });

  return (
    <View style={{ gap: space.sm }}>
      <View style={{ alignItems: 'center' }}>
        <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* bar */}
          <Rect x={12} y={MID - 3} width={W - 24} height={6} rx={3} fill={c.borderStrong} />
          {/* collars */}
          <Rect x={CENTER - COLLAR + 4} y={MID - 9} width={8} height={18} rx={2} fill={c.textFaint} />
          <Rect x={CENTER + COLLAR - 12} y={MID - 9} width={8} height={18} rx={2} fill={c.textFaint} />
          {/* knurl marks */}
          <Line x1={CENTER - 12} y1={MID - 7} x2={CENTER - 12} y2={MID + 7} stroke={c.border} strokeWidth={1.5} />
          <Line x1={CENTER + 12} y1={MID - 7} x2={CENTER + 12} y2={MID + 7} stroke={c.border} strokeWidth={1.5} />

          {plates.map((p) => (
            <React.Fragment key={p.key}>
              <Rect
                x={CENTER + p.x}
                y={MID - p.h / 2}
                width={p.w}
                height={p.h}
                rx={3}
                fill={c.text}
                opacity={p.shade}
              />
              <Rect
                x={CENTER - p.x - p.w}
                y={MID - p.h / 2}
                width={p.w}
                height={p.h}
                rx={3}
                fill={c.text}
                opacity={p.shade}
              />
            </React.Fragment>
          ))}
        </Svg>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, justifyContent: 'center' }}>
        {groupPlates(perSide).length === 0 ? (
          <Text variant="small" tone="faint">
            Empty bar
          </Text>
        ) : (
          groupPlates(perSide).map((g) => (
            <View
              key={g.weight}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: space.md,
                paddingVertical: 6,
                borderRadius: 999,
                backgroundColor: c.surfaceAlt,
              }}
            >
              <Text variant="small" numeric>
                {fmtWeightValue(g.weight, unit)}
              </Text>
              <Text variant="small" tone="faint" numeric>
                x{g.count}
              </Text>
            </View>
          ))
        )}
      </View>
      <Text variant="small" tone="faint" center>
        Per side, inside out.
      </Text>
    </View>
  );
}
