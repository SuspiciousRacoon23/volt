import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Barbell({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M2.25 12h19.5" />
      <Rect x={5.5} y={6.5} width={3.25} height={11} rx={1.2} fill={filled ? color : 'none'} />
      <Rect x={15.25} y={6.5} width={3.25} height={11} rx={1.2} fill={filled ? color : 'none'} />
      <Path d="M3.5 9.25v5.5M20.5 9.25v5.5" />
    </Svg>
  );
}
