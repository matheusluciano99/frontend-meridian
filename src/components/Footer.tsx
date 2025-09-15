import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Logo e marca */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gradient-primary">
              Stellar Insurance
            </span>
          </div>

          {/* Frase de destaque */}
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground italic">
              "O seguro morreu de velho"
            </p>
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
