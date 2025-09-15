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
  Zap
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProductDetails {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  basePrice: number;
  pricePerHour: number;
  minDuration: number;
  maxDuration: number;
  coverage: string;
  benefits: string[];
  exclusions: string[];
  rating: number;
  popular?: boolean;
}

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [duration, setDuration] = useState([24]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Mock API call - replace with actual endpoint
        const mockProducts: { [key: string]: ProductDetails } = {
          '1': {
            id: '1',
            name: 'Acidentes 48h',
            description: 'Cobertura completa para acidentes pessoais nas próximas 48 horas',
            longDescription: 'Este produto oferece proteção abrangente contra acidentes pessoais que possam ocorrer nas próximas 48 horas. Ideal para quem busca segurança em atividades do dia a dia, trabalho ou lazer.',
            basePrice: 3.00,
            pricePerHour: 0.0625,
            minDuration: 12,
            maxDuration: 48,
            coverage: 'R$ 50.000',
            benefits: [
              'Cobertura para acidentes pessoais',
              'Indenização por morte acidental',
              'Invalidez permanente total ou parcial',
              'Despesas médicas e hospitalares',
              'Atendimento 24h via telefone',
              'Ativação instantânea via blockchain'
            ],
            exclusions: [
              'Atos intencionais ou tentativa de suicídio',
              'Atividades esportivas profissionais',
              'Uso de substâncias ilícitas',
              'Guerra ou atos terroristas'
            ],
            rating: 4.8,
            popular: true
          }
          // Add other products as needed
        };

        await new Promise(resolve => setTimeout(resolve, 500));
        const productData = mockProducts[id || ''];
        if (productData) {
          setProduct(productData);
          setDuration([productData.minDuration]);
        } else {
          toast({
            title: "Produto não encontrado",
            description: "O produto solicitado não existe ou foi removido.",
            variant: "destructive"
          });
          navigate('/');
        }
      } catch (error) {
        toast({
          title: "Erro ao carregar produto",
          description: "Não foi possível carregar os detalhes do produto.",
          variant: "destructive"
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  const calculatePrice = () => {
    if (!product) return 0;
    return product.basePrice + (duration[0] - product.minDuration) * product.pricePerHour;
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
      window.location.href = `/api/checkout?policyId=${policy.id}`;
      
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
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
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

  if (!product) return null;

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Dashboard
        </Button>

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
                  {product.longDescription}
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
                  {product.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Exclusions */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Exclusões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {product.exclusions.map((exclusion, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-sm text-muted-foreground">{exclusion}</span>
                    </div>
                  ))}
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
                {/* Duration Slider */}
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duração</span>
                    <span className="font-medium">{duration[0]} horas</span>
                  </div>
                  
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={product.maxDuration}
                    min={product.minDuration}
                    step={1}
                    className="w-full"
                  />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{product.minDuration}h</span>
                    <span>{product.maxDuration}h</span>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Preço base</span>
                    <span>R$ {product.basePrice.toFixed(2)}</span>
                  </div>
                  {duration[0] > product.minDuration && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        +{duration[0] - product.minDuration}h adicionais
                      </span>
                      <span>
                        R$ {((duration[0] - product.minDuration) * product.pricePerHour).toFixed(2)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                    <span>Total</span>
                    <span className="text-primary">R$ {calculatePrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Coverage Period */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Período de Cobertura</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Ativo por {duration[0]} horas após ativação
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
                      Ativar Agora - R$ {calculatePrice().toFixed(2)}
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ativação instantânea via blockchain Stellar
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