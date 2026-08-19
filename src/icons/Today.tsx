import Svg, { Path, Rect } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Today({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      {filled ? (
        <Path
          fillRule="evenodd"
          fill={color}
          stroke="none"
          d="M4 10h16v7.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5zM8.5 13h2.5a1.5 1.5 0 0 1 1.5 1.5v2a1.5 1.5 0 0 1-1.5 1.5H8.5A1.5 1.5 0 0 1 7 16.5v-2A1.5 1.5 0 0 1 8.5 13z"
        />
      ) : (
        <Rect x={7} y={13} width={5.5} height={5} rx={1.5} />
      )}
    </Svg>
  );
}
