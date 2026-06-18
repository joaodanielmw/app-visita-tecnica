import * as SQLite from 'expo-sqlite';
import type { Visit } from '../types/visit';

/**
 * Camada de acesso ao SQLite local. Este é o "source of truth" para a UI:
 * toda leitura e escrita do app passa por aqui primeiro — o Firestore é
 * tratado como um espelho remoto, nunca como a fonte imediata de dados
 * (esse é o princípio de offline-first: a tela nunca trava esperando rede).
 */

const DB_NAME = 'visitas.db';
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }
  return dbPromise;
}

/** Cria a tabela na primeira execução. Chamar uma vez na inicialização do app. */
export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS visits (
      id TEXT PRIMARY KEY NOT NULL,
      clientName TEXT NOT NULL,
      osNumber TEXT NOT NULL,
      visitDate TEXT NOT NULL,
      arrivalTime TEXT NOT NULL,
      departureTime TEXT NOT NULL,
      technician TEXT NOT NULL,
      visitType TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      syncStatus TEXT NOT NULL,
      deletedAt INTEGER
    );
  `);
}

export async function insertVisitLocal(visit: Visit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO visits
      (id, clientName, osNumber, visitDate, arrivalTime, departureTime, technician, visitType, createdAt, updatedAt, syncStatus, deletedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      visit.id,
      visit.clientName,
      visit.osNumber,
      visit.visitDate,
      visit.arrivalTime,
      visit.departureTime,
      visit.technician,
      visit.visitType,
      visit.createdAt,
      visit.updatedAt,
      visit.syncStatus,
      visit.deletedAt,
    ]
  );
}

export async function updateVisitLocal(visit: Visit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE visits SET
      clientName = ?, osNumber = ?, visitDate = ?, arrivalTime = ?, departureTime = ?,
      technician = ?, visitType = ?, updatedAt = ?, syncStatus = ?, deletedAt = ?
     WHERE id = ?`,
    [
      visit.clientName,
      visit.osNumber,
      visit.visitDate,
      visit.arrivalTime,
      visit.departureTime,
      visit.technician,
      visit.visitType,
      visit.updatedAt,
      visit.syncStatus,
      visit.deletedAt,
      visit.id,
    ]
  );
}

/** Visitas "vivas" (não excluídas), para a tela de listagem. */
export async function getActiveVisitsLocal(): Promise<Visit[]> {
  const db = await getDb();
  return db.getAllAsync<Visit>(
    `SELECT * FROM visits WHERE deletedAt IS NULL ORDER BY visitDate DESC, arrivalTime DESC`
  );
}

export async function getVisitByIdLocal(id: string): Promise<Visit | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Visit>(`SELECT * FROM visits WHERE id = ?`, [id]);
  return row ?? null;
}

/** Tudo que ainda não foi confirmado no Firestore (criado, editado ou
 *  marcado para exclusão enquanto o app estava offline). */
export async function getPendingVisitsLocal(): Promise<Visit[]> {
  const db = await getDb();
  return db.getAllAsync<Visit>(`SELECT * FROM visits WHERE syncStatus != 'synced'`);
}

/** Remove a linha de fato — só deve ser chamado depois que a exclusão
 *  remota (Firestore) já foi confirmada pelo syncService. */
export async function hardDeleteVisitLocal(id: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(`DELETE FROM visits WHERE id = ?`, [id]);
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
