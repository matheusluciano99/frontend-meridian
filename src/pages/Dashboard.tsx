import React, { useState, useEffect, useRef } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, DollarSign, ArrowRight, Star, Search, Filter, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import heroImage from '@/assets/hero-insurance.jpg';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  duration: string;
  coverage: string;
  rating: number;
  popular?: boolean;
  category: string;
  coverageAmount: number;
  minDuration: number;
  maxDuration: number;
}

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const { toast } = useToast();
  const productsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mock API call - replace with actual endpoint
    const fetchProducts = async () => {
      try {
        // Simulated API response
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Acidentes 48h',
            description: 'Cobertura completa para acidentes pessoais nas próximas 48 horas',
            basePrice: 3.00,
            duration: '48 horas',
            coverage: 'R$ 50.000',
            rating: 4.8,
            popular: true,
            category: 'acidentes',
            coverageAmount: 50000,
            minDuration: 12,
            maxDuration: 48
          },
          {
            id: '2',
            name: 'Diária Autônomos',
            description: 'Proteção para profissionais autônomos durante atividades diárias',
            basePrice: 2.50,
            duration: '24 horas',
            coverage: 'R$ 30.000',
            rating: 4.6,
            category: 'trabalho',
            coverageAmount: 30000,
            minDuration: 8,
            maxDuration: 24
          },
          {
            id: '3',
            name: 'Viagem Express',
            description: 'Seguro para viagens curtas e deslocamentos urbanos',
            basePrice: 4.90,
            duration: '72 horas',
            coverage: 'R$ 75.000',
            rating: 4.9,
            category: 'viagem',
            coverageAmount: 75000,
            minDuration: 24,
            maxDuration: 72
          },
          {
            id: '4',
            name: 'Eventos Esportivos',
            description: 'Cobertura especializada para atividades esportivas e recreativas',
            basePrice: 5.50,
            duration: '12 horas',
            coverage: 'R$ 40.000',
            rating: 4.7,
            category: 'esporte',
            coverageAmount: 40000,
            minDuration: 2,
            maxDuration: 12
          },
          {
            id: '5',
            name: 'Saúde Emergencial',
            description: 'Cobertura para emergências médicas e hospitalares',
            basePrice: 8.90,
            duration: '24 horas',
            coverage: 'R$ 100.000',
            rating: 4.9,
            popular: true,
            category: 'saude',
            coverageAmount: 100000,
            minDuration: 12,
            maxDuration: 48
          },
          {
            id: '6',
            name: 'Proteção Residencial',
            description: 'Cobertura para danos em residência e bens pessoais',
            basePrice: 6.50,
            duration: '48 horas',
            coverage: 'R$ 80.000',
            rating: 4.5,
            category: 'residencial',
            coverageAmount: 80000,
            minDuration: 24,
            maxDuration: 72
          },
          {
            id: '7',
            name: 'Transporte Público',
            description: 'Proteção durante uso de transporte público urbano',
            basePrice: 1.90,
            duration: '8 horas',
            coverage: 'R$ 25.000',
            rating: 4.4,
            category: 'transporte',
            coverageAmount: 25000,
            minDuration: 4,
            maxDuration: 8
          },
          {
            id: '8',
            name: 'Eventos Corporativos',
            description: 'Cobertura para eventos empresariais e corporativos',
            basePrice: 12.00,
            duration: '24 horas',
            coverage: 'R$ 150.000',
            rating: 4.8,
            category: 'corporativo',
            coverageAmount: 150000,
            minDuration: 8,
            maxDuration: 48
          }
        ];

        await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        toast({
          title: "Erro ao carregar produtos",
          description: "Não foi possível carregar os produtos disponíveis.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  // Filter products based on search and filters
  useEffect(() => {
    let filtered = products;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(product => product.category === categoryFilter);
    }

    // Price filter
    if (priceFilter !== 'all') {
      switch (priceFilter) {
        case 'low':
          filtered = filtered.filter(product => product.basePrice <= 3.00);
          break;
        case 'medium':
          filtered = filtered.filter(product => product.basePrice > 3.00 && product.basePrice <= 7.00);
          break;
        case 'high':
          filtered = filtered.filter(product => product.basePrice > 7.00);
          break;
      }
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, priceFilter]);

  const scrollToProducts = () => {
    productsSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    });
  };

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
              <Button onClick={scrollToProducts} size="lg" className="gradient-primary">
                Explorar Produtos
                <ChevronDown className="w-5 h-5 ml-2" />
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

        {/* Products Section */}
        <div ref={productsSectionRef} className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Produtos Disponíveis</h2>
            <p className="text-muted-foreground text-lg">
              Escolha a proteção ideal para suas necessidades
            </p>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="acidentes">Acidentes</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="corporativo">Corporativo</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os preços</SelectItem>
                  <SelectItem value="low">Até R$ 3,00</SelectItem>
                  <SelectItem value="medium">R$ 3,00 - R$ 7,00</SelectItem>
                  <SelectItem value="high">Acima de R$ 7,00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
              </p>
              {(searchTerm || categoryFilter !== 'all' || priceFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setPriceFilter('all');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                      </Badge>
                      {product.popular && (
                        <Badge variant="secondary" className="bg-warning text-warning-foreground">
                          <Star className="w-3 h-3 mr-1" />
                          Popular
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg leading-tight">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="flex-1 flex flex-col">
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duração</span>
                        <span className="font-medium">{product.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Cobertura</span>
                        <span className="font-medium text-success">{product.coverage}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Avaliação</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{product.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-auto pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-xl font-bold text-primary">
                            R$ {product.basePrice.toFixed(2)}
                          </p>
                          <p className="text-xs text-muted-foreground">a partir de</p>
                        </div>
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
                        variant="outline"
                      >
                        <Link to={`/product/${product.id}`}>
                          Ver detalhes
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* No results message */}
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Tente ajustar os filtros ou termo de busca para encontrar o que procura.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setPriceFilter('all');
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;