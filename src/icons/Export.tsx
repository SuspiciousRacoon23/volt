import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Export({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M12 15.5V3.5M7.75 7.75 12 3.5l4.25 4.25" />
      <Path d="M4.5 14.5v4A2.5 2.5 0 0 0 7 21h10a2.5 2.5 0 0 0 2.5-2.5v-4" />
    </Svg>
  );
}
