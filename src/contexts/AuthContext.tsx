import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateKycStatus: (status: 'pending' | 'verified' | 'rejected') => void;
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

  useEffect(() => {
    // Mock authentication check - replace with Supabase integration
    const savedUser = localStorage.getItem('stellar_insurance_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - replace with Supabase Auth
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      kycStatus: 'pending'
    };
    
    localStorage.setItem('stellar_insurance_user', JSON.stringify(mockUser));
    setUser(mockUser);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('stellar_insurance_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateKycStatus = (status: 'pending' | 'verified' | 'rejected') => {
    if (user) {
      const updatedUser = { ...user, kycStatus: status };
      setUser(updatedUser);
      localStorage.setItem('stellar_insurance_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      logout,
      updateKycStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};