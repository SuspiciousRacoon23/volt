import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Profile({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Rect x={8.75} y={3.5} width={6.5} height={6.5} rx={2.2} fill={filled ? color : 'none'} />
      {filled ? (
        <Path d="M4.5 20.5v-1a5.5 5.5 0 0 1 5.5-5.5h4a5.5 5.5 0 0 1 5.5 5.5v1z" fill={color} stroke="none" />
      ) : (
        <Path d="M4.5 20.5v-1a5.5 5.5 0 0 1 5.5-5.5h4a5.5 5.5 0 0 1 5.5 5.5v1" />
      )}
    </Svg>
  );
}
