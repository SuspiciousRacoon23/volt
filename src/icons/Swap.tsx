import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Swap({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M4 9h13M13.5 5.5 17 9l-3.5 3.5" />
      <Path d="M20 15H7M10.5 11.5 7 15l3.5 3.5" />
    </Svg>
  );
}
