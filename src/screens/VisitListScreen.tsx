import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AppStackParamList } from '../navigation/AppStack';
import { useVisits } from '../hooks/useVisits';
import { useAuth } from '../context/AuthContext';
import { ConnectivityBanner } from '../components/ConnectivityBanner';
import { VisitCard } from '../components/VisitCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { colors, radius, spacing, type } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'VisitList'>;

export function VisitListScreen({ navigation }: Props) {
  const {
    visits,
    loadState,
    errorMessage,
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingCount,
    refresh,
    syncNow,
  } = useVisits();
  const { user, signOutUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const handlePullToRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    if (isOnline) await syncNow();
    setRefreshing(false);
  }, [refresh, syncNow, isOnline]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.userEmail} numberOfLines={1}>
          {user?.email || 'Convidado'}
        </Text>
        <Pressable onPress={signOutUser} accessibilityRole="button">
          <Text style={styles.logoutText}>Sair</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        <ConnectivityBanner
          isOnline={isOnline}
          isSyncing={isSyncing}
          pendingCount={pendingCount}
          lastSyncedAt={lastSyncedAt}
          onSyncPress={syncNow}
        />

        {loadState === 'loading' && (
          <View style={styles.centerFlex}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        )}

        {loadState === 'error' && (
          <ErrorState message={errorMessage ?? 'Erro desconhecido.'} onRetry={refresh} />
        )}

        {loadState === 'success' && visits.length === 0 && (
          <EmptyState
            title="Nenhuma visita registrada"
            description="Toque no botão abaixo para registrar a primeira visita técnica. Funciona mesmo sem internet."
          />
        )}

        {loadState === 'success' && visits.length > 0 && (
          <FlatList
            data={visits}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <VisitCard
                visit={item}
                onPress={() => navigation.navigate('VisitForm', { visitId: item.id })}
              />
            )}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handlePullToRefresh} tintColor={colors.accent} />
            }
          />
        )}
      </View>

      <Pressable
        style={styles.fab}
        onPress={() => navigation.navigate('VisitForm', undefined)}
        accessibilityRole="button"
        accessibilityLabel="Nova visita"
      >
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  userEmail: { ...type.caption, flex: 1 },
  logoutText: { color: colors.accent, fontWeight: '700', fontSize: 14 },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  centerFlex: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { gap: spacing.sm, paddingBottom: spacing.xl * 2 },
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg,
    width: 58,
    height: 58,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  fabIcon: { color: '#FFFFFF', fontSize: 30, fontWeight: '400', marginTop: -2 },
});
