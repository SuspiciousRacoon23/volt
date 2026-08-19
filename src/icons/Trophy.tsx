import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Trophy({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0z" fill={filled ? color : 'none'} />
      <Path d="M7.5 5.5H5.25v1.25A3.25 3.25 0 0 0 8.5 10M16.5 5.5h2.25v1.25A3.25 3.25 0 0 1 15.5 10" />
      <Path d="M12 13v3.5M8 20.5h8M9.75 20.5V19a1.5 1.5 0 0 1 1.5-1.5h1.5A1.5 1.5 0 0 1 14.25 19v1.5" />
    </Svg>
  );
}
