import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Warning({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M10.7 4.15 2.6 18.2A1.5 1.5 0 0 0 3.9 20.5h16.2a1.5 1.5 0 0 0 1.3-2.3L13.3 4.15a1.5 1.5 0 0 0-2.6 0z" />
      <Path d="M12 9.5v4.75" />
      <Rect x={10.95} y={16.35} width={2.1} height={2.1} rx={0.7} fill={color} stroke="none" />
    </Svg>
  );
}
