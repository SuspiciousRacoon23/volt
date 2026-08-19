import React from 'react';
import Svg, { G, Path } from 'react-native-svg';

export type LogoProps = {
  /** Rendered HEIGHT in points. Width follows the mark's aspect ratio. */
  size?: number;
  /** Letterform / mark colour. */
  color: string;
  /** Electric accent. Used once, for the charge inside the mark. */
  accent: string;
};

const GLYPH_VB = 32;
const WORD_VB_W = 104;
const WORD_VB_H = 32;

/** The V of VOLT, carrying a charge. */
const GLYPH_V = 'M5 5 L16 27 L27 5';
const GLYPH_BOLT = 'M17.6 7 L12 15.4 L15.6 15.4 L14 21.6 L19.8 13 L16.2 13 Z';

/** Bolt sitting inside the counter of the O. */
const WORD_BOLT = 'M43.4 9.4 L36.8 17.2 L40.6 17.2 L38.8 23.4 L45.4 15.2 L41.6 15.2 Z';

export function LogoGlyph({ size = 32, color, accent }: LogoProps): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${GLYPH_VB} ${GLYPH_VB}`}>
      <Path
        d={GLYPH_V}
        fill="none"
        stroke={color}
        strokeWidth={4.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d={GLYPH_BOLT} fill={accent} />
    </Svg>
  );
}

export function Logo({ size = 24, color, accent }: LogoProps): React.JSX.Element {
  const width = (size * WORD_VB_W) / WORD_VB_H;
  return (
    <Svg width={width} height={size} viewBox={`0 0 ${WORD_VB_W} ${WORD_VB_H}`}>
      <G
        fill="none"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round">
        {/* V */}
        <Path d="M5 6 L14 26 L23 6" />
        {/* O */}
        <Path d="M41 6 C46.5 6 51 10.5 51 16 C51 21.5 46.5 26 41 26 C35.5 26 31 21.5 31 16 C31 10.5 35.5 6 41 6 Z" />
        {/* L */}
        <Path d="M59 6 L59 26 L73 26" />
        {/* T */}
        <Path d="M80 6 L100 6" />
        <Path d="M90 6 L90 26" />
      </G>
      <Path d={WORD_BOLT} fill={accent} />
    </Svg>
  );
}

export default Logo;
