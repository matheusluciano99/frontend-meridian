import { supabase } from '@/lib/supabase';

export interface ClaimBackend {
  id: string;
  claim_number: string;
  policy_id: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  claim_type: string;
  description: string;
  incident_date: string;
  claim_amount: number;
  approved_amount?: number | null;
  documents?: any; // futuro
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimUI {
  id: string;
  claimNumber: string;
  policyId: string;
  status: ClaimBackend['status'];
  claimType: string;
  description: string;
  incidentDate: Date;
  claimAmount: number;
  approvedAmount?: number;
  documents: any[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

function mapClaim(c: ClaimBackend): ClaimUI {
  return {
    id: c.id,
    claimNumber: c.claim_number,
    policyId: c.policy_id,
    status: c.status,
    claimType: c.claim_type,
    description: c.description,
    incidentDate: new Date(c.incident_date),
    claimAmount: Number(c.claim_amount),
    approvedAmount: c.approved_amount ? Number(c.approved_amount) : undefined,
    documents: [],
    notes: c.notes || undefined,
    createdAt: new Date(c.created_at),
    updatedAt: new Date(c.updated_at),
  };
}

export class ClaimsService {
  private static async getAuthToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  static async list(userId: string): Promise<ClaimUI[]> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/claims?userId=${userId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao buscar claims: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return data.map(mapClaim);
    } catch (error) {
      console.error('Erro ao buscar claims:', error);
      throw new Error('Não foi possível carregar os sinistros. Tente novamente.');
    }
  }

  static async create(userId: string, input: { 
    policyId: string; 
    claimType: string; 
    description: string; 
    incidentDate: string; 
    claimAmount: number; 
  }): Promise<ClaimUI> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const payload = {
        userId,
        policyId: input.policyId,
        claimType: input.claimType,
        description: input.description,
        incidentDate: input.incidentDate,
        claimAmount: input.claimAmount,
      };

      const response = await fetch(`${API_BASE_URL}/claims`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao criar sinistro: ${response.statusText} - ${errorText}`);
      }

      const created = await response.json();
      return mapClaim(created);
    } catch (error) {
      console.error('Erro ao criar sinistro:', error);
      throw new Error('Não foi possível criar o sinistro. Tente novamente.');
    }
  }

  static async getById(claimId: string): Promise<ClaimUI> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao buscar sinistro: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      return mapClaim(data);
    } catch (error) {
      console.error('Erro ao buscar sinistro:', error);
      throw new Error('Não foi possível carregar o sinistro.');
    }
  }

  static async getEligibleProducts(): Promise<{ allowedProducts: string[]; message: string }> {
    try {
      const token = await this.getAuthToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/claims/eligible-products`, {
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro detalhado:', errorText);
        throw new Error(`Erro ao buscar produtos elegíveis: ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar produtos elegíveis:', error);
      // Fallback para o valor padrão se a API falhar
      return { allowedProducts: ['INCOME_PER_DIEM'], message: 'Produtos que permitem sinistros no MVP' };
    }
  }
}
