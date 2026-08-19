import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Sun({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Circle cx={12} cy={12} r={4} fill={filled ? color : 'none'} />
      <Path d="M12 2.5V5M12 19v2.5M2.5 12H5M19 12h2.5M5.28 5.28 7.05 7.05M16.95 16.95l1.77 1.77M18.72 5.28 16.95 7.05M7.05 16.95l-1.77 1.77" />
    </Svg>
  );
}
