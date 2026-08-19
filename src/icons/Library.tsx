import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Library({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Rect x={3.5} y={7} width={4.5} height={13.5} rx={1.5} fill={filled ? color : 'none'} />
      <Rect x={9.75} y={3.5} width={4.5} height={17} rx={1.5} fill={filled ? color : 'none'} />
      <Rect x={16} y={9} width={4.5} height={11.5} rx={1.5} fill={filled ? color : 'none'} />
      {filled ? null : <Path d="M3.5 10.5h4.5M9.75 7h4.5M16 12.5h4.5" />}
    </Svg>
  );
}
