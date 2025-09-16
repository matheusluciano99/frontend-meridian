import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  ArrowLeft,
  Calculator,
  Zap,
  CreditCard,
  Star,
  Home,
  ChevronRight,
  Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProductsService } from '@/services/productsService';
import { PoliciesService } from '@/services/policiesService';
import { Policy } from '@/types';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [duration, setDuration] = useState([24]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [funding, setFunding] = useState(false);
  const [activating, setActivating] = useState(false);
  const [createdPolicy, setCreatedPolicy] = useState<Policy | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [charges, setCharges] = useState<any[] | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        if (!id) {
          toast({
            title: "ID do produto não fornecido",
            description: "Não foi possível identificar o produto.",
            variant: "destructive"
          });
          navigate('/products');
          return;
        }

        const productData = await ProductsService.getProductById(id);
        if (productData) {
          setProduct(productData);
          setDuration([productData.minDuration]);
        } else {
          toast({
            title: "Produto não encontrado",
            description: "O produto solicitado não existe ou foi removido.",
            variant: "destructive"
          });
          navigate('/products');
        }
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível carregar os detalhes do produto.",
          variant: "destructive"
        });
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const calculatePrice = () => {
    if (!product) return 0;
    // Para produtos reais, usar o preço base diretamente
    // Se houver lógica de preço por hora, implementar aqui
    return product.basePrice;
  };

  const handleCreate = async () => {
    if (!product || !user?.id) {
      toast({ title: 'Erro', description: 'Usuário não autenticado ou produto não encontrado.', variant: 'destructive' });
      return;
    }
    setCreating(true);
    try {
      const policy = await PoliciesService.create({ userId: user.id, productId: product.id });
      setCreatedPolicy(policy);
      toast({ title: 'Apólice criada', description: 'Agora adicione funding para ativar.' });
    } catch (e:any) {
      toast({ title: 'Erro ao criar', description: e.message, variant: 'destructive' });
    } finally { setCreating(false); }
  };

  const handleFund = async () => {
    if (!createdPolicy) { toast({ title: 'Crie a apólice primeiro', variant: 'destructive' }); return; }
    const value = parseFloat(fundAmount);
    if (isNaN(value) || value <= 0) { toast({ title: 'Valor inválido', variant: 'destructive' }); return; }
    setFunding(true);
    try {
      const updated = await PoliciesService.fund(createdPolicy.id, value);
      setCreatedPolicy(updated);
      toast({ title: 'Funding adicionado', description: `Balance: ${(updated.funding_balance_xlm || 0).toFixed?.(2)}` });
    } catch (e:any) {
      toast({ title: 'Erro funding', description: e.message, variant: 'destructive' });
    } finally { setFunding(false); }
  };

  const handleActivate = async () => {
    if (!createdPolicy) { toast({ title: 'Crie e funde antes', variant: 'destructive' }); return; }
    setActivating(true);
    try {
      const activated = await PoliciesService.activate(createdPolicy.id);
      setCreatedPolicy(activated);
      toast({ title: 'Seguro ativado', description: `Status: ${activated.status}` });
      navigate('/coverage');
    } catch (e:any) {
      toast({ title: 'Erro ativar', description: e.message, variant: 'destructive' });
    } finally { setActivating(false); }
  };

  const loadCharges = async () => {
    if (!createdPolicy) return;
    try {
      const data = await PoliciesService.getCharges(createdPolicy.id);
      setCharges(data.charges);
    } catch {}
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          {/* Loading Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/')}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4 mr-1" />
              Dashboard
            </Button>
            <ChevronRight className="w-4 h-4" />
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/products')}
              className="h-auto p-1 text-muted-foreground hover:text-foreground"
            >
              Produtos
            </Button>
            <ChevronRight className="w-4 h-4" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </nav>

          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-40 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            <Home className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <ChevronRight className="w-4 h-4" />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/products')}
            className="h-auto p-1 text-muted-foreground hover:text-foreground"
          >
            Produtos
          </Button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">
            {product?.name || 'Carregando...'}
          </span>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/products')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar aos Produtos
          </Button>
          
          <div className="flex gap-3 items-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: product.name,
                    text: product.description,
                    url: window.location.href
                  });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copiado!",
                    description: "O link do produto foi copiado para a área de transferência.",
                  });
                }
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
          {!createdPolicy && (
            <Button onClick={handleCreate} disabled={creating} className="gradient-primary">
              {creating ? 'Criando...' : 'Criar Apólice'}
            </Button>
          )}
          {createdPolicy && createdPolicy.status !== 'ACTIVE' && (
            <div className="flex gap-3">
              <div className="flex items-end gap-2">
                <Input placeholder="Funding (XLM)" value={fundAmount} onChange={e=>setFundAmount(e.target.value)} className="w-32" />
                <Button variant="outline" onClick={handleFund} disabled={funding}>{funding ? 'Enviando...' : 'Fund'}</Button>
              </div>
              <Button onClick={handleActivate} disabled={activating || (createdPolicy.funding_balance_xlm || 0) < (createdPolicy.hourly_rate_xlm || 0)} className="gradient-primary">
                {activating ? 'Ativando...' : 'Ativar'}
              </Button>
            </div>
          )}
          {createdPolicy && createdPolicy.status === 'ACTIVE' && (
            <Button variant="secondary" onClick={loadCharges}>Recarregar Cobranças</Button>
          )}
          </div>
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1 pr-6">
                    <CardTitle className="text-2xl flex items-center gap-3">
                      {product.name}
                      {product.popular && (
                        <Badge variant="secondary" className="bg-warning text-warning-foreground">
                          Popular
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-muted-foreground mt-2 text-lg">
                      {product.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-primary">
                      {product.coverage}
                    </div>
                    <p className="text-muted-foreground">Cobertura máxima</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">
                  {product.description}
                </p>
              </CardContent>
            </Card>
            {createdPolicy && (
              <div className="mt-10 grid gap-6 md:grid-cols-2 w-full">
                <Card>
                  <CardHeader><CardTitle>Status da Apólice</CardTitle></CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div><strong>ID:</strong> {createdPolicy.id}</div>
                    <div><strong>Status:</strong> {createdPolicy.status}</div>
                    <div><strong>Funding:</strong> {(createdPolicy.funding_balance_xlm || 0).toFixed?.(2)} XLM</div>
                    <div><strong>Hourly Rate:</strong> {(createdPolicy.hourly_rate_xlm || 0).toFixed?.(4)} XLM</div>
                    <div><strong>Next Charge:</strong> {createdPolicy.next_charge_at || '-'}</div>
                    <div><strong>Total Pago:</strong> {(createdPolicy.total_premium_paid_xlm || 0).toFixed?.(4)} XLM</div>
                    <div><strong>Horas Restantes (aprox):</strong> {(() => {
                      const bal = createdPolicy.funding_balance_xlm || 0;
                      const rate = createdPolicy.hourly_rate_xlm || 0;
                      if (!rate || rate <= 0) return '-';
                      return (bal / rate).toFixed(2);
                    })()}</div>
                  </CardContent>
                </Card>
                {createdPolicy.status === 'ACTIVE' && (
                  <Card>
                    <CardHeader><CardTitle>Charges</CardTitle></CardHeader>
                    <CardContent>
                      {!charges && <p className="text-sm text-muted-foreground">Clique em "Recarregar Cobranças"</p>}
                      {charges && charges.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma cobrança ainda.</p>}
                      {charges && charges.length > 0 && (
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-left text-muted-foreground border-b"><th>Ref</th><th>Amount</th><th>When</th></tr>
                            </thead>
                            <tbody>
                              {charges.map(c => (
                                <tr key={c.ref || c.created_at} className="border-b border-border/20">
                                  <td className="pr-2 truncate max-w-[120px]" title={c.ref}>{c.ref || '-'}</td>
                                  <td className="pr-2">{Number(c.amount_xlm).toFixed(4)}</td>
                                  <td>{new Date(c.created_at).toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Benefits */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Benefícios Inclusos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {product.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Product Info */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Informações do Produto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Categoria</span>
                      <span className="text-sm font-medium capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Duração</span>
                      <span className="text-sm font-medium">{product.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Avaliação</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Cobertura</span>
                      <span className="text-sm font-medium text-success">{product.coverage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <div className="flex gap-2">
                        {product.popular && (
                          <Badge variant="secondary" className="bg-warning text-warning-foreground text-xs">
                            Popular
                          </Badge>
                        )}
                        {product.recommended && (
                          <Badge variant="secondary" className="bg-success text-success-foreground text-xs">
                            Recomendado
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Simulator (legacy purchase button removido para fluxo criar->fund->ativar) */}
          <div className="space-y-6">
            {/* Price Calculator */}
            <Card className="glass-card border-border/50 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Simulador de Preço
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Display */}
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      R$ {product.basePrice.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">Preço único</p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço do produto</span>
                    <span>R$ {product.basePrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxas incluídas</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                    <span>Total</span>
                    <span className="text-primary">R$ {product.basePrice.toFixed(2)}</span>
                  </div>
                </div>

                {/* Coverage Period */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Período de Cobertura</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {product.duration} após ativação
                  </p>
                </div>

                <p className="text-xs text-center text-muted-foreground">Crie a apólice, adicione funding e ative acima.</p>
              </CardContent>
            </Card>
          </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;