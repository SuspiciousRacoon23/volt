import Svg, { Path, Rect, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Info({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Circle cx={12} cy={12} r={8.75} />
      <Path d="M12 11.25v5.25" />
      <Rect x={10.95} y={6.85} width={2.1} height={2.1} rx={0.7} fill={color} stroke="none" />
    </Svg>
  );
}
