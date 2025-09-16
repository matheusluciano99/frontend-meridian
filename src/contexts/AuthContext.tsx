/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { BalanceService } from '../services/balanceService';
import FreighterApi from '@stellar/freighter-api';

interface User {
  id: string;
  email: string;
  name: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  balance: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateKycStatus: (status: 'pending' | 'verified' | 'rejected') => void;
  updateBalance: (newBalance: number) => void;
  refreshBalance: () => Promise<void>;
  syncWalletBalance: () => Promise<number>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Função para sincronizar saldo da carteira Freighter com o usuário
  const syncWalletBalance = async () => {
    try {
      console.log('🔄 Iniciando sincronização do saldo...');
      
      // Verificar se Freighter está disponível e conectado
      if (typeof window !== 'undefined') {
        const isConnected = await FreighterApi.isConnected();
        console.log('📡 Freighter conectado:', isConnected);
        
        if (isConnected) {
          const publicKey = await FreighterApi.getPublicKey();
          console.log('🔑 Chave pública obtida:', publicKey);
          
          if (publicKey) {
            // Buscar saldo da carteira
            const baseUrl = 'https://horizon-testnet.stellar.org'; // Por padrão, usar testnet
            const accountUrl = `${baseUrl}/accounts/${publicKey}`;
            console.log('🌐 Buscando saldo em:', accountUrl);
            
            const response = await fetch(accountUrl);
            console.log('📊 Status da resposta:', response.status);
            
            if (response.ok) {
              const accountData = await response.json();
              console.log('📄 Dados da conta:', accountData);
              
              const xlmBalance = accountData.balances?.find((balance: any) => 
                balance.asset_type === 'native'
              );
              
              if (xlmBalance) {
                const balance = parseFloat(xlmBalance.balance);
                console.log('💰 Saldo encontrado:', balance);
                
                // Atualizar saldo do usuário
                setUser(prev => {
                  if (prev) {
                    console.log('👤 Atualizando saldo do usuário de', prev.balance, 'para', balance);
                    return { ...prev, balance };
                  }
                  return null;
                });
                return balance;
              } else {
                console.log('⚠️ Nenhum saldo XLM encontrado');
              }
            } else {
              console.log('❌ Erro na resposta da API:', response.status);
            }
          }
        } else {
          console.log('❌ Freighter não está conectado');
        }
      } else {
        console.log('❌ Window não está disponível');
      }
    } catch (error) {
      console.error('🚨 Erro ao sincronizar saldo da carteira:', error);
    }
    return 0;
  };

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Definir usuário com saldo inicial
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            kycStatus: 'pending',
            balance: 0 // Saldo inicial, será sincronizado com a carteira
          };
          setUser(userData);
          setIsAuthenticated(true);
          
          // Sincronizar saldo da carteira em background
          setTimeout(async () => {
            const balance = await syncWalletBalance();
            if (balance > 0) {
              console.log('✅ Saldo sincronizado no login:', balance);
            }
          }, 1000); // Aguardar 1 segundo para garantir que a página carregou
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Definir usuário imediatamente
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
          kycStatus: 'pending',
          balance: 0 // Saldo inicial, será sincronizado com a carteira
        };
        setUser(userData);
        setIsAuthenticated(true);
        
        // Sincronizar saldo da carteira em background
        setTimeout(async () => {
          const balance = await syncWalletBalance();
          if (balance > 0) {
            console.log('✅ Saldo sincronizado na mudança de auth:', balance);
          }
        }, 1000);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const updateKycStatus = (status: 'pending' | 'verified' | 'rejected') => {
    if (user) {
      const updatedUser = { ...user, kycStatus: status };
      setUser(updatedUser);
    }
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
    }
  };

  const refreshBalance = async () => {
    if (user) {
      // Sincronizar com a carteira Freighter em vez do BalanceService
      const balance = await syncWalletBalance();
      console.log('🔄 Saldo atualizado manualmente:', balance);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      updateKycStatus,
      updateBalance,
      refreshBalance,
      syncWalletBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};