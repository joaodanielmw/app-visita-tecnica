import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface ConnectivityBannerProps {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncedAt: number | null;
  onSyncPress: () => void;
}

function formatLastSync(timestamp: number | null): string {
  if (!timestamp) return 'ainda não sincronizado nesta sessão';
  const diffMinutes = Math.round((Date.now() - timestamp) / 60000);
  if (diffMinutes < 1) return 'sincronizado agora mesmo';
  if (diffMinutes === 1) return 'sincronizado há 1 minuto';
  if (diffMinutes < 60) return `sincronizado há ${diffMinutes} minutos`;
  const date = new Date(timestamp);
  return `sincronizado às ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes()
  ).padStart(2, '0')}`;
}

export function ConnectivityBanner({
  isOnline,
  isSyncing,
  pendingCount,
  lastSyncedAt,
  onSyncPress,
}: ConnectivityBannerProps) {
  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <View style={[styles.dot, { backgroundColor: colors.offline }]} />
        <Text style={styles.text}>
          Sem conexão — você ainda pode cadastrar e editar visitas, elas serão enviadas quando a
          internet voltar{pendingCount > 0 ? ` (${pendingCount} pendente${pendingCount > 1 ? 's' : ''})` : ''}.
        </Text>
      </View>
    );
  }

  if (pendingCount > 0 || isSyncing) {
    return (
      <Pressable
        style={[styles.banner, styles.pending]}
        onPress={onSyncPress}
        disabled={isSyncing}
        accessibilityRole="button"
      >
        {isSyncing ? (
          <ActivityIndicator size="small" color={colors.accent} />
        ) : (
          <View style={[styles.dot, { backgroundColor: colors.accent }]} />
        )}
        <Text style={styles.text}>
          {isSyncing
            ? 'Sincronizando…'
            : `${pendingCount} visita${pendingCount > 1 ? 's' : ''} pendente${
                pendingCount > 1 ? 's' : ''
              } de envio — toque para sincronizar agora`}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.banner, styles.synced]}>
      <View style={[styles.dot, { backgroundColor: colors.success }]} />
      <Text style={styles.text}>Tudo sincronizado · {formatLastSync(lastSyncedAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
  },
  offline: { backgroundColor: colors.offlineMuted },
  pending: { backgroundColor: colors.accentMuted },
  synced: { backgroundColor: colors.successMuted },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { flex: 1, fontSize: 13, fontWeight: '600', color: colors.ink },
});
