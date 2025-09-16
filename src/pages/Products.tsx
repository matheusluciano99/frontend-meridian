import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Star, 
  Search, 
  Filter, 
  ArrowRight, 
  TrendingUp,
  Clock,
  DollarSign,
  Users,
  Award,
  Zap,
  Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { ProductsService } from '@/services/productsService';
import { Product } from '@/types';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await ProductsService.getAllProducts();
        setProducts(productsData);
        setFilteredProducts(productsData);
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

  // Filter and sort products
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

    // Sort products
    switch (sortBy) {
      case 'recommended':
        filtered = filtered.sort((a, b) => {
          if (a.recommended && !b.recommended) return -1;
          if (!a.recommended && b.recommended) return 1;
          return b.rating - a.rating;
        });
        break;
      case 'price-low':
        filtered = filtered.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        filtered = filtered.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'rating':
        filtered = filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'coverage':
        filtered = filtered.sort((a, b) => b.coverageAmount - a.coverageAmount);
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, categoryFilter, priceFilter, sortBy]);

  const getRecommendedProducts = () => {
    return products.filter(product => product.recommended);
  };

  const getTrendingProducts = () => {
    return products.filter(product => product.trending);
  };

  const getNewProducts = () => {
    return products.filter(product => product.new);
  };

  const getCategoryIcon = (category: string, code?: string) => {
    // Primeiro tenta mapear pela categoria/coverage_type
    switch (category?.toLowerCase()) {
      case 'fixed':
      case 'acidentes':
        return <Shield className="w-4 h-4" />;
      case 'daily':
      case 'saude':
        return <Heart className="w-4 h-4" />;
      case 'viagem':
        return <ArrowRight className="w-4 h-4" />;
      case 'trabalho':
        return <Users className="w-4 h-4" />;
      case 'esporte':
        return <Zap className="w-4 h-4" />;
      case 'residencial':
        return <Shield className="w-4 h-4" />;
      case 'transporte':
        return <ArrowRight className="w-4 h-4" />;
      case 'corporativo':
        return <Award className="w-4 h-4" />;
      case 'pet':
        return <Heart className="w-4 h-4" />;
      case 'digital':
        return <Shield className="w-4 h-4" />;
    }
    
    // Fallback baseado no código do produto
    if (code?.includes('ACCIDENT')) return <Shield className="w-4 h-4" />;
    if (code?.includes('TRAVEL')) return <ArrowRight className="w-4 h-4" />;
    if (code?.includes('HEALTH')) return <Heart className="w-4 h-4" />;
    if (code?.includes('INCOME')) return <Users className="w-4 h-4" />;
    if (code?.includes('PROPERTY')) return <Shield className="w-4 h-4" />;
    if (code?.includes('LIFE')) return <Heart className="w-4 h-4" />;
    if (code?.includes('DISABILITY')) return <Users className="w-4 h-4" />;
    
    return <Shield className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Nossos Produtos</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Proteção instantânea e acessível para todas as suas necessidades. 
            Escolha a cobertura ideal e ative em segundos.
          </p>
        </div>

        {/* Recommended Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Recomendados para Você</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getRecommendedProducts().map((product) => (
              <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group relative overflow-hidden">
                {product.popular && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {getCategoryIcon(product.category, product.code)}
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {product.name}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div className="space-y-2">
                    {product.features.slice(0, 2).map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{product.rating}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">{product.duration}</span>
                  </div>

                  {/* Price and Coverage */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div>
                      <p className="text-2xl font-bold text-primary">
                        R$ {product.basePrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">{product.coverage}</p>
                    </div>
                    
                    <Button asChild className="group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
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
        </div>

        {/* Trending Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <h2 className="text-2xl font-bold">Em Alta</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {getTrendingProducts().map((product) => (
              <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="text-xs">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                    <Badge className="bg-green-500 text-white text-xs">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Trending
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-tight">
                    {product.name}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Cobertura</span>
                    <span className="font-medium text-sm">{product.coverage}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Preço</span>
                    <span className="font-bold text-primary">R$ {product.basePrice.toFixed(2)}</span>
                  </div>

                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link to={`/product/${product.id}`}>
                      Ver detalhes
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* New Products Section */}
        {getNewProducts().length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Zap className="w-6 h-6 text-blue-500" />
              <h2 className="text-2xl font-bold">Novidades</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getNewProducts().map((product) => (
                <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group relative">
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-blue-500 text-white">
                      <Zap className="w-3 h-3 mr-1" />
                      Novo
                    </Badge>
                  </div>
                  
                  <CardHeader className="pb-3">
                    <Badge variant="outline" className="text-xs w-fit mb-2">
                      {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
                    </Badge>
                    <CardTitle className="text-lg leading-tight">
                      {product.name}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {product.description}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Cobertura</span>
                      <span className="font-medium">{product.coverage}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Preço</span>
                      <span className="font-bold text-primary text-lg">R$ {product.basePrice.toFixed(2)}</span>
                    </div>

                    <Button asChild className="w-full">
                      <Link to={`/product/${product.id}`}>
                        Conhecer produto
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Products Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Todos os Produtos</h2>
            <p className="text-sm text-muted-foreground">
              {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
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
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                  <SelectItem value="trabalho">Trabalho</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                  <SelectItem value="transporte">Transporte</SelectItem>
                  <SelectItem value="corporativo">Corporativo</SelectItem>
                  <SelectItem value="pet">Pet</SelectItem>
                  <SelectItem value="digital">Digital</SelectItem>
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

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <Clock className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended">Recomendados</SelectItem>
                  <SelectItem value="price-low">Menor preço</SelectItem>
                  <SelectItem value="price-high">Maior preço</SelectItem>
                  <SelectItem value="rating">Melhor avaliação</SelectItem>
                  <SelectItem value="coverage">Maior cobertura</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear filters */}
            {(searchTerm || categoryFilter !== 'all' || priceFilter !== 'all' || sortBy !== 'recommended') && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setCategoryFilter('all');
                    setPriceFilter('all');
                    setSortBy('recommended');
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth group h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline" className="text-xs flex items-center gap-1">
                      {getCategoryIcon(product.category, product.code)}
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

          {/* No results message */}
          {filteredProducts.length === 0 && (
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
                  setSortBy('recommended');
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

export default Products;
