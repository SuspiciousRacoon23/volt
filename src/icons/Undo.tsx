import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Undo({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
    ><Path d="M4 9.5h9.75a5.5 5.5 0 0 1 0 11H8.5M4 9.5 8.25 5.25M4 9.5l4.25 4.25" />
    </Svg>
  );
}
