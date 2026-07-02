import { useCallback, useEffect, useState } from 'react';
import * as Crypto from 'expo-crypto';
import type { Visit, VisitInput } from '../types/visit';
import {
  getActiveVisitsLocal,
  getVisitByIdLocal,
  insertVisitLocal,
  updateVisitLocal as updateVisitRowLocal,
} from '../services/database';
import { runFullSync } from '../services/syncService';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from './useNetworkStatus';

export type LoadState = 'loading' | 'success' | 'error';

interface UseVisitsResult {
  visits: Visit[];
  loadState: LoadState;
  errorMessage: string | null;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  pendingCount: number;
  refresh: () => Promise<void>;
  syncNow: () => Promise<void>;
  createVisit: (input: VisitInput) => Promise<void>;
  updateVisit: (id: string, input: VisitInput) => Promise<void>;
  deleteVisit: (id: string) => Promise<void>;
}

/**
 * Hook central de dados da tela de visitas. Implementa o fluxo
 * offline-first: toda escrita acontece primeiro no SQLite (sempre
 * funciona, com ou sem rede) e, em seguida, dispara uma tentativa de
 * sincronização em segundo plano — que silenciosamente não faz nada se
 * não houver conexão ou usuário autenticado.
 */
export function useVisits(): UseVisitsResult {
  const { user } = useAuth();
  const isOnline = useNetworkStatus();

  const [visits, setVisits] = useState<Visit[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

  const reloadFromLocal = useCallback(async () => {
    const rows = await getActiveVisitsLocal();
    setVisits(rows);
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoadState('loading');
      setErrorMessage(null);
      await reloadFromLocal();
      setLoadState('success');
    } catch (error) {
      console.warn('[useVisits] erro ao carregar dados locais', error);
      setErrorMessage('Não foi possível carregar as visitas salvas no aparelho.');
      setLoadState('error');
    }
  }, [reloadFromLocal]);

  const syncNow = useCallback(async () => {
    if (!user || !isOnline || user.uid === 'guest') return;
    setIsSyncing(true);
    try {
      const result = await runFullSync(user.uid);
      setLastSyncedAt(result.syncedAt);
      await reloadFromLocal();
    } catch (error) {
      console.warn('[useVisits] sincronização falhou', error);
      // Não é tratado como erro fatal de tela: os dados locais continuam
      // disponíveis normalmente, apenas a sincronização não aconteceu
      // desta vez (vai tentar de novo na próxima conexão).
    } finally {
      setIsSyncing(false);
    }
  }, [user, isOnline, reloadFromLocal]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (user && isOnline) {
      syncNow();
    }
    // syncNow muda de identidade a cada render por depender de estado;
    // disparar apenas quando usuário/conectividade mudam é intencional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isOnline]);

  const pendingCount = visits.filter((v) => v.syncStatus !== 'synced').length;

  const createVisit = useCallback(
    async (input: VisitInput) => {
      const now = Date.now();
      const visit: Visit = {
        id: Crypto.randomUUID(),
        ...input,
        createdAt: now,
        updatedAt: now,
        syncStatus: 'pending',
        deletedAt: null,
      };
      await insertVisitLocal(visit);
      await reloadFromLocal();
      if (isOnline && user) syncNow();
    },
    [reloadFromLocal, isOnline, user, syncNow]
  );

  const updateVisit = useCallback(
    async (id: string, input: VisitInput) => {
      const existing = await getVisitByIdLocal(id);
      if (!existing) {
        throw new Error('Visita não encontrada no aparelho.');
      }
      const updated: Visit = {
        ...existing,
        ...input,
        updatedAt: Date.now(),
        syncStatus: 'pending',
      };
      await updateVisitRowLocal(updated);
      await reloadFromLocal();
      if (isOnline && user) syncNow();
    },
    [reloadFromLocal, isOnline, user, syncNow]
  );

  const deleteVisit = useCallback(
    async (id: string) => {
      const existing = await getVisitByIdLocal(id);
      if (!existing) return;
      const marked: Visit = {
        ...existing,
        deletedAt: Date.now(),
        updatedAt: Date.now(),
        syncStatus: 'pending',
      };
      await updateVisitRowLocal(marked);
      await reloadFromLocal();
      if (isOnline && user) syncNow();
    },
    [reloadFromLocal, isOnline, user, syncNow]
  );

  return {
    visits,
    loadState,
    errorMessage,
    isOnline,
    isSyncing,
    lastSyncedAt,
    pendingCount,
    refresh,
    syncNow,
    createVisit,
    updateVisit,
    deleteVisit,
  };
}
