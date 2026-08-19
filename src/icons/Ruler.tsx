import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Ruler({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path
        d="M3.4 15.9 15.9 3.4a2 2 0 0 1 2.83 0l1.87 1.87a2 2 0 0 1 0 2.83L8.1 20.6a2 2 0 0 1-2.83 0l-1.87-1.87a2 2 0 0 1 0-2.83z"
        fill={filled ? color : 'none'}
      />
      <Path d="m7.6 11.7 2.2 2.2M10.6 8.7l2.2 2.2M13.6 5.7l2.2 2.2" />
    </Svg>
  );
}
