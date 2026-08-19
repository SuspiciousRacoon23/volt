import Svg, { Path } from 'react-native-svg';

import { ICON_INK } from './types';
import type { IconProps } from './types';

export function Brain({ size = 24, color = ICON_INK, strokeWidth = 1.75, filled = false }: IconProps) {
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
      <Path
        d="M12 5.2c-1.4-1.6-3.8-1.3-4.8.2-2 0-3.2 1.7-2.6 3.5-1.5 1.3-1.2 3.7.5 4.6-.4 2.1 1.2 3.9 3.3 3.8.6 1.9 2.6 2.6 3.6 1.6"
        fill={filled ? color : 'none'}
      />
      <Path
        d="M12 5.2c1.4-1.6 3.8-1.3 4.8.2 2 0 3.2 1.7 2.6 3.5 1.5 1.3 1.2 3.7-.5 4.6.4 2.1-1.2 3.9-3.3 3.8-.6 1.9-2.6 2.6-3.6 1.6"
        fill={filled ? color : 'none'}
      />
      <Path d="M12 5.2v13.7" />
      {filled ? null : (
        <Path d="M8.6 8.6c1.3.2 2.1 1.1 2.1 2.4M15.4 8.6c-1.3.2-2.1 1.1-2.1 2.4M9 14.4c1.1 0 1.7.6 1.7 1.7M15 14.4c-1.1 0-1.7.6-1.7 1.7" />
      )}
    </Svg>
  );
}
