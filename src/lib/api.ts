// Configuração da API do backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = {
  baseURL: API_BASE_URL,

  // Método helper para fazer requests
  async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },

  // Métodos específicos para cada endpoint
  products: {
    getAll: () => api.request<Product[]>('/products'),
  },
  policies: {
    getAll: (userId?: string) => api.request<any[]>(`/policies${userId ? `?userId=${userId}` : ''}`),
    pause: (id: string) => api.request<any>(`/policies/${id}/pause`, { method: 'POST' }),
    activate: (id: string) => api.request<any>(`/policies/${id}/activate`, { method: 'POST' }),
  },
  ledger: {
    getAll: (userId?: string) => api.request<any[]>(`/ledger${userId ? `?userId=${userId}` : ''}`),
  },
};

// Tipos da API (baseados no backend)
export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  price: number; // em centavos
  coverage_amount: number;
  coverage_type: string;
  coverage_duration: number;
  coverage: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}