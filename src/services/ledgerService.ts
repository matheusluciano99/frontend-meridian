import { api } from '@/lib/api';

export interface RawLedgerEntry {
  id: string;
  user_id?: string;
  policy_id?: string;
  event_type: string;
  event_data?: any;
  amount?: number | null;
  currency?: string | null;
  created_at: string;
}

export interface LedgerEventUI {
  id: string;
  type: string;
  description: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  policyId?: string;
}

// Mapear tipos de event_type do backend para UI
const TYPE_MAP: Record<string, { uiType: string; buildDescription: (e: RawLedgerEntry) => string; defaultAmount?: number }> = {
  policy_created: {
    uiType: 'PolicyActivated',
    buildDescription: (e) => `Apólice criada${e.event_data?.policy_number ? ' ' + e.event_data.policy_number : ''}`,
  },
  policy_activated: {
    uiType: 'PolicyActivated',
    buildDescription: (e) => `Apólice ativada${e.event_data?.policy_number ? ' ' + e.event_data.policy_number : ''}`,
  },
  policy_cancelled: {
    uiType: 'PolicyPaused',
    buildDescription: (e) => `Apólice cancelada`,
  },
  payment_received: {
    uiType: 'WEBHOOK_PAYMENT_CONFIRMED',
    buildDescription: (e) => `Pagamento recebido${e.event_data?.transaction_hash ? ' ' + e.event_data.transaction_hash.slice(0, 6) : ''}`,
  },
};

export class LedgerService {
  static async getUserEvents(userId?: string): Promise<LedgerEventUI[]> {
    const raw = await api.ledger.getAll(userId);
    return raw.map(this.mapToUI).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private static mapToUI(entry: RawLedgerEntry): LedgerEventUI {
    const map = TYPE_MAP[entry.event_type] || {
      uiType: entry.event_type,
      buildDescription: () => entry.event_type,
    };
    const amount = entry.amount ? Number(entry.amount) : 0;
    return {
      id: entry.id,
      type: map.uiType,
      description: map.buildDescription(entry),
      amount,
      timestamp: new Date(entry.created_at),
      status: 'completed',
      txHash: entry.event_data?.transaction_hash,
      policyId: entry.policy_id,
    };
  }
}
