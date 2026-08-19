import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Timer({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Circle cx={12} cy={13.5} r={7.5} />
      <Path d="M9.5 2.5h5M12 2.5v3M12 13.5V9.25M18.7 7.35l1.55-1.55" />
    </Svg>
  );
}
