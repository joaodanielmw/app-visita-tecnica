import { collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import type { Visit } from '../types/visit';
import {
  getPendingVisitsLocal,
  updateVisitLocal,
  hardDeleteVisitLocal,
  upsertFromRemoteLocal,
} from './database';

/**
 * Estratégia de sincronização (MVP)
 * ---------------------------------------------------------------------
 * Cada usuário autenticado tem sua própria subcoleção em
 * "users/{uid}/visits/{visitId}". O id do documento é o mesmo UUID
 * gerado localmente, o que torna o envio (push) idempotente: reenviar a
 * mesma visita duas vezes faz um simples "upsert", nunca duplica.
 *
 * O campo local "syncStatus" funciona como a própria fila de
 * sincronização — não existe uma tabela de fila separada. Isso é
 * suficiente para o volume de dados de um app de checklist de visitas
 * (dezenas/centenas de registros por técnico) e simplifica bastante o
 * código; um app com volume muito maior provavelmente justificaria uma
 * fila de operações dedicada (outbox pattern).
 *
 * Resolução de conflito: "last-write-wins" comparando updatedAt (ver
 * upsertFromRemoteLocal em database.ts). Limitação conhecida e
 * documentada no README: se os dois integrantes da dupla editarem a
 * MESMA visita offline ao mesmo tempo, o registro mais recente
 * (por timestamp) sobrescreve o outro por completo — não há merge de
 * campo a campo.
 */

export interface SyncResult {
  pushed: number;
  pushFailed: number;
  pulled: number;
  syncedAt: number;
}

function visitsCollection(uid: string) {
  return collection(db, 'users', uid, 'visits');
}

async function pushPendingVisits(uid: string): Promise<{ pushed: number; pushFailed: number }> {
  const pending = await getPendingVisitsLocal();
  let pushed = 0;
  let pushFailed = 0;

  for (const visit of pending) {
    try {
      if (visit.deletedAt) {
        await deleteDoc(doc(visitsCollection(uid), visit.id));
        await hardDeleteVisitLocal(visit.id);
      } else {
        const payload: Omit<Visit, 'id' | 'syncStatus' | 'deletedAt'> = {
          clientName: visit.clientName,
          osNumber: visit.osNumber,
          visitDate: visit.visitDate,
          arrivalTime: visit.arrivalTime,
          departureTime: visit.departureTime,
          technician: visit.technician,
          visitType: visit.visitType,
          createdAt: visit.createdAt,
          updatedAt: visit.updatedAt,
        };
        await setDoc(doc(visitsCollection(uid), visit.id), payload);
        await updateVisitLocal({ ...visit, syncStatus: 'synced' });
      }
      pushed++;
    } catch (error) {
      console.warn('[sync] Falha ao enviar visita', visit.id, error);
      pushFailed++;
      try {
        await updateVisitLocal({ ...visit, syncStatus: 'error' });
      } catch {
        // Se até a atualização local falhar, seguimos para a próxima
        // visita — a próxima sincronização tentará de novo.
      }
    }
  }

  return { pushed, pushFailed };
}

async function pullRemoteVisits(uid: string): Promise<number> {
  const snapshot = await getDocs(visitsCollection(uid));
  let pulled = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data() as Omit<Visit, 'id' | 'syncStatus' | 'deletedAt'>;
    await upsertFromRemoteLocal({
      id: docSnap.id,
      ...data,
      syncStatus: 'synced',
      deletedAt: null,
    });
    pulled++;
  }

  return pulled;
}

/**
 * Executa um ciclo completo: primeiro envia tudo que está pendente,
 * depois busca o estado atual do servidor. Pensado para ser chamado:
 * (1) ao abrir o app, (2) quando a conectividade volta, (3) manualmente
 * via um botão "Sincronizar agora".
 */
export async function runFullSync(uid: string): Promise<SyncResult> {
  const { pushed, pushFailed } = await pushPendingVisits(uid);
  const pulled = await pullRemoteVisits(uid);

  return { pushed, pushFailed, pulled, syncedAt: Date.now() };
}
