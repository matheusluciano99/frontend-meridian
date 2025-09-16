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
    getAllForAdmin: () => api.request<Product[]>('/products/admin'),
    getById: (id: string) => api.request<Product>(`/products/${id}`),
    create: (product: any) => api.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
    update: (id: string, product: any) => api.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
    delete: (id: string) => api.request<{ message: string }>(`/products/${id}`, {
      method: 'DELETE',
    }),
  },
  policies: {
    getAll: (userId?: string) => api.request<any[]>(`/policies${userId ? `?userId=${userId}` : ''}`),
    pause: (id: string) => api.request<any>(`/policies/${id}/pause`, { method: 'POST' }),
    activate: (id: string) => api.request<any>(`/policies/${id}/activate`, { method: 'POST' }),
  },
  ledger: {
    getAll: (userId?: string) => api.request<any[]>(`/ledger${userId ? `?userId=${userId}` : ''}`),
  },
  claims: {
    getAll: (userId: string) => api.request<any[]>(`/claims?userId=${userId}`),
    create: (payload: any) => api.request<any>(`/claims`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  },
  anchors: {
    deposit: (payload: { userId: string; amount: number }) =>
      api.request<any>(`/anchors/deposit`, { method: 'POST', body: JSON.stringify(payload) }),
    transactions: (userId: string) =>
      api.request<any[]>(`/anchors/transactions?userId=${userId}`),
    reconcile: () => api.request<any>(`/anchors/reconcile`),
    authChallenge: (publicKey: string) =>
      api.request<any>(`/anchors/auth/challenge`, { method: 'POST', body: JSON.stringify({ publicKey }) }),
    authVerify: (publicKey: string, signedXdr: string) =>
      api.request<any>(`/anchors/auth/verify`, { method: 'POST', body: JSON.stringify({ publicKey, signedXdr }) }),
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