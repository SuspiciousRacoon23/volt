import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Streak({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      {filled ? (
        <Path d="M3.25 20.5V17h4.5v-3.5h4.5V10h4.5V6.5h4v14z" fill={color} stroke="none" />
      ) : null}
      <Path d="M3.25 20.5V17h4.5v-3.5h4.5V10h4.5V6.5h4" />
    </Svg>
  );
}
