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
}