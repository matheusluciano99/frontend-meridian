import { api } from '@/lib/api';
import { Policy } from '@/types';

// Serviço para gerenciar coberturas/apólices
export class CoveragesService {
  // Buscar todas as coberturas do usuário logado
  static async getUserCoverages(userId?: string): Promise<any[]> {
    try {
      const policies = await api.policies.getAll(userId);
      return policies.map(this.mapPolicyToCoverage);
    } catch (error) {
      console.error('Erro ao buscar coberturas:', error);
      throw new Error('Não foi possível carregar as coberturas. Tente novamente.');
    }
  }

  // Pausar uma cobertura
  static async pauseCoverage(coverageId: string): Promise<any> {
    try {
      return await api.policies.pause(coverageId);
    } catch (error) {
      console.error('Erro ao pausar cobertura:', error);
      throw new Error('Não foi possível pausar a cobertura. Tente novamente.');
    }
  }

  // Reativar uma cobertura
  static async resumeCoverage(coverageId: string): Promise<any> {
    try {
      return await api.policies.activate(coverageId);
    } catch (error) {
      console.error('Erro ao reativar cobertura:', error);
      throw new Error('Não foi possível reativar a cobertura. Tente novamente.');
    }
  }

  // Converter policy do backend para formato da cobertura no frontend
  private static mapPolicyToCoverage(policy: any): any {
    const start = policy.start_date ? new Date(policy.start_date) : null;
    const end = policy.end_date ? new Date(policy.end_date) : null;
    let progress = 0;
    if (start && end) {
      const now = new Date();
      const totalMs = end.getTime() - start.getTime();
      const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);
      progress = totalMs > 0 ? elapsedMs / totalMs : 0;
    }
    const accumulatedCost = Number((policy.total_premium_paid_xlm || 0).toFixed(4));
    const hoursRemaining = (() => {
      const bal = policy.funding_balance_xlm || 0;
      const rate = policy.hourly_rate_xlm || 0;
      if (!rate) return null;
      return Number((bal / rate).toFixed(2));
    })();

    return {
      id: policy.id,
      productName: policy.product?.name || policy.product?.code || 'Produto não encontrado',
      status: policy.status,
      startTime: start || null,
      endTime: end || null,
      totalCost: policy.premium_amount || 0,
      accumulatedCost,
      coverage: `R$ ${Number(policy.coverage_amount).toLocaleString('pt-BR')}`,
      stellarTxHash: policy.transaction_hash || 'N/A',
      category: policy.product?.coverage_type || 'geral',
      coverageAmount: Number(policy.coverage_amount),
      popular: policy.product?.code === 'ACCIDENT_48H',
      fundingBalance: policy.funding_balance_xlm || 0,
      hourlyRate: policy.hourly_rate_xlm || 0,
      nextChargeAt: policy.next_charge_at || null,
      hoursRemaining,
    };
  }
}