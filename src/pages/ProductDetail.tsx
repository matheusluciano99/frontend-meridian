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
import { Product } from '@/types';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [duration, setDuration] = useState([24]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

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

  const handleActivate = async () => {
    if (!product) return;
    
    setActivating(true);
    try {
      // Mock API calls
      // 1. Create policy
      const policyResponse = await fetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          duration: duration[0],
          price: calculatePrice()
        })
      });

      if (!policyResponse.ok) throw new Error('Failed to create policy');
      
      const policy = await policyResponse.json();
      
      // 2. Activate policy
      const activateResponse = await fetch(`/api/policies/${policy.id}/activate`, {
        method: 'POST'
      });

      if (!activateResponse.ok) throw new Error('Failed to activate policy');

      // 3. Redirect to checkout
      navigate(`/checkout/${policy.id}`);
      
    } catch (error) {
      // For demo, simulate success
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast({
        title: "Seguro ativado com sucesso!",
        description: "Redirecionando para o checkout...",
      });
      navigate('/coverage');
    } finally {
      setActivating(false);
    }
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
              variant="ghost" 
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
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

          {/* Simulator & Activation */}
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

                {/* Activate Button */}
                <Button 
                  onClick={handleActivate}
                  disabled={activating}
                  className="w-full gradient-primary text-white font-medium py-3 h-auto"
                >
                  {activating ? (
                    "Ativando..."
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Ativar Agora - R$ {product.basePrice.toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ativação instantânea via blockchain Stellar
                </p>

                {/* Other Payment Methods Button */}
                <Button 
                  variant="outline"
                  onClick={() => navigate(`/checkout/policy_${product.id}`)}
                  className="w-full mt-3"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Outros Pagamentos
                </Button>
                
                <p className="text-xs text-center text-muted-foreground mt-2">
                  PIX, Anchor e outras opções de pagamento
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;