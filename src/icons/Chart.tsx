import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Chart({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M3.5 3.5v14.5a2.5 2.5 0 0 0 2.5 2.5h14.5" />
      {filled ? <Path d="M6 16.5 10.5 12l3.5 3.5L19.5 8v12.5H6z" fill={color} stroke="none" /> : null}
      <Path d="M6 16.5 10.5 12l3.5 3.5L19.5 8" />
      <Path d="M19.5 5.75 21.75 8 19.5 10.25 17.25 8z" fill={filled ? color : 'none'} />
    </Svg>
  );
}
