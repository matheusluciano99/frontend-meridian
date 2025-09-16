import { api } from '@/lib/api';

export interface PoolBalance {
  stroops: string;
  xlm: string;
}

export interface PoolMetrics {
  current_balance: PoolBalance;
  statistics: {
    total_collected_xlm: number;
    total_paid_out_xlm: number;
    net_balance_xlm: number;
    transaction_count: number;
    collection_count: number;
    payout_count: number;
  };
  recent_transactions: Array<{
    type: string;
    amount_xlm: number;
    policy_id?: string;
    user_id: string;
    created_at: string;
    tx_hash?: string;
  }>;
}

export interface PolicyOnChain {
  id?: number;
  user?: string;
  product?: string;
  amountStroops?: bigint;
  amountXlm?: string;
  active?: boolean;
  raw?: any;
}

class SorobanService {
  async getPoolBalance(): Promise<PoolBalance> {
    return api.request<PoolBalance>('/soroban/pool-balance');
  }

  async getPoolMetrics(): Promise<PoolMetrics> {
    return api.request<PoolMetrics>('/soroban/pool-metrics');
  }

  async getPolicyOnChain(policyId: number): Promise<PolicyOnChain> {
    return api.request<PolicyOnChain>(`/policies/${policyId}/onchain`);
  }
}

export const sorobanService = new SorobanService();