import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  ExternalLink,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sorobanService, PoolMetrics } from '@/services/sorobanService';

const PoolAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<PoolMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadMetrics = async () => {
    try {
      setLoading(true);
      const data = await sorobanService.getPoolMetrics();
      setMetrics(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar métricas",
        description: "Não foi possível carregar as métricas do pool. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'policy_hourly_charge':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'policy_activated':
        return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'pool_payout':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionBadge = (type: string) => {
    switch (type) {
      case 'policy_hourly_charge':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Cobrança</Badge>;
      case 'policy_activated':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Ativação</Badge>;
      case 'pool_payout':
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Payout</Badge>;
      default:
        return <Badge variant="secondary">Outro</Badge>;
    }
  };

  if (loading && !metrics) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-8">Pool Analytics</h1>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando métricas do pool...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Pool Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Métricas em tempo real do Risk Pool na blockchain Stellar
            </p>
          </div>
          <Button onClick={loadMetrics} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* Cards de métricas principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Saldo Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics?.current_balance.xlm || '0.0000000'}</p>
              <p className="text-xs text-muted-foreground">XLM no contrato</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-500" />
                Total Coletado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                {metrics?.statistics.total_collected_xlm.toFixed(6) || '0.000000'}
              </p>
              <p className="text-xs text-muted-foreground">XLM arrecadados</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-500" />
                Total Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">
                {metrics?.statistics.total_paid_out_xlm.toFixed(6) || '0.000000'}
              </p>
              <p className="text-xs text-muted-foreground">XLM em payouts</p>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Transações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{metrics?.statistics.transaction_count || 0}</p>
              <p className="text-xs text-muted-foreground">
                {metrics?.statistics.collection_count || 0} cobranças, {metrics?.statistics.payout_count || 0} payouts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Transações recentes */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>
              Últimas operações no Risk Pool
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics?.recent_transactions.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhuma transação recente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics?.recent_transactions.map((tx, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getTransactionBadge(tx.type)}
                          <span className="font-medium">
                            {tx.amount_xlm.toFixed(6)} XLM
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {tx.policy_id && `Policy: ${tx.policy_id} • `}
                          {new Date(tx.created_at).toLocaleString('pt-BR')}
                        </div>
                      </div>
                    </div>

                    {tx.tx_hash && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${tx.tx_hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações técnicas */}
        <Card className="glass-card border-border/50 mt-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-medium mb-2">Sobre o Risk Pool</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  O Risk Pool é um smart contract na blockchain Stellar que gerencia os fundos
                  de seguro. Todas as operações são transparentes e auditáveis na rede.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Saldo em Stroops:</strong> {metrics?.current_balance.stroops || '0'}
                  </div>
                  <div>
                    <strong>Saldo Líquido:</strong> {metrics?.statistics.net_balance_xlm.toFixed(6) || '0.000000'} XLM
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PoolAnalytics;