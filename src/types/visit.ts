/**
 * Entidade central do app: uma Visita Técnica.
 * Os 7 campos de negócio abaixo replicam o formulário usado hoje em
 * papel/Google Forms. Os demais campos (createdAt, updatedAt,
 * syncStatus, deletedAt) são metadados de controle do mecanismo de
 * persistência local + sincronização (ver src/services/syncService.ts).
 */

export const TECHNICIANS = ['Celio', 'Lucas', 'Eduardo', 'Maicon', 'João'] as const;
export type Technician = (typeof TECHNICIANS)[number];

export const VISIT_TYPES = ['Instalação', 'Manutenção', 'Orçamento'] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

/**
 * - pending: criado/editado localmente, ainda não confirmado no Firestore.
 * - synced: idêntico ao que está no Firestore.
 * - error: a última tentativa de envio falhou (ficará "pending" de novo
 *   na próxima tentativa — ver syncService).
 */
export type SyncStatus = 'pending' | 'synced' | 'error';

export interface Visit {
  /** UUID v4 gerado no dispositivo. É também o id do documento no Firestore,
   *  o que torna o "upsert" de sincronização idempotente. */
  id: string;

  clientName: string;
  osNumber: string;
  /** Formato ISO 'YYYY-MM-DD' */
  visitDate: string;
  /** Formato 'HH:mm' (24h) */
  arrivalTime: string;
  /** Formato 'HH:mm' (24h) */
  departureTime: string;
  technician: Technician;
  visitType: VisitType;

  /** Timestamp (ms) de criação, usado como critério de ordenação. */
  createdAt: number;
  /** Timestamp (ms) da última alteração — usado na resolução de
   *  conflito "last-write-wins" durante a sincronização. */
  updatedAt: number;
  syncStatus: SyncStatus;
  /** Soft delete: marca a intenção de excluir até que a exclusão seja
   *  confirmada no Firestore. Necessário para que deleções feitas
   *  offline também se propaguem ao backend. */
  deletedAt: number | null;
}

/** Dados que o formulário de criação/edição manipula (sem metadados). */
export type VisitInput = Pick<
  Visit,
  | 'clientName'
  | 'osNumber'
  | 'visitDate'
  | 'arrivalTime'
  | 'departureTime'
  | 'technician'
  | 'visitType'
>;

export const EMPTY_VISIT_INPUT: VisitInput = {
  clientName: '',
  osNumber: '',
  visitDate: '',
  arrivalTime: '',
  departureTime: '',
  technician: TECHNICIANS[0],
  visitType: VISIT_TYPES[0],
};
