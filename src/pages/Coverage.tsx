import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  Clock, 
  DollarSign, 
  Pause,
  Play,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';
import { CoveragesService } from '@/services/coveragesService';
import { useAuth } from '@/contexts/AuthContext';

interface ActiveCoverage {
  id: string;
  productName: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  startTime: Date;
  endTime: Date;
  totalCost: number;
  accumulatedCost: number;
  coverage: string;
  stellarTxHash: string;
  category: string;
  coverageAmount: number;
  popular?: boolean;
}

const Coverage: React.FC = () => {
  const [coverages, setCoverages] = useState<ActiveCoverage[]>([]);
  const [filteredCoverages, setFilteredCoverages] = useState<ActiveCoverage[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [pauseLoading, setPauseLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const { user } = useAuth();

  useEffect(() => {
    const fetchActiveCoverages = async () => {
      try {
        const coveragesData = await CoveragesService.getUserCoverages(user?.id);
        setCoverages(coveragesData);
        setFilteredCoverages(coveragesData);
      } catch (error) {
        toast({
          title: "Erro ao carregar coberturas",
          description: "Não foi possível carregar informações das coberturas.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchActiveCoverages();
    } else {
      setLoading(false);
    }
  }, [toast, user?.id]);

  // Filter coverages based on search and filters
  useEffect(() => {
    let filtered = coverages;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(coverage =>
        coverage.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coverage.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(coverage => coverage.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(coverage => coverage.category === categoryFilter);
    }

    setFilteredCoverages(filtered);
  }, [coverages, searchTerm, statusFilter, categoryFilter]);

  const handlePauseCoverage = async (coverageId: string) => {
    setPauseLoading(coverageId);
    try {
      await CoveragesService.pauseCoverage(coverageId);

      setCoverages(prev => prev.map(coverage =>
        coverage.id === coverageId
          ? { ...coverage, status: 'PAUSED' as const }
          : coverage
      ));

      toast({
        title: "Cobertura pausada",
        description: "Sua cobertura foi pausada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao pausar cobertura",
        description: "Não foi possível pausar a cobertura.",
        variant: "destructive"
      });
    } finally {
      setPauseLoading(null);
    }
  };

  const handleResumeCoverage = async (coverageId: string) => {
    setPauseLoading(coverageId);
    try {
      await CoveragesService.resumeCoverage(coverageId);

      setCoverages(prev => prev.map(coverage =>
        coverage.id === coverageId
          ? { ...coverage, status: 'ACTIVE' as const }
          : coverage
      ));

      toast({
        title: "Cobertura reativada",
        description: "Sua cobertura foi reativada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao reativar cobertura",
        description: "Não foi possível reativar a cobertura.",
        variant: "destructive"
      });
    } finally {
      setPauseLoading(null);
    }
  };

  const getTimeRemaining = (coverage: ActiveCoverage) => {
    const now = new Date().getTime();
    const end = coverage.endTime.getTime();
    const remaining = end - now;

    if (remaining <= 0) {
      return 'Expirado';
    }

    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const getProgressPercentage = (coverage: ActiveCoverage) => {
    const now = new Date().getTime();
    const end = coverage.endTime.getTime();
    const start = coverage.startTime.getTime();
    const total = end - start;
    const remaining = end - now;

    if (remaining <= 0) return 100;
    return ((total - remaining) / total) * 100;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Pause className="w-3 h-3 mr-1" />
            Pausado
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expirado
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelado
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (coverages.length === 0) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhuma Cobertura</h2>
            <p className="text-muted-foreground mb-6">
              Você não possui nenhuma cobertura no momento.
            </p>
            <Button asChild>
              <Link to="/">Ver Produtos Disponíveis</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Minhas Coberturas</h1>
              <p className="text-muted-foreground">
                Monitore suas proteções em tempo real
              </p>
            </div>
            <Button asChild>
              <Link to="/">
                <Plus className="w-4 h-4 mr-2" />
                Nova Cobertura
              </Link>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-success mb-1">
                  {coverages.filter(c => c.status === 'ACTIVE').length}
                </div>
                <p className="text-sm text-muted-foreground">Ativas</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {coverages.filter(c => c.status === 'PAUSED').length}
                </div>
                <p className="text-sm text-muted-foreground">Pausadas</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  R$ {coverages.reduce((sum, c) => sum + c.accumulatedCost, 0).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Gasto</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar coberturas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="ACTIVE">Ativas</SelectItem>
                  <SelectItem value="PAUSED">Pausadas</SelectItem>
                  <SelectItem value="EXPIRED">Expiradas</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Shield className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="acidentes">Acidentes</SelectItem>
                  <SelectItem value="viagem">Viagem</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="esporte">Esporte</SelectItem>
                  <SelectItem value="residencial">Residencial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredCoverages.length} cobertura{filteredCoverages.length !== 1 ? 's' : ''} encontrada{filteredCoverages.length !== 1 ? 's' : ''}
              </p>
              {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Coverage Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoverages.map((coverage) => (
            <Card key={coverage.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    {coverage.category.charAt(0).toUpperCase() + coverage.category.slice(1)}
                  </Badge>
                  {getStatusBadge(coverage.status)}
                </div>
                <CardTitle className="text-lg leading-tight">
                  {coverage.productName}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Timer and Progress */}
                {coverage.status === 'ACTIVE' && (
                  <div className="text-center">
                    <div className="text-2xl font-mono font-bold text-gradient-primary mb-2">
                      {getTimeRemaining(coverage)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Tempo restante</p>
                    <Progress value={getProgressPercentage(coverage)} className="h-2" />
                  </div>
                )}

                {/* Coverage Details */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="font-bold text-sm">{coverage.coverage}</div>
                    <div className="text-xs text-muted-foreground">Cobertura</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <div className="font-bold text-sm">
                      R$ {coverage.accumulatedCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Gasto</div>
                  </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Início:</span>
                    <span>{coverage.startTime.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Término:</span>
                    <span>{coverage.endTime.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  {coverage.status === 'ACTIVE' && (
                    <Button 
                      onClick={() => handlePauseCoverage(coverage.id)}
                      disabled={pauseLoading === coverage.id}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      {pauseLoading === coverage.id ? (
                        "Pausando..."
                      ) : (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Pausar
                        </>
                      )}
                    </Button>
                  )}

                  {coverage.status === 'PAUSED' && (
                    <Button 
                      onClick={() => handleResumeCoverage(coverage.id)}
                      disabled={pauseLoading === coverage.id}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      {pauseLoading === coverage.id ? (
                        "Reativando..."
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Reativar
                        </>
                      )}
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-full"
                  >
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${coverage.stellarTxHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2"
                    >
                      Ver Transação
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No results message */}
        {filteredCoverages.length === 0 && (
          <div className="text-center py-12">
            <Shield className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma cobertura encontrada</h3>
            <p className="text-muted-foreground mb-6">
              Tente ajustar os filtros ou termo de busca para encontrar o que procura.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Coverage;