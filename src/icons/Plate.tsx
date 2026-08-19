import Svg, { Path, Circle } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Plate({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
        <Path
          fillRule="evenodd"
          fill={color}
          stroke="none"
          d="M12 3.5a8.5 8.5 0 1 1 0 17 8.5 8.5 0 0 1 0-17zm0 6.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5z"
        />
      ) : null}
      {filled ? null : <Circle cx={12} cy={12} r={8.5} />}
      {filled ? null : <Circle cx={12} cy={12} r={5.25} />}
      {filled ? null : <Circle cx={12} cy={12} r={2.25} />}
    </Svg>
  );
}
