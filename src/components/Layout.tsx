import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5 pointer-events-none" />
        
        {/* Main content */}
        <div className="relative z-10">
          {isAuthenticated && <Header />}
          <main className={isAuthenticated ? "pt-20" : ""}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};