import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e marca */}
          <div className="flex items-center space-x-2">
            <img 
              src="/insurance_logo.png" 
              alt="Insurance Logo" 
              className="w-6 h-6 object-contain"
            />
            <span className="text-lg font-semibold text-gradient-primary">
              Stellar Insurance
            </span>
          </div>

          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-xs text-muted-foreground">
              © 2025 Stellar Insurance. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
