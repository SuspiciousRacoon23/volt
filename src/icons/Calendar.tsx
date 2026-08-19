import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Calendar({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Rect x={4} y={5} width={16} height={15} rx={2.5} />
      <Path d="M8.5 3v4M15.5 3v4M4 10h16" />
      <Rect x={7} y={13} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={10.8} y={13} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={14.6} y={13} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
    </Svg>
  );
}
