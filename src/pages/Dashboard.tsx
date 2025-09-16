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
import { ProductsService } from '@/services/productsService';
import { AnchorsService } from '@/services/anchorsService';
import { useAuth } from '@/contexts/AuthContext';
import { AnchorTransaction } from '@/types';
import { Product } from '@/types';

const Dashboard: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, refreshBalance } = useAuth();
  const [anchorTxs, setAnchorTxs] = useState<AnchorTransaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [walletLoading, setWalletLoading] = useState(false);
  const [anchorBalance, setAnchorBalance] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const { toast } = useToast();
  const productsSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await ProductsService.getAllProducts();
        setProducts(fetchedProducts);
      } catch (error) {
        toast({
          title: "Error loading products",
          description: error instanceof Error ? error.message : "Could not load available products.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [toast]);

  useEffect(() => {
    const loadAnchorData = async () => {
      if (!user) return;
      try {
        const txs = await AnchorsService.list(user.id);
        setAnchorTxs(txs);
        const bal = await AnchorsService.derivedBalance(user.id);
        setAnchorBalance(bal);
      } catch (e) {
        // silencioso
      }
    };
    loadAnchorData();
  }, [user]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const value = parseFloat(depositAmount);
    if (isNaN(value) || value <= 0) {
      toast({ title: 'Valor inválido', variant: 'destructive' });
      return;
    }
    setWalletLoading(true);
    try {
      const result = await AnchorsService.deposit(user.id, value);
      if (result.interactiveUrl) {
        // Redirecionar para a URL da âncora para completar o pagamento
        window.location.href = result.interactiveUrl;
      } else {
        toast({ title: 'Erro', description: 'URL de depósito não recebida', variant: 'destructive' });
      }
    } catch (err:any) {
      toast({ title: 'Erro no depósito', description: err.message, variant: 'destructive' });
    } finally {
      setWalletLoading(false);
      setDepositAmount('');
    }
  };

  const refreshAnchor = async () => {
    if (!user) return;
    const txs = await AnchorsService.list(user.id);
    setAnchorTxs(txs);
    const bal = await AnchorsService.derivedBalance(user.id);
    setAnchorBalance(bal);
    refreshBalance();
  };

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
                <span className="text-gradient-primary">Micro Insurance</span>
                <br />
                <span className="text-foreground">on Stellar Blockchain</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Instant and affordable protection when you need it most. 
                Immediate activation with blockchain technology.
              </p>
              <Button onClick={scrollToProducts} size="lg" className="gradient-primary">
                Explore Products
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
              <p className="text-muted-foreground">Active Protection</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-secondary mx-auto mb-2" />
              <div className="text-2xl font-bold text-gradient-primary">Instant</div>
              <p className="text-muted-foreground">Immediate Activation</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
              <div className="text-2xl font-bold text-gradient-primary">R$ 2,50+</div>
              <p className="text-muted-foreground">Starting from</p>
            </CardContent>
          </Card>
        </div>

        {/* Wallet / Anchor Section */}
        {user && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold mb-4">Minha Carteira</h2>
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <Card className="glass-card border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle>Saldo (derivado)</CardTitle>
                  <CardDescription>Soma de depósitos concluídos</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">R$ {anchorBalance.toFixed(2)}</p>
                  <Button size="sm" variant="outline" className="mt-4" onClick={refreshAnchor}>Atualizar</Button>
                </CardContent>
              </Card>

              <Card className="glass-card border-border/50 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle>Novo Depósito</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeposit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    <div className="flex-1">
                      <label className="text-sm mb-1 block">Valor (R$)</label>
                      <Input value={depositAmount} onChange={e => setDepositAmount(e.target.value)} placeholder="100.00" />
                    </div>
                    <Button type="submit" disabled={walletLoading}>{walletLoading ? 'Enviando...' : 'Depositar'}</Button>
                    <Button type="button" variant="outline" onClick={async ()=>{ await AnchorsService.reconcile(); refreshAnchor(); }}>Reconciliar</Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle>Transações</CardTitle>
                <CardDescription>Histórico Anchor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-2 md:mx-0">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-muted-foreground border-b border-border/40">
                        <th className="py-2 pr-4">ID</th>
                        <th className="py-2 pr-4">Tipo</th>
                        <th className="py-2 pr-4">Valor</th>
                        <th className="py-2 pr-4">Status</th>
                        <th className="py-2 pr-4">Criado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {anchorTxs.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-center text-muted-foreground">Nenhuma transação</td></tr>
                      )}
                      {anchorTxs.map(tx => (
                        <tr key={tx.id} className="border-b border-border/20 hover:bg-muted/20 transition-colors">
                          <td className="py-2 pr-4 max-w-[140px] truncate" title={tx.id}>{tx.id}</td>
                          <td className="py-2 pr-4 capitalize">{tx.type}</td>
                          <td className="py-2 pr-4">R$ {parseFloat(String(tx.amount)).toFixed(2)}</td>
                          <td className="py-2 pr-4">
                            <Badge variant={tx.status === 'COMPLETED' ? 'default' : tx.status === 'PENDING' ? 'outline' : 'secondary'}>{tx.status}</Badge>
                          </td>
                          <td className="py-2 pr-4">{new Date(tx.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Products Section */}
        <div ref={productsSectionRef} className="mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Available Products</h2>
            <p className="text-muted-foreground text-lg">
              Choose the ideal protection for your needs
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
                    placeholder="Search products..."
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
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="acidentes">Accidents</SelectItem>
                  <SelectItem value="trabalho">Work</SelectItem>
                  <SelectItem value="viagem">Travel</SelectItem>
                  <SelectItem value="esporte">Sports</SelectItem>
                  <SelectItem value="saude">Health</SelectItem>
                  <SelectItem value="residencial">Residential</SelectItem>
                  <SelectItem value="transporte">Transport</SelectItem>
                  <SelectItem value="corporativo">Corporate</SelectItem>
                </SelectContent>
              </Select>

              {/* Price Filter */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <DollarSign className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All prices</SelectItem>
                  <SelectItem value="low">Up to R$ 3.00</SelectItem>
                  <SelectItem value="medium">R$ 3.00 - R$ 7.00</SelectItem>
                  <SelectItem value="high">Above R$ 7.00</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
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
                  Clear filters
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
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{product.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Coverage</span>
                        <span className="font-medium text-success">{product.coverage}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Rating</span>
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
                          <p className="text-xs text-muted-foreground">starting from</p>
                        </div>
                      </div>
                      
                      <Button 
                        asChild 
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth"
                        variant="outline"
                      >
                        <Link to={`/product/${product.id}`}>
                          View details
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
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting the filters or search term to find what you're looking for.
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