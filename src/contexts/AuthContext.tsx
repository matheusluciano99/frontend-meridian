/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { BalanceService } from '../services/balanceService';

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

  useEffect(() => {
    // Verificar sessão atual do Supabase
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Definir usuário imediatamente com saldo 0 para evitar delay
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
            kycStatus: 'pending',
            balance: 0 // Saldo inicial, será atualizado em background
          };
          setUser(userData);
          setIsAuthenticated(true);
          
          // Buscar saldo em background sem bloquear a UI
          BalanceService.getUserBalance(session.user.id)
            .then(balance => {
              setUser(prev => prev ? { ...prev, balance } : null);
            })
            .catch(error => {
              console.error('Erro ao buscar saldo do usuário:', error);
            });
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
          balance: 0 // Saldo inicial, será atualizado em background
        };
        setUser(userData);
        setIsAuthenticated(true);
        
        // Buscar saldo em background
        BalanceService.getUserBalance(session.user.id)
          .then(balance => {
            setUser(prev => prev ? { ...prev, balance } : null);
          })
          .catch(error => {
            console.error('Erro ao buscar saldo do usuário:', error);
          });
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
      const newBalance = await BalanceService.getUserBalance(user.id);
      updateBalance(newBalance);
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
      refreshBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};