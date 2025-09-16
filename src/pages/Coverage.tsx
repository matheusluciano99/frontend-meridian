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
  status: string;
  startTime: Date | null;
  endTime: Date | null;
  totalCost: number;
  accumulatedCost: number;
  coverage: string;
  stellarTxHash: string;
  category: string;
  coverageAmount: number;
  popular?: boolean;
  fundingBalance: number;
  hourlyRate: number;
  nextChargeAt: string | null;
  hoursRemaining: number | null;
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
          title: "Error loading coverages",
          description: "Could not load coverage information.",
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
        title: "Coverage paused",
        description: "Your coverage has been paused successfully.",
      });
    } catch (error) {
      toast({
        title: "Error pausing coverage",
        description: "Could not pause the coverage.",
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
        title: "Coverage resumed",
        description: "Your coverage has been resumed successfully.",
      });
    } catch (error) {
      toast({
        title: "Error resuming coverage",
        description: "Could not resume the coverage.",
        variant: "destructive"
      });
    } finally {
      setPauseLoading(null);
    }
  };

  const getTimeRemaining = (coverage: ActiveCoverage) => {
    if (!coverage.endTime) return '-';
    const now = new Date().getTime();
    const end = coverage.endTime.getTime();
    const remaining = end - now;
    if (remaining <= 0) return 'Expired';
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getProgressPercentage = (coverage: ActiveCoverage) => {
    const now = new Date().getTime();
  if (!coverage.startTime || !coverage.endTime) return 0;
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
            Active
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Pause className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary" className="bg-muted text-muted-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
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
            <h2 className="text-2xl font-bold mb-2">No Coverage</h2>
            <p className="text-muted-foreground mb-6">
              You don't have any coverage at the moment.
            </p>
            <Button asChild>
              <Link to="/">View Available Products</Link>
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
              <h1 className="text-3xl font-bold mb-2">My Coverage</h1>
              <p className="text-muted-foreground">
                Monitor your protections in real time
              </p>
            </div>
            <Button asChild>
              <Link to="/">
                <Plus className="w-4 h-4 mr-2" />
                New Coverage
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
                <p className="text-sm text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-warning mb-1">
                  {coverages.filter(c => c.status === 'PAUSED').length}
                </div>
                <p className="text-sm text-muted-foreground">Paused</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-border/50">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  R$ {coverages.reduce((sum, c) => sum + c.accumulatedCost, 0).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">Total Spent</p>
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
                    placeholder="Search coverages..."
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
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PAUSED">Paused</SelectItem>
                  <SelectItem value="EXPIRED">Expired</SelectItem>
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <Shield className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  <SelectItem value="acidentes">Accidents</SelectItem>
                  <SelectItem value="viagem">Travel</SelectItem>
                  <SelectItem value="saude">Health</SelectItem>
                  <SelectItem value="esporte">Sports</SelectItem>
                  <SelectItem value="residencial">Residential</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                {filteredCoverages.length} coverage{filteredCoverages.length !== 1 ? 's' : ''} found
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
                  Clear filters
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
                    <p className="text-sm text-muted-foreground mb-3">Time remaining</p>
                    <Progress value={getProgressPercentage(coverage)} className="h-2" />
                  </div>
                )}

                {/* Coverage Details */}
                    <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <DollarSign className="w-4 h-4 text-primary mx-auto mb-1" />
                    <div className="font-bold text-sm">{coverage.coverage}</div>
                    <div className="text-xs text-muted-foreground">Coverage</div>
                  </div>
                  <div className="text-center p-3 bg-muted/30 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-secondary mx-auto mb-1" />
                    <div className="font-bold text-sm">
                      R$ {coverage.accumulatedCost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Spent</div>
                  </div>
                      <div className="text-center p-3 bg-muted/30 rounded-lg col-span-2">
                        <div className="flex justify-center gap-6">
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Funding</div>
                            <div className="font-bold text-sm">{coverage.fundingBalance.toFixed(2)} XLM</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Hourly Rate</div>
                            <div className="font-bold text-sm">{coverage.hourlyRate.toFixed(4)} XLM</div>
                          </div>
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Hours Left</div>
                            <div className="font-bold text-sm">{coverage.hoursRemaining !== null ? coverage.hoursRemaining : '-'}</div>
                          </div>
                        </div>
                      </div>
                </div>

                {/* Dates */}
                <div className="space-y-2 text-sm">
                  {coverage.startTime && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">Start:</span>
                      <span>{coverage.startTime.toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                  {coverage.endTime && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <span className="text-muted-foreground">End:</span>
                      <span>{coverage.endTime.toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
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
                        "Pausing..."
                      ) : (
                        <>
                          <Pause className="w-3 h-3 mr-2" />
                          Pause
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
                        "Resuming..."
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-2" />
                          Resume
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
                      View Transaction
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
            <h3 className="text-xl font-semibold mb-2">No coverage found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting the filters or search term to find what you're looking for.
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