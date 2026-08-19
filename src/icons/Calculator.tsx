import Svg, { Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Calculator({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Rect x={4.5} y={3} width={15} height={18} rx={3} />
      <Rect x={8} y={6.5} width={8} height={3} rx={1} fill={filled ? color : 'none'} />
      <Rect x={7.6} y={12.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
      <Rect x={10.9} y={12.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
      <Rect x={14.2} y={12.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
      <Rect x={7.6} y={16.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
      <Rect x={10.9} y={16.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
      <Rect x={14.2} y={16.2} width={2.2} height={2.2} rx={0.7} fill={color} stroke="none" />
    </Svg>
  );
}
