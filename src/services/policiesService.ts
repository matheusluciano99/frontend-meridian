import { supabase } from '@/lib/supabase';

export interface Policy {
  id: string;
  user_id: string;
  product_id: string;
  policy_number: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  premium_amount: number;
  coverage_amount: number;
  start_date: string;
  end_date: string;
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    code: string;
    coverage_amount: number;
    coverage_duration: number;
    coverage_type: string;
  };
}

export interface CreatePolicyRequest {
  userId: string;
  productId: string;
}

export class PoliciesService {
  // Obter token de autenticação
  private static async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  // Criar uma nova apólice
  static async create(request: CreatePolicyRequest): Promise<Policy> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/policies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao criar apólice: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar apólice:', error);
      throw new Error('Não foi possível criar a apólice. Tente novamente.');
    }
  }

  // Ativar uma apólice
  static async activate(policyId: string): Promise<Policy> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}/activate`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao ativar apólice: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao ativar apólice:', error);
      throw new Error('Não foi possível ativar a apólice. Tente novamente.');
    }
  }

  // Buscar apólices do usuário
  static async getUserPolicies(userId: string): Promise<Policy[]> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/policies?userId=${userId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar apólices: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar apólices:', error);
      throw new Error('Não foi possível carregar suas apólices.');
    }
  }

  // Buscar apólice por ID
  static async getById(policyId: string): Promise<Policy> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar apólice: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar apólice:', error);
      throw new Error('Não foi possível carregar a apólice.');
    }
  }
}
