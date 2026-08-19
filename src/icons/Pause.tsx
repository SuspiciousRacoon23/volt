import Svg, { Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Pause({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Rect x={7.25} y={5} width={3.5} height={14} rx={1.25} fill={filled ? color : 'none'} />
      <Rect x={13.25} y={5} width={3.5} height={14} rx={1.25} fill={filled ? color : 'none'} />
    </Svg>
  );
}
