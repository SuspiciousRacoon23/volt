import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Flame({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
        d="M12 3.2c3.4 2.7 5.3 5.8 5.3 8.8a5.3 5.3 0 0 1-10.6 0c0-1.9.7-3.6 1.9-5 .3 1.5 1 2.3 1.8 2.3 1.1 0 1.6-1.3 1.6-3.6z"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}
