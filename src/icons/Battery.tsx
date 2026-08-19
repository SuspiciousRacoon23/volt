import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Battery({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Rect x={2.5} y={7} width={16.5} height={10} rx={3} />
      <Path d="M21.25 10.25v3.5" />
      <Rect x={5.5} y={10} width={2.5} height={4} rx={1} fill={filled ? color : 'none'} />
      <Rect x={9.5} y={10} width={2.5} height={4} rx={1} fill={filled ? color : 'none'} />
      <Rect x={13.5} y={10} width={2.5} height={4} rx={1} fill={filled ? color : 'none'} />
    </Svg>
  );
}
