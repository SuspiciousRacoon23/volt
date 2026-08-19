import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Edit({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M16.6 3.9a2.05 2.05 0 0 1 2.9 2.9L8.4 17.9l-4 1.1 1.1-4z" fill={filled ? color : 'none'} />
      <Path d="m14.5 6 3.5 3.5M12.5 20.5h8" />
    </Svg>
  );
}
