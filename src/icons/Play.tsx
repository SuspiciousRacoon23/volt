import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Play({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
        d="M8 5.4a1.1 1.1 0 0 1 1.66-.95l9.2 5.5a1.3 1.3 0 0 1 0 2.1l-9.2 5.5A1.1 1.1 0 0 1 8 18.6z"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
}
