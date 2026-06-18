import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing, type } from '../theme';
import type { Visit } from '../types/visit';
import { SyncStatusBadge } from './SyncStatusBadge';

interface VisitCardProps {
  visit: Visit;
  onPress: () => void;
}

function formatDate(isoDate: string): string {
  if (!isoDate) return '—';
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

const VISIT_TYPE_COLOR: Record<string, string> = {
  Instalação: colors.success,
  Manutenção: colors.accent,
  Orçamento: colors.offline,
};

export function VisitCard({ visit, onPress }: VisitCardProps) {
  const typeColor = VISIT_TYPE_COLOR[visit.visitType] ?? colors.inkMuted;

  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <View style={styles.headerRow}>
        <Text style={type.subtitle} numberOfLines={1}>
          {visit.clientName}
        </Text>
        <SyncStatusBadge status={visit.syncStatus} />
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>OS #{visit.osNumber}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>{formatDate(visit.visitDate)}</Text>
        <Text style={styles.metaDot}>·</Text>
        <Text style={styles.metaText}>
          {visit.arrivalTime} – {visit.departureTime}
        </Text>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.technician}>{visit.technician}</Text>
        <View style={[styles.typeTag, { backgroundColor: typeColor + '22' }]}>
          <Text style={[styles.typeTagText, { color: typeColor }]}>{visit.visitType}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metaText: { ...type.caption, fontVariant: ['tabular-nums'] },
  metaDot: { color: colors.border, fontSize: 13 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  technician: { fontSize: 14, fontWeight: '600', color: colors.ink },
  typeTag: { paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: radius.pill },
  typeTagText: { fontSize: 12, fontWeight: '700' },
});
