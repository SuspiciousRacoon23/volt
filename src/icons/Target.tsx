import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Target({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Circle cx={12} cy={12} r={8.5} />
      <Circle cx={12} cy={12} r={4.25} fill={filled ? color : 'none'} />
      {filled ? null : <Rect x={10.85} y={10.85} width={2.3} height={2.3} rx={0.75} fill={color} stroke="none" />}
      <Path d="M12 1.75v1.75M12 20.5v1.75M1.75 12H3.5M20.5 12h1.75" />
    </Svg>
  );
}
