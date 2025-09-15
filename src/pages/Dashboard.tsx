import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Clock, DollarSign, ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-insurance.jpg';
import { ProductsService } from '@/services/productsService';
import { Product } from '@/types';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await ProductsService.getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: error instanceof Error ? error.message : "Não foi possível carregar os produtos disponíveis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="relative mb-16 overflow-hidden rounded-3xl">
          <div className="absolute inset-0">
            <img 
              src={heroImage} 
              alt="Stellar Insurance - Blockchain Security"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-transparent" />
          </div>
          
          <div className="relative z-10 px-8 py-16 md:py-24">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                <span className="text-gradient-primary">Micro Seguros</span>
                <br />
                <span className="text-foreground">na Blockchain Stellar</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Proteção instantânea e acessível, quando você mais precisa. 
                Ativação imediata com tecnologia blockchain.
              </p>
              <Button asChild size="lg" className="gradient-primary">
                <Link to="/product/1">
                  Explorar Produtos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <Shield className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gradient-primary">24/7</div>
              <p className="text-muted-foreground">Proteção Ativa</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gradient-primary">Instantâneo</div>
              <p className="text-muted-foreground">Ativação Imediata</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-gradient-primary">R$ 2,50+</div>
              <p className="text-muted-foreground">A partir de</p>
            </CardContent>
          </Card>
        </div>

        {/* Products Grid */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-6">Produtos Disponíveis</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="glass-card border-border/50">
                  <CardHeader className="animate-pulse">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted/50 rounded w-full"></div>
                  </CardHeader>
                  <CardContent className="animate-pulse">
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                      <div className="h-4 bg-muted/50 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {products.map((product) => (
                <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {product.name}
                          {product.popular && (
                            <Badge variant="secondary" className="bg-warning text-warning-foreground">
                              <Star className="w-3 h-3 mr-1" />
                              Popular
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {product.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Duração</p>
                          <p className="font-medium">{product.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Cobertura</p>
                          <p className="font-medium text-success">{product.coverage}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border/50">
                        <div>
                          <p className="text-2xl font-bold text-primary">
                            R$ {product.basePrice.toFixed(2)}
                          </p>
                          <p className="text-sm text-muted-foreground">a partir de</p>
                        </div>
                        
                        <Button 
                          asChild 
                          variant="outline"
                          className="group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
                        >
                          <Link to={`/product/${product.id}`}>
                            Ver detalhes
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;