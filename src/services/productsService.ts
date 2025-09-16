import { api, Product as ApiProduct } from '@/lib/api';
import { Product } from '@/types';

// Serviço para gerenciar produtos
export class ProductsService {
  // Converte produto da API para o formato do frontend
  private static mapApiProductToProduct(apiProduct: ApiProduct): any {
    return {
      id: apiProduct.id,
      code: apiProduct.code, // incluir código para mapeamento de ícones
      name: apiProduct.name,
      description: apiProduct.description || `Cobertura de ${apiProduct.coverage} com proteção completa`,
      basePrice: apiProduct.price / 100, // converter de centavos para reais
      duration: `${apiProduct.coverage_duration} dias`, // usar duração da API
      coverage: `R$ ${apiProduct.coverage_amount.toLocaleString('pt-BR')}`, // formatar como moeda
      rating: 4.5, // TODO: adicionar rating no backend
      popular: apiProduct.code === 'ACCIDENT_48H', // marcar como popular baseado no código
      category: apiProduct.coverage_type,
      coverageAmount: apiProduct.coverage_amount,
      minDuration: 1, // duração mínima em horas
      maxDuration: apiProduct.coverage_duration * 24, // converter dias para horas
      features: ['Ativação instantânea', 'Cobertura 24/7', 'Sem burocracia', 'Pagamento via PIX'], // features padrão
      recommended: apiProduct.code === 'ACCIDENT_48H' || apiProduct.code === 'TRAVEL_7D', // produtos recomendados
      trending: apiProduct.code === 'ACCIDENT_48H', // produtos em alta
      new: false, // por enquanto nenhum é novo
    };
  }

  // Buscar todos os produtos
  static async getAllProducts(): Promise<Product[]> {
    try {
      const apiProducts = await api.products.getAll();
      return apiProducts.map(this.mapApiProductToProduct);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      throw new Error('Não foi possível carregar os produtos. Tente novamente.');
    }
  }

  // Buscar produto por ID
  static async getProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.getAllProducts();
      return products.find(product => product.id === id) || null;
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      return null;
    }
  }
}