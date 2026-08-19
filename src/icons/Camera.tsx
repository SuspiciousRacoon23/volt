import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Camera({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M3 9.5A2.5 2.5 0 0 1 5.5 7h1.6a2 2 0 0 0 1.79-1.11l.61-1.22A1 1 0 0 1 10.4 4.1h3.2a1 1 0 0 1 .9.57l.61 1.22A2 2 0 0 0 16.9 7h1.6A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" />
      <Circle cx={12} cy={13} r={3.75} fill={filled ? color : 'none'} />
    </Svg>
  );
}
