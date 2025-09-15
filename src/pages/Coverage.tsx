import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  Pause,
  Play,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ActiveCoverage {
  id: string;
  productName: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  startTime: Date;
  endTime: Date;
  totalCost: number;
  accumulatedCost: number;
  coverage: string;
  stellarTxHash: string;
}

const Coverage: React.FC = () => {
  const [activeCoverage, setActiveCoverage] = useState<ActiveCoverage | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [pauseLoading, setPauseLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Mock fetch active coverage
    const fetchActiveCoverage = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock active coverage data
        const mockCoverage: ActiveCoverage = {
          id: 'policy_123',
          productName: 'Acidentes 48h',
          status: 'ACTIVE',
          startTime: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
          endTime: new Date(Date.now() + 42 * 60 * 60 * 1000), // 42 hours from now
          totalCost: 4.50,
          accumulatedCost: 0.56,
          coverage: 'R$ 50.000',
          stellarTxHash: 'abc123def456789stellartxhash'
        };
        
        setActiveCoverage(mockCoverage);
      } catch (error) {
        toast({
          title: "Erro ao carregar cobertura",
          description: "Não foi possível carregar informações da cobertura ativa.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActiveCoverage();
  }, [toast]);

  useEffect(() => {
    if (!activeCoverage || activeCoverage.status !== 'ACTIVE') return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = activeCoverage.endTime.getTime();
      const start = activeCoverage.startTime.getTime();
      const total = end - start;
      const remaining = end - now;

      if (remaining <= 0) {
        setTimeRemaining('Expirado');
        setProgressPercentage(100);
        setActiveCoverage(prev => prev ? { ...prev, status: 'EXPIRED' } : null);
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      setProgressPercentage(((total - remaining) / total) * 100);

      // Update accumulated cost (mock calculation)
      const elapsedHours = (now - start) / (1000 * 60 * 60);
      const newAccumulatedCost = (activeCoverage.totalCost / 48) * elapsedHours;
      setActiveCoverage(prev => prev ? { ...prev, accumulatedCost: newAccumulatedCost } : null);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeCoverage]);

  const handlePauseCoverage = async () => {
    if (!activeCoverage) return;
    
    setPauseLoading(true);
    try {
      // Mock API call to pause coverage
      const response = await fetch(`/api/policies/${activeCoverage.id}/pause`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to pause coverage');

      setActiveCoverage(prev => prev ? { ...prev, status: 'PAUSED' } : null);
      toast({
        title: "Cobertura pausada",
        description: "Sua cobertura foi pausada com sucesso.",
      });
    } catch (error) {
      // Mock success for demo
      await new Promise(resolve => setTimeout(resolve, 1500));
      setActiveCoverage(prev => prev ? { ...prev, status: 'PAUSED' } : null);
      toast({
        title: "Cobertura pausada",
        description: "Sua cobertura foi pausada com sucesso.",
      });
    } finally {
      setPauseLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Pause className="w-3 h-3 mr-1" />
            Pausado
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-64 bg-muted rounded"></div>
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!activeCoverage) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhuma Cobertura Ativa</h2>
            <p className="text-muted-foreground mb-6">
              Você não possui nenhuma cobertura ativa no momento.
            </p>
            <Button asChild>
              <a href="/">Ver Produtos Disponíveis</a>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Cobertura Ativa</h1>
          <p className="text-muted-foreground">
            Monitore sua proteção em tempo real
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Card */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {activeCoverage.productName}
                </CardTitle>
                {getStatusBadge(activeCoverage.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Timer */}
              {activeCoverage.status === 'ACTIVE' && (
                <div className="text-center">
                  <div className="text-3xl font-mono font-bold text-gradient-primary mb-2">
                    {timeRemaining}
                  </div>
                  <p className="text-muted-foreground">Tempo restante</p>
                  <Progress value={progressPercentage} className="mt-4" />
                </div>
              )}

              {/* Coverage Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <DollarSign className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="font-bold">{activeCoverage.coverage}</div>
                  <div className="text-sm text-muted-foreground">Cobertura</div>
                </div>
                <div className="text-center p-4 bg-muted/30 rounded-lg">
                  <Clock className="w-6 h-6 text-secondary mx-auto mb-2" />
                  <div className="font-bold">
                    R$ {activeCoverage.accumulatedCost.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gasto Atual</div>
                </div>
              </div>

              {/* Action Button */}
              {activeCoverage.status === 'ACTIVE' && (
                <Button 
                  onClick={handlePauseCoverage}
                  disabled={pauseLoading}
                  variant="outline"
                  className="w-full"
                >
                  {pauseLoading ? (
                    "Pausando..."
                  ) : (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar Cobertura
                    </>
                  )}
                </Button>
              )}

              {activeCoverage.status === 'PAUSED' && (
                <Button 
                  variant="outline"
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Reativar Cobertura
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Transaction Details */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle>Detalhes da Transação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID da Apólice</span>
                  <span className="font-mono text-sm">{activeCoverage.id}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Início</span>
                  <span>{activeCoverage.startTime.toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Término</span>
                  <span>{activeCoverage.endTime.toLocaleString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Custo Total</span>
                  <span className="font-bold">R$ {activeCoverage.totalCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Stellar Transaction */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Hash Stellar</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${activeCoverage.stellarTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1"
                    >
                      Ver no Explorer
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
                
                <div className="bg-muted/30 rounded p-3">
                  <code className="text-xs font-mono break-all">
                    {activeCoverage.stellarTxHash}
                  </code>
                </div>
              </div>

              {/* Blockchain Info */}
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">Blockchain Stellar</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua apólice está registrada na blockchain Stellar, 
                  garantindo transparência e imutabilidade dos registros.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Coverage;