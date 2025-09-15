export interface User {
  id: string;
  email: string;
  name: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  coverage: string;
  rating: number;
  popular?: boolean;
  category: string;
  coverageAmount: number;
  minDuration: number;
  maxDuration: number;
}

export interface ProductDetails extends Product {
  longDescription: string;
  pricePerHour: number;
  minDuration: number;
  maxDuration: number;
  benefits: string[];
  exclusions: string[];
}

export interface Policy {
  id: string;
  userId: string;
  productId: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  startTime: Date;
  endTime: Date;
  totalCost: number;
  accumulatedCost: number;
  stellarTxHash: string;
}

export interface LedgerEvent {
  id: string;
  type: 'CHARGE_STARTED' | 'WEBHOOK_PAYMENT_CONFIRMED' | 'PolicyActivated' | 'PolicyPaused' | 'PolicyExpired';
  description: string;
  amount: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  policyId?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface SorobanResponse {
  txHash: string;
  success: boolean;
  message?: string;
}