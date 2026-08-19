import Svg, { Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function More({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Rect x={3.5} y={10.6} width={2.8} height={2.8} rx={0.9} fill={color} stroke="none" />
      <Rect x={10.6} y={10.6} width={2.8} height={2.8} rx={0.9} fill={color} stroke="none" />
      <Rect x={17.7} y={10.6} width={2.8} height={2.8} rx={0.9} fill={color} stroke="none" />
    </Svg>
  );
}
