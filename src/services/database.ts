import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Visit } from '../types/visit';

/**
 * Camada de acesso ao armazenamento local (agora usando AsyncStorage).
 * Este é o "source of truth" para a UI: toda leitura e escrita do app
 * passa por aqui primeiro — o Firestore é tratado como um espelho remoto,
 * nunca como a fonte imediata de dados.
 */

const STORAGE_KEY = '@visita_tecnica_visits';

async function getAllVisitsLocal(): Promise<Visit[]> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (error) {
    console.error('Erro ao ler visitas do AsyncStorage', error);
    return [];
  }
}

async function saveAllVisitsLocal(visits: Visit[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(visits));
  } catch (error) {
    console.error('Erro ao salvar visitas no AsyncStorage', error);
  }
}

/** Cria a tabela na primeira execução (no SQLite). No AsyncStorage, mantemos apenas por compatibilidade com o App.tsx. */
export async function initDatabase(): Promise<void> {
  return Promise.resolve();
}

export async function insertVisitLocal(visit: Visit): Promise<void> {
  const visits = await getAllVisitsLocal();
  visits.push(visit);
  await saveAllVisitsLocal(visits);
}

export async function updateVisitLocal(visit: Visit): Promise<void> {
  const visits = await getAllVisitsLocal();
  const index = visits.findIndex(v => v.id === visit.id);
  if (index >= 0) {
    visits[index] = visit;
    await saveAllVisitsLocal(visits);
  }
}

/** Visitas "vivas" (não excluídas), para a tela de listagem. */
export async function getActiveVisitsLocal(): Promise<Visit[]> {
  const visits = await getAllVisitsLocal();
  const active = visits.filter(v => v.deletedAt === null);
  
  // Ordenar: primeiro por data decrescente, depois por horário decrescente
  active.sort((a, b) => {
    if (a.visitDate !== b.visitDate) {
      return a.visitDate > b.visitDate ? -1 : 1;
    }
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime > b.arrivalTime ? -1 : 1;
    }
    return 0;
  });
  
  return active;
}

export async function getVisitByIdLocal(id: string): Promise<Visit | null> {
  const visits = await getAllVisitsLocal();
  return visits.find(v => v.id === id) ?? null;
}

/** Tudo que ainda não foi confirmado no Firestore (criado, editado ou
 *  marcado para exclusão enquanto o app estava offline). */
export async function getPendingVisitsLocal(): Promise<Visit[]> {
  const visits = await getAllVisitsLocal();
  return visits.filter(v => v.syncStatus !== 'synced');
}

/** Remove a linha de fato — só deve ser chamado depois que a exclusão
 *  remota (Firestore) já foi confirmada pelo syncService. */
export async function hardDeleteVisitLocal(id: string): Promise<void> {
  let visits = await getAllVisitsLocal();
  visits = visits.filter(v => v.id !== id);
  await saveAllVisitsLocal(visits);
}

/**
 * Mescla uma visita recebida do Firestore com o que existe localmente.
 * Regra de conflito (MVP, "last-write-wins" por updatedAt):
 *  - Se não existe localmente: insere.
 *  - Se existe e está tudo sincronizado: o remoto sempre prevalece.
 *  - Se existe uma edição local pendente mais recente que a remota: a
 *    versão local é preservada (ela ainda vai ser enviada no próximo push).
 */
export async function upsertFromRemoteLocal(remote: Visit): Promise<void> {
  const existing = await getVisitByIdLocal(remote.id);

  if (!existing) {
    await insertVisitLocal({ ...remote, syncStatus: 'synced' });
    return;
  }

  const localHasNewerPendingChange =
    existing.syncStatus !== 'synced' && existing.updatedAt > remote.updatedAt;

  if (localHasNewerPendingChange) {
    return;
  }

  await updateVisitLocal({ ...remote, syncStatus: 'synced' });
}
