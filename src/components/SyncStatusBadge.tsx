import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { SyncStatus } from '../types/visit';

const CONFIG: Record<SyncStatus, { label: string; bg: string; fg: string }> = {
  synced: { label: 'Sincronizado', bg: colors.successMuted, fg: colors.success },
  pending: { label: 'Pendente', bg: colors.accentMuted, fg: colors.accent },
  error: { label: 'Falha no envio', bg: colors.dangerMuted, fg: colors.danger },
};

export function SyncStatusBadge({ status }: { status: SyncStatus }) {
  const config = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.fg }]} />
      <Text style={[styles.text, { color: config.fg }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12, fontWeight: '700' },
});
