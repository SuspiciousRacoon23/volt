import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Joint({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M8.5 2.5v5.5a2.75 2.75 0 0 0 2.75 2.75h1.5A2.75 2.75 0 0 0 15.5 8V2.5" />
      <Path d="M8.5 21.5V16a2.75 2.75 0 0 1 2.75-2.75h1.5A2.75 2.75 0 0 1 15.5 16v5.5" />
      <Path d="M10 12h4" />
    </Svg>
  );
}
