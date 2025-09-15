import React from 'react';
import { Shield } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Carregando...", 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        {/* Logo animado */}
        <div className="relative mb-6">
          <div className={`${sizeClasses[size]} gradient-primary rounded-2xl flex items-center justify-center mx-auto animate-pulse`}>
            <Shield className={`${iconSizes[size]} text-white`} />
          </div>
          {/* Spinner ao redor do logo */}
          <div className={`absolute inset-0 ${sizeClasses[size]} border-4 border-primary/20 border-t-primary rounded-2xl animate-spin mx-auto`}></div>
        </div>
        
        {/* Mensagem */}
        <p className="text-muted-foreground text-lg font-medium">{message}</p>
        <p className="text-muted-foreground text-sm mt-2">
          Verificando autenticação...
        </p>
      </div>
    </div>
  );
};
