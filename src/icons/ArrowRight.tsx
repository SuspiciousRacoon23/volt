import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function ArrowRight({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
    ><Path d="M4 12h15M13 6l6 6-6 6" />
    </Svg>
  );
}
