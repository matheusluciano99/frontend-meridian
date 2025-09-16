import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  CreditCard, 
  Smartphone, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  QrCode,
  Wallet,
  ArrowLeft,
  Zap,
  DollarSign,
  Calendar,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { PoliciesService } from '@/services/policiesService';

interface Policy {
  id: string;
  productName: string;
  coverage: string;
  duration: string;
  premium: number;
  startDate: Date;
  endDate: Date;
}

interface PaymentMethod {
  id: string;
  name: string;
  type: 'xlm' | 'pix' | 'anchor';
  icon: React.ReactNode;
  description: string;
  processingTime: string;
  fees: number;
}

interface PaymentStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'expired';
  message: string;
  transactionHash?: string;
  pixCode?: string;
  qrCode?: string;
  expiresAt?: Date;
}

const Checkout: React.FC = () => {
  const { policyId } = useParams<{ policyId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'xlm',
      name: 'Stellar (XLM)',
      type: 'xlm',
      icon: <Wallet className="w-6 h-6" />,
      description: 'Pagamento direto na blockchain Stellar',
      processingTime: 'Instantâneo',
      fees: 0
    },
    {
      id: 'pix',
      name: 'PIX',
      type: 'pix',
      icon: <Smartphone className="w-6 h-6" />,
      description: 'Transferência instantânea via PIX',
      processingTime: 'Até 2 minutos',
      fees: 0
    },
    {
      id: 'anchor',
      name: 'Anchor Deposit',
      type: 'anchor',
      icon: <CreditCard className="w-6 h-6" />,
      description: 'Depósito via Anchor (BRL → XLM)',
      processingTime: '5-10 minutos',
      fees: 0.5
    }
  ];

  useEffect(() => {
    fetchPolicy();
  }, [policyId]);


  useEffect(() => {
    if (paymentStatus?.expiresAt) {
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = paymentStatus.expiresAt!.getTime();
        const remaining = expires - now;

        if (remaining <= 0) {
          setTimeRemaining('Expirado');
          setPaymentStatus(prev => prev ? { ...prev, status: 'expired' } : null);
          clearInterval(interval);
          return;
        }

        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [paymentStatus?.expiresAt]);

  const fetchPolicy = async () => {
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockPolicy: Policy = {
        id: policyId || 'policy_123',
        productName: 'Acidentes 48h',
        coverage: 'R$ 50.000',
        duration: '48 horas',
        premium: 3.00,
        startDate: new Date(),
        endDate: new Date(Date.now() + 48 * 60 * 60 * 1000)
      };
      
      setPolicy(mockPolicy);
    } catch (error) {
      toast({
        title: "Erro ao carregar apólice",
        description: "Não foi possível carregar os dados da apólice.",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentMethodSelect = (methodId: string) => {
    setSelectedPaymentMethod(methodId);
    setPaymentStatus(null);
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod || !policy) return;

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate payment processing steps
      const steps = [
        { progress: 20, message: 'Iniciando pagamento...' },
        { progress: 40, message: 'Conectando com a rede...' },
        { progress: 60, message: 'Processando transação...' },
        { progress: 80, message: 'Confirmando pagamento...' },
        { progress: 100, message: 'Pagamento concluído!' }
      ];

      for (const step of steps) {
        setProgress(step.progress);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Mock payment result based on method
      const mockPaymentStatus: PaymentStatus = {
        status: 'completed',
        message: 'Pagamento realizado com sucesso!',
        transactionHash: `stellar_tx_${Math.random().toString(36).substr(2, 15)}`,
        ...(selectedPaymentMethod === 'pix' && {
          pixCode: '00020126580014br.gov.bcb.pix0136a1b2c3d4e5f6-1234-5678-9abc-def012345678',
          qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        }),
        ...(selectedPaymentMethod === 'anchor' && {
          pixCode: 'anchor_deposit_url_12345'
        })
      };

      setPaymentStatus(mockPaymentStatus);

      toast({
        title: "Pagamento realizado!",
        description: "Sua apólice foi ativada com sucesso.",
      });

    } catch (error) {
      setPaymentStatus({
        status: 'failed',
        message: 'Erro ao processar pagamento. Tente novamente.'
      });
      
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Código copiado para a área de transferência.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-6 h-6 text-success" />;
      case 'failed':
        return <AlertCircle className="w-6 h-6 text-destructive" />;
      case 'expired':
        return <Clock className="w-6 h-6 text-muted-foreground" />;
      default:
        return <Loader2 className="w-6 h-6 animate-spin text-primary" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 border-success/20 text-success';
      case 'failed':
        return 'bg-destructive/10 border-destructive/20 text-destructive';
      case 'expired':
        return 'bg-muted/10 border-muted/20 text-muted-foreground';
      default:
        return 'bg-primary/10 border-primary/20 text-primary';
    }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!policy) return null;

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Finalizar Pagamento</h1>
          <p className="text-muted-foreground">
            Complete o pagamento para ativar sua apólice
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="space-y-6">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Método de Pagamento
                </CardTitle>
                <CardDescription>
                  Escolha como deseja pagar sua apólice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => handlePaymentMethodSelect(method.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedPaymentMethod === method.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {method.icon}
                        </div>
                        <div>
                          <h3 className="font-medium">{method.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {method.processingTime}
                        </p>
                        {method.fees > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Taxa: R$ {method.fees.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Payment Button */}
            {selectedPaymentMethod && (
              <Button
                onClick={handlePayment}
                disabled={processing}
                className="w-full gradient-primary text-white font-medium py-3 h-auto"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processando Pagamento...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Pagar R$ {policy.premium.toFixed(2)}
                  </>
                )}
              </Button>
            )}

            {/* Processing Progress */}
            {processing && (
              <Card className="glass-card border-border/50">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-primary" />
                      <span className="font-medium">Processando pagamento...</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      {progress}% concluído
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Status */}
            {paymentStatus && (
              <Card className={`glass-card border ${getStatusColor(paymentStatus.status)}`}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(paymentStatus.status)}
                      <div>
                        <h3 className="font-medium">{paymentStatus.message}</h3>
                        {paymentStatus.expiresAt && (
                          <p className="text-sm text-muted-foreground">
                            Expira em: {timeRemaining}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* PIX Code */}
                    {paymentStatus.pixCode && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Código PIX:</Label>
                        <div className="flex gap-2">
                          <Input
                            value={paymentStatus.pixCode}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(paymentStatus.pixCode!)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* QR Code */}
                    {paymentStatus.qrCode && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">QR Code PIX:</Label>
                        <div className="flex justify-center p-4 bg-white rounded-lg">
                          <img
                            src={paymentStatus.qrCode}
                            alt="QR Code PIX"
                            className="w-48 h-48"
                          />
                        </div>
                      </div>
                    )}

                    {/* Transaction Hash */}
                    {paymentStatus.transactionHash && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Hash da Transação:</Label>
                        <div className="flex gap-2">
                          <Input
                            value={paymentStatus.transactionHash}
                            readOnly
                            className="font-mono text-xs"
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(paymentStatus.transactionHash!)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <a
                              href={`https://stellar.expert/explorer/testnet/tx/${paymentStatus.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Anchor URL */}
                    {paymentStatus.pixCode?.includes('anchor') && (
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">Link do Anchor:</Label>
                        <Button
                          variant="outline"
                          className="w-full"
                          asChild
                        >
                          <a
                            href={paymentStatus.pixCode}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Abrir Anchor
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* Success Actions */}
                    {paymentStatus.status === 'completed' && (
                      <div className="space-y-3 pt-4 border-t border-border/50">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground mb-4">
                            Pagamento realizado com sucesso! Sua apólice está ativa.
                          </p>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => navigate('/')}
                              variant="outline"
                              className="flex-1"
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Dashboard
                            </Button>
                            <Button
                              onClick={() => navigate('/coverage')}
                              className="flex-1"
                            >
                              <Shield className="w-4 h-4 mr-2" />
                              Ver Cobertura
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Policy Summary */}
          <div className="space-y-6">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Resumo da Apólice
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Produto</span>
                    <span className="font-medium">{policy.productName}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cobertura</span>
                    <span className="font-medium text-success">{policy.coverage}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duração</span>
                    <span className="font-medium">{policy.duration}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Início</span>
                    <span className="font-medium">
                      {policy.startDate.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Término</span>
                    <span className="font-medium">
                      {policy.endDate.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>

                <div className="border-t border-border/50 pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total a Pagar</span>
                    <span className="text-primary">R$ {policy.premium.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Pagamento Seguro</p>
                    <p className="text-xs text-muted-foreground">
                      Todas as transações são criptografadas e seguras
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Blockchain Stellar</p>
                    <p className="text-xs text-muted-foreground">
                      Transações verificáveis na blockchain
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Ativação Instantânea</p>
                    <p className="text-xs text-muted-foreground">
                      Sua apólice é ativada imediatamente após o pagamento
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

export default Checkout;
