import React, { createContext, useContext, useState, useEffect } from 'react';
import { WalletInfo, WalletContextType } from '@/types';
import FreighterApi from '@stellar/freighter-api';
// Removendo importação do Stellar SDK temporariamente

const WalletContext = createContext<WalletContextType | undefined>(undefined);

function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [balanceUpdateInterval, setBalanceUpdateInterval] = useState<NodeJS.Timeout | null>(null);

  // Check if Freighter is available
  const isFreighterAvailable = async () => {
    if (typeof window === 'undefined') return false;
    
    try {
      await FreighterApi.isConnected();
      return true;
    } catch (error) {
      return false;
    }
  };

  // Get Freighter API (now using direct import)
  const getFreighterApi = () => {
    return FreighterApi;
  };

  // Update balance and start automatic updates
  const updateBalance = async () => {
    if (!wallet) return;
    
    try {
      const balance = await _getBalanceInternal();
      setWallet(prev => prev ? { ...prev, balance } : null);
    } catch (error) {
      // Erro silencioso para não poluir logs
    }
  };

  // Start automatic balance updates
  const startBalanceUpdates = () => {
    if (balanceUpdateInterval) {
      clearInterval(balanceUpdateInterval);
    }
    
    // Update balance every 30 seconds
    const interval = setInterval(updateBalance, 30000);
    setBalanceUpdateInterval(interval);
  };

  // Stop automatic balance updates
  const stopBalanceUpdates = () => {
    if (balanceUpdateInterval) {
      clearInterval(balanceUpdateInterval);
      setBalanceUpdateInterval(null);
    }
  };

  // Verificar se a conta precisa ser ativada
  const checkAccountActivation = async (publicKey: string, network: string) => {
    try {
      const baseUrl = network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      
      const accountUrl = `${baseUrl}/accounts/${publicKey}`;
      console.log('🔍 Verificando conta:', accountUrl);
      
      const response = await fetch(accountUrl);
      console.log('📊 Status da resposta:', response.status);
      
      if (response.ok) {
        console.log('✅ Conta ativada');
        return true;
      } else if (response.status === 404) {
        console.log('❌ Conta não encontrada (não ativada)');
        return false;
      } else {
        const errorText = await response.text();
        console.error('🚨 Erro HTTP:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('🚨 Erro ao verificar conta:', error);
      throw error;
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!(await isFreighterAvailable())) {
      throw new Error('Freighter is not installed or available. Please check if the extension is active.');
    }

    setIsConnecting(true);
    try {
      const api = getFreighterApi();
      
      // Check if already connected
      const isConnected = await api.isConnected();
      
      if (!isConnected) {
        // Request permission to connect
        await api.setAllowed();
      }
      
      // Get public key
      const publicKey = await api.getPublicKey();
      
      if (!publicKey) {
        throw new Error('Failed to get wallet public key');
      }

      const walletInfo: WalletInfo = {
        publicKey,
        isConnected: true,
        network: 'testnet', // Por padrão, usar testnet
      };

      setWallet(walletInfo);
      
      // Verificar se a conta precisa ser ativada
      await checkAccountActivation(publicKey, walletInfo.network);
      
      // Try to get balance and start automatic updates
      try {
        const balance = await _getBalanceInternal();
        setWallet(prev => prev ? { ...prev, balance } : null);
        
        // Start automatic balance updates
        startBalanceUpdates();
      } catch (balanceError) {
        // Continue even if balance cannot be obtained
      }
      
    } catch (error) {
      // Try to provide more specific error messages
      if (error.message.includes('User rejected')) {
        throw new Error('Connection rejected by user. Try again and approve the connection in the extension.');
      } else if (error.message.includes('Not installed')) {
        throw new Error('Freighter is not installed. Install the extension and reload the page.');
      } else if (error.message.includes('Not connected')) {
        throw new Error('Freighter is not connected. Open the extension and log in.');
      } else {
        throw new Error(`Connection error: ${error.message}`);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = async () => {
    try {
      // Check if API is available
      if (await isFreighterAvailable()) {
        const api = getFreighterApi();
        
        // Check if connected before trying to disconnect
        const isConnected = await api.isConnected();
        if (isConnected) {
          // Revoke permissions to force new login
          try {
            await api.setAllowed();
          } catch (setAllowedError) {
            // Erro silencioso
          }
        }
      }
    } catch (error) {
      // Continuar mesmo se houver erro na extensão
    }
    
    // Parar atualizações automáticas de saldo
    stopBalanceUpdates();
    
    // Sempre limpar o estado local
    setWallet(null);
  };

  // Assinar transação
  const signTransaction = async (transactionXdr: string): Promise<string> => {
    if (!wallet || !(await isFreighterAvailable())) {
      throw new Error('Carteira não conectada ou Freighter não disponível');
    }

    try {
      const api = getFreighterApi();
      const signedTransaction = await api.signTransaction(transactionXdr, {
        network: wallet.network.toUpperCase(),
        accountToSign: wallet.publicKey,
      });

      return signedTransaction;
    } catch (error) {
      throw error;
    }
  };

  // Função interna para obter saldo (sem atualizar estado)
  const _getBalanceInternal = async (): Promise<number> => {
    if (!wallet || !(await isFreighterAvailable())) {
      console.log('❌ Wallet não disponível para obter saldo');
      return 0;
    }

    try {
      // Configurar URL baseada na rede (usando endpoints públicos)
      const baseUrl = wallet.network === 'testnet' 
        ? 'https://horizon-testnet.stellar.org' 
        : 'https://horizon.stellar.org';
      
      const accountUrl = `${baseUrl}/accounts/${wallet.publicKey}`;
      console.log('💰 Buscando saldo:', accountUrl);
      
      // Obter dados da conta
      const response = await fetch(accountUrl);
      console.log('📊 Status da resposta para saldo:', response.status);
      
      if (!response.ok) {
        if (response.status === 404) {
          console.log('❌ Conta não encontrada para obter saldo');
          return 0;
        }
        const errorText = await response.text();
        console.error('🚨 Erro HTTP ao obter saldo:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const accountData = await response.json();
      console.log('📄 Dados da conta recebidos:', accountData);
      
      // Procurar por XLM (nativo) nos balances
      const xlmBalance = accountData.balances?.find((balance: any) => 
        balance.asset_type === 'native'
      );
      
      if (xlmBalance) {
        const balance = parseFloat(xlmBalance.balance);
        console.log('✅ Saldo XLM encontrado:', balance);
        return balance;
      } else {
        console.log('⚠️ Nenhum saldo XLM encontrado');
        return 0;
      }
      
    } catch (error) {
      console.error('🚨 Erro ao obter saldo:', error);
      return 0;
    }
  };

  // Função pública para obter saldo (atualiza estado também)
  const getBalance = async (): Promise<number> => {
    const balance = await _getBalanceInternal();
    
    // Atualizar estado da carteira com o novo saldo
    if (wallet) {
      setWallet(prev => prev ? { ...prev, balance } : null);
    }
    
    return balance;
  };

  // Verificar conexão ao carregar
  useEffect(() => {
    const checkConnection = async () => {
      if (await isFreighterAvailable()) {
        try {
          const api = getFreighterApi();
          const isConnected = await api.isConnected();
          
          if (isConnected) {
            const publicKey = await api.getPublicKey();
            
            if (publicKey) {
              const walletInfo: WalletInfo = {
                publicKey,
                isConnected: true,
                network: 'testnet',
              };
              setWallet(walletInfo);
              
              // Tentar obter saldo e iniciar atualizações
              try {
                const balance = await _getBalanceInternal();
                setWallet(prev => prev ? { ...prev, balance } : null);
                
                // Start automatic balance updates
                startBalanceUpdates();
              } catch (balanceError) {
                // Erro silencioso
              }
            }
          }
        } catch (error) {
          // Erro silencioso
        }
      }
    };

    checkConnection();
    
    // Cleanup quando o componente for desmontado
    return () => {
      stopBalanceUpdates();
    };
  }, []);

  // Verificar ativação da conta (função pública)
  const checkAccountActivationPublic = async (): Promise<boolean> => {
    if (!wallet) {
      throw new Error('Carteira não conectada');
    }
    
    return await checkAccountActivation(wallet.publicKey, wallet.network);
  };

  // Solicitar fundos de teste
  const requestTestnetFunds = async (): Promise<boolean> => {
    if (!wallet || wallet.network !== 'testnet') {
      throw new Error('Apenas disponível para testnet');
    }

    try {
      console.log('🪙 Solicitando fundos de teste para:', wallet.publicKey);
      
      const response = await fetch('https://horizon-testnet.stellar.org/friendbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addr: wallet.publicKey
        })
      });

      if (response.ok) {
        console.log('✅ Fundos de teste solicitados com sucesso');
        return true;
      } else {
        const errorText = await response.text();
        console.error('🚨 Erro ao solicitar fundos:', response.status, errorText);
        return false;
      }
    } catch (error) {
      console.error('🚨 Erro ao solicitar fundos de teste:', error);
      return false;
    }
  };

  return (
    <WalletContext.Provider value={{
      wallet,
      isConnecting,
      connectWallet,
      disconnectWallet,
      signTransaction,
      getBalance,
      checkAccountActivation: checkAccountActivationPublic,
      requestTestnetFunds
    }}>
      {children}
    </WalletContext.Provider>
  );
}

// Hook customizado para usar o contexto
export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

// Exportação do provider
export { WalletProvider };

// Declaração de tipos para window.freighterApi (mantida para compatibilidade)
declare global {
  interface Window {
    freighterApi?: any;
    freighter?: any;
    stellar?: {
      freighter?: any;
    };
    freighterReady?: boolean;
  }
}