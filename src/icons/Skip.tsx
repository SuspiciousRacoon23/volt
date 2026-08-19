import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Skip({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M6 5.5 15 12 6 18.5z" fill={filled ? color : 'none'} />
      <Path d="M18.5 5.5v13" />
    </Svg>
  );
}
