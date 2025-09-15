import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { LoadingSpinner } from './LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return <LoadingSpinner message="Inicializando aplicação..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="relative flex-1">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
        
        {/* Main content */}
        <div className="relative z-10 flex-1 flex flex-col">
          {isAuthenticated && <Header />}
          <main className={`flex-1 ${isAuthenticated ? "pt-20" : ""}`}>
            {children}
          </main>
        </div>
      </div>
      
      {/* Footer */}
      {isAuthenticated && <Footer />}
    </div>
  );
};