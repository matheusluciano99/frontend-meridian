export interface User {
  id: string;
  email: string;
  name: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  balance: number;
}

export interface Product {
  id: string;
  code?: string;
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
  features: string[];
  recommended?: boolean;
  trending?: boolean;
  new?: boolean;
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
  user_id: string;
  product_id: string;
  policy_number: string;
  status: 'PENDING_FUNDING' | 'PENDING_ACTIVATION' | 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'EXPIRED';
  premium_amount: number; // valor total originalmente cotado (se aplicável)
  coverage_amount: number;
  start_date: string | null;
  end_date: string | null;
  auto_renewal: boolean;
  created_at: string;
  updated_at: string;
  funding_balance_xlm?: number;
  hourly_rate_xlm?: number;
  total_premium_paid_xlm?: number;
  next_charge_at?: string | null;
  last_charge_at?: string | null;
  billing_model?: string;
  coverage_limit_xlm?: number;
  product?: {
    id: string;
    name: string;
    code: string;
    coverage_amount: number;
    coverage_duration: number;
    coverage_type: string;
  };
  transaction_hash?: string; // compat histórico
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

// Tipos para integração com Freighter
export interface WalletInfo {
  publicKey: string;
  isConnected: boolean;
  network: 'testnet' | 'mainnet';
  balance?: number;
}

export interface WalletContextType {
  wallet: WalletInfo | null;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => Promise<void>;
  signTransaction: (transactionXdr: string) => Promise<string>;
  getBalance: () => Promise<number>;
  checkAccountActivation: () => Promise<boolean>;
  requestTestnetFunds: () => Promise<boolean>;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'xlm' | 'pix' | 'anchor' | 'freighter';
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: number;
  available: boolean;
}

export interface DepositResponse {
  interactiveUrl: string;
  anchorTransaction: AnchorTransaction;
  walletPublicKey: string;
}

export interface AnchorTransaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw';
  asset_code: string;
  amount: string | number;
  status: string; // PENDING, COMPLETED, etc
  memo?: string;
  created_at: string;
  updated_at: string;
  extra?: any; // contém collectPremiumTx, activatePolicyTx, chainError
}