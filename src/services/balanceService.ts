// Serviço para gerenciar o saldo do usuário
export class BalanceService {
  // TODO: Implementar busca real do saldo via API do backend
  // Por enquanto, retorna um valor mockado
  static async getUserBalance(userId: string): Promise<number> {
    try {
      // Simular delay de API reduzido para melhor UX
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Mock: retornar saldo aleatório entre 0 e 1000 XLM
      const mockBalance = Math.random() * 1000;
      return parseFloat(mockBalance.toFixed(2));
    } catch (error) {
      console.error('Erro ao buscar saldo do usuário:', error);
      return 0;
    }
  }

  // Método para atualizar o saldo localmente (para simular transações)
  static async updateBalance(userId: string, amount: number): Promise<number> {
    try {
      // TODO: Implementar atualização real via API
      // Por enquanto, apenas retorna o valor
      return amount;
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      throw error;
    }
  }
}
