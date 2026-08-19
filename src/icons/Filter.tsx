import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Filter({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Path d="M3.5 7h4M11 7h9.5M3.5 12h6.5M13.5 12h7M3.5 17h8.5M15.5 17h5" />
      <Rect x={7.5} y={5.5} width={3} height={3} rx={1} fill={color} stroke="none" />
      <Rect x={10} y={10.5} width={3} height={3} rx={1} fill={color} stroke="none" />
      <Rect x={12} y={15.5} width={3} height={3} rx={1} fill={color} stroke="none" />
    </Svg>
  );
}
