import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Note({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M5 5.5a2 2 0 0 1 2-2h6.5L19 9v9.5a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" fill={filled ? color : 'none'} />
      <Path d="M13.5 3.5V7a2 2 0 0 0 2 2H19" fill="none" />
      <Path d="M8.75 13h6.5M8.75 16.5h4" />
    </Svg>
  );
}
