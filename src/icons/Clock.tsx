import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Clock({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Circle cx={12} cy={12} r={8.5} />
      <Path d="M12 6.75V12l3.5 2" />
    </Svg>
  );
}
