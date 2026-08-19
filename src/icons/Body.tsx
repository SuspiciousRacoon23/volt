import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Body({ size = 24, color = ICON_INK, strokeWidth = 1.75 }: IconProps) {
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
      <Rect x={10.1} y={2.5} width={3.8} height={3.8} rx={1.5} />
      <Path d="M12 6.3V9M8.5 9h7M12 9v5.5M8.5 9 6 15M15.5 9 18 15M9.5 14.5h5M9.5 14.5 8.5 21.5M14.5 14.5l1 7" />
    </Svg>
  );
}
