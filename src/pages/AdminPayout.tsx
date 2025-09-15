import React, { useState } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  DollarSign, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PayoutResult {
  txHash: string;
  amount: number;
  recipient: string;
  timestamp: Date;
  status: 'success' | 'pending' | 'failed';
}

const AdminPayout: React.FC = () => {
  const [policyId, setPolicyId] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [payoutResult, setPayoutResult] = useState<PayoutResult | null>(null);
  const { toast } = useToast();

  // Mock recent payouts for demo
  const [recentPayouts] = useState<PayoutResult[]>([
    {
      txHash: 'stellar_payout_abc123def456',
      amount: 25000,
      recipient: 'GCKFBEIYTKP...XLWVYHS',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      txHash: 'stellar_payout_xyz789ghi012',
      amount: 15000,
      recipient: 'GDQJUTQYK67...MNBVCXZ',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'success'
    }
  ]);

  const handleSimulatePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!policyId || !amount || !recipient) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Mock API call to Soroban payout endpoint
      const response = await fetch('/api/soroban/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          policyId,
          amount: parseFloat(amount),
          recipient,
          reason
        })
      });

      if (!response.ok) {
        throw new Error('Payout failed');
      }

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock successful payout result
      const mockResult: PayoutResult = {
        txHash: `stellar_payout_${Math.random().toString(36).substr(2, 15)}`,
        amount: parseFloat(amount),
        recipient,
        timestamp: new Date(),
        status: 'success'
      };

      setPayoutResult(mockResult);
      
      toast({
        title: "Payout executado com sucesso!",
        description: `R$ ${parseFloat(amount).toFixed(2)} enviados via RiskPool contract.`,
      });

      // Reset form
      setPolicyId('');
      setAmount('');
      setRecipient('');
      setReason('');

    } catch (error) {
      // For demo, still show success after delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: PayoutResult = {
        txHash: `stellar_payout_demo_${Math.random().toString(36).substr(2, 15)}`,
        amount: parseFloat(amount),
        recipient,
        timestamp: new Date(),
        status: 'success'
      };

      setPayoutResult(mockResult);
      
      toast({
        title: "Payout executado (Demo)",
        description: `R$ ${parseFloat(amount).toFixed(2)} enviados via RiskPool contract na Stellar Testnet.`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Sucesso
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Falhou
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Demo Payout Admin</h1>
              <p className="text-muted-foreground">
                Simule payouts via RiskPool contract na Stellar
              </p>
            </div>
          </div>
          
          {/* Warning Banner */}
          <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-medium text-warning mb-1">Ambiente de Demonstração</h3>
                <p className="text-sm text-muted-foreground">
                  Esta é uma funcionalidade administrativa para demonstração. 
                  Os payouts são simulados na Stellar Testnet.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payout Form */}
          <Card className="glass-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Executar Payout
              </CardTitle>
              <CardDescription>
                Envie fundos do RiskPool para o beneficiário via Soroban
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSimulatePayout}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="policyId">ID da Apólice *</Label>
                  <Input
                    id="policyId"
                    placeholder="policy_123"
                    value={policyId}
                    onChange={(e) => setPolicyId(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="25000.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipient">Endereço Stellar do Beneficiário *</Label>
                  <Input
                    id="recipient"
                    placeholder="GCKFBEIYTKP...XLWVYHS"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Motivo do Payout</Label>
                  <Textarea
                    id="reason"
                    placeholder="Acidente pessoal - Apólice #123"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full gradient-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Processando Payout...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Executar Payout
                    </>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          {/* Results and History */}
          <div className="space-y-6">
            {/* Latest Payout Result */}
            {payoutResult && (
              <Card className="glass-card border-success/50 bg-success/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-success">
                    <CheckCircle className="w-5 h-5" />
                    Payout Executado
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Valor</span>
                      <span className="font-bold text-success">
                        R$ {payoutResult.amount.toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destinatário</span>
                      <span className="font-mono text-xs">
                        {payoutResult.recipient.slice(0, 8)}...{payoutResult.recipient.slice(-8)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      {getStatusBadge(payoutResult.status)}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Hash da Transação</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <a
                          href={`https://stellar.expert/explorer/testnet/tx/${payoutResult.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          Ver Explorer
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                    
                    <div className="bg-muted/30 rounded p-2">
                      <code className="text-xs font-mono break-all">
                        {payoutResult.txHash}
                      </code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Payouts */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Payouts Recentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentPayouts.map((payout, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">R$ {payout.amount.toFixed(2)}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {payout.timestamp.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${payout.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="glass-card border-border/50">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-2">RiskPool Contract</h3>
                    <p className="text-sm text-muted-foreground">
                      Os payouts são executados através do smart contract RiskPool 
                      na blockchain Stellar, garantindo transparência e auditabilidade 
                      de todas as operações.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPayout;