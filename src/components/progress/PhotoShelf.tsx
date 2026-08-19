import React from 'react';
import { ScrollView, View } from 'react-native';
import { Image } from 'expo-image';

import { Text } from '@/components/kit';
import type { BodyEntry } from '@/data';
import { Camera } from '@/icons';
import { dateLabel } from '@/lib';
import { hairline, useTheme } from '@/theme';

import { Notice } from './PanelKit';

/**
 * Progress photos. They are read from the entry that stores them, they stay on
 * this device, and nothing here ever leaves it.
 */
export function PhotoShelf({ entries }: { entries: readonly BodyEntry[] }) {
  const { c, radius, space } = useTheme();
  const withPhotos = entries.filter((e) => typeof e.photoUri === 'string' && e.photoUri.length > 0);

  return (
    <View style={{ gap: space.md }}>
      <Notice>Photos stay on this device. VOLT has no account and no network access, so nothing is uploaded.</Notice>

      {withPhotos.length === 0 ? (
        <View
          style={{
            alignItems: 'center',
            gap: space.sm,
            paddingVertical: space.xxl,
            borderRadius: radius.lg,
            borderWidth: hairline,
            borderColor: c.border,
            backgroundColor: c.surface,
          }}
        >
          <Camera size={24} color={c.textFaint} strokeWidth={1.75} />
          <Text variant="h2" center>
            No photos yet
          </Text>
          <Text variant="small" tone="muted" center style={{ maxWidth: 300 }}>
            A photo attached to a body entry appears here, kept beside the weight it was taken at.
          </Text>
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: space.md, paddingRight: space.lg }}
        >
          {withPhotos
            .slice()
            .reverse()
            .map((e) => (
              <View key={e.id} style={{ gap: space.sm }}>
                <Image
                  source={{ uri: e.photoUri }}
                  contentFit="cover"
                  style={{
                    width: 132,
                    height: 176,
                    borderRadius: radius.md,
                    backgroundColor: c.surfaceAlt,
                  }}
                />
                <Text variant="small" tone="faint">
                  {dateLabel(e.date)}
                </Text>
              </View>
            ))}
        </ScrollView>
      )}
    </View>
  );
}
