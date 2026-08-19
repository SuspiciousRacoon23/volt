import React from 'react';
import { View } from 'react-native';

import { StatTile } from '@/components/kit';
import type { Session, Unit } from '@/data';
import { fmtDuration, fmtVolume, sessionDurationMs, sessionVolume, sessionWorkingSetCount } from '@/lib';
import { useTheme } from '@/theme';

export type SessionRecapProps = {
  session: Session;
  unit: Unit;
};

/** Duration · volume · sets, in the same three columns everywhere they appear. */
export function SessionRecap({ session, unit }: SessionRecapProps) {
  const { space } = useTheme();
  const volume = fmtVolume(sessionVolume(session), unit);
  const [volValue, volUnit] = splitVolume(volume);

  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <StatTile
        label="Duration"
        value={fmtDuration(sessionDurationMs(session))}
        size="sm"
        style={{ flex: 1 }}
      />
      <StatTile label="Volume" value={volValue} unit={volUnit} size="sm" style={{ flex: 1 }} />
      <StatTile
        label="Sets"
        value={sessionWorkingSetCount(session)}
        size="sm"
        style={{ flex: 1 }}
      />
    </View>
  );
}

/** fmtVolume returns e.g. '8.4t' or '8,400 kg' — keep the unit in its own slot. */
function splitVolume(v: string): [string, string | undefined] {
  const m = /^([\d.,]+)\s*(.*)$/.exec(v.trim());
  if (!m) return [v, undefined];
  return [m[1], m[2] || undefined];
}
