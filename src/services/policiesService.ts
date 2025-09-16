import { supabase } from '@/lib/supabase';
import { Policy } from '@/types';

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

  static async pause(policyId: string): Promise<Policy> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}/pause`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao pausar apólice: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao pausar apólice:', error);
      throw new Error('Não foi possível pausar a apólice. Tente novamente.');
    }
  }

  static async fund(policyId: string, amount: number): Promise<Policy> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}/fund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ amount })
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ao adicionar funding: ${response.statusText} - ${errorText}`);
      }
      return await response.json();
    } catch (e) {
      console.error('Erro funding policy', e);
      throw e;
    }
  }

  static async getCharges(policyId: string): Promise<{ policy_id: string; total: number; charges: any[] }> {
    const token = await this.getAuthToken();
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const res = await fetch(`${API_BASE_URL}/policies/${policyId}/charges`, {
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` }),
      }
    });
    if (!res.ok) throw new Error('Erro ao obter cobranças');
    return res.json();
  }
}
