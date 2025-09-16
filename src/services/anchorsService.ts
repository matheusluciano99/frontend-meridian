import { api } from '@/lib/api';
import { AnchorTransaction } from '@/types';

export class AnchorsService {
  static async deposit(userId: string, amount: number) {
    const res = await api.anchors.deposit({ userId, amount });
    return res;
  }

  static async list(userId: string): Promise<AnchorTransaction[]> {
    return api.anchors.transactions(userId);
  }

  static async reconcile() {
    return api.anchors.reconcile();
  }

  static async derivedBalance(userId: string) {
    const txs = await this.list(userId);
    const deposits = txs.filter(t => t.type === 'deposit' && t.status === 'COMPLETED');
    const total = deposits.reduce((sum, t) => sum + parseFloat(String(t.amount)), 0);
    return total;
  }
}
