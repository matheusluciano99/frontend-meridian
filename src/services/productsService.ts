import { api, Product as ApiProduct } from '@/lib/api';
import { Product } from '@/types';

// Serviço para gerenciar produtos
export class ProductsService {
  // Converte produto da API para o formato do frontend
  private static mapApiProductToProduct(apiProduct: ApiProduct): Product {
    return {
      id: apiProduct.id,
      name: apiProduct.name,
      description: `Cobertura de ${apiProduct.coverage} com proteção completa`,
      basePrice: apiProduct.price / 100, // converter de centavos para reais
      duration: '24 horas', // TODO: adicionar duração no backend
      coverage: apiProduct.coverage,
      rating: 4.5, // TODO: adicionar rating no backend
      popular: apiProduct.code === 'ACCIDENT_48H', // marcar como popular baseado no código
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