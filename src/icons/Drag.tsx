import Svg, { Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Drag({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Rect x={7.4} y={5.4} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={14.2} y={5.4} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={7.4} y={10.8} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={14.2} y={10.8} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={7.4} y={16.2} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
      <Rect x={14.2} y={16.2} width={2.4} height={2.4} rx={0.8} fill={color} stroke="none" />
    </Svg>
  );
}
