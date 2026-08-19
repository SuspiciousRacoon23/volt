import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Superset({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M6.5 4H5.5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h1" />
      <Rect x={9} y={4} width={11.5} height={5.5} rx={2} fill={filled ? color : 'none'} />
      <Rect x={9} y={14.5} width={11.5} height={5.5} rx={2} fill={filled ? color : 'none'} />
    </Svg>
  );
}
