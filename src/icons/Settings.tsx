import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Settings({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path d="M11 2.9a2 2 0 0 1 2 0l6.5 3.75a2 2 0 0 1 1 1.73v7.24a2 2 0 0 1-1 1.73L13 21.1a2 2 0 0 1-2 0l-6.5-3.75a2 2 0 0 1-1-1.73V8.38a2 2 0 0 1 1-1.73z" />
      <Circle cx={12} cy={12} r={3.25} fill={filled ? color : 'none'} />
    </Svg>
  );
}
