import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Rest({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M7 3.5h10M7 20.5h10" />
      <Path d="M8.25 3.5v2.6c0 2.1 3.75 3.8 3.75 5.9 0-2.1 3.75-3.8 3.75-5.9V3.5" />
      <Path d="M8.25 20.5v-2.6c0-2.1 3.75-3.8 3.75-5.9 0 2.1 3.75 3.8 3.75 5.9v2.6" />
    </Svg>
  );
}
