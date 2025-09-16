import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Download, 
  Filter, 
  Search,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Shield,
  Play,
  Pause,
  Calendar,
  FileText
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LedgerService, LedgerEventUI } from '@/services/ledgerService';
import { PoliciesService, Policy } from '@/services/policiesService';

const History: React.FC = () => {
  const [events, setEvents] = useState<LedgerEventUI[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<LedgerEventUI[]>([]);
  const [filteredPolicies, setFilteredPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'policies' | 'transactions'>('policies');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        // Buscar apólices e transações em paralelo
        const [policiesData, eventsData] = await Promise.all([
          PoliciesService.getUserPolicies(user.id),
          LedgerService.getUserEvents(user.id)
        ]);
        
        setPolicies(policiesData);
        setEvents(eventsData);
        setFilteredPolicies(policiesData);
        setFilteredEvents(eventsData);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error loading history',
          description: 'Could not load the history of policies and transactions.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [toast, user?.id]);

  useEffect(() => {
    // Filtrar apólices
    let filteredPolicies = policies;
    if (searchTerm) {
      filteredPolicies = filteredPolicies.filter(policy =>
        policy.policy_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.product?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        policy.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filteredPolicies = filteredPolicies.filter(policy => policy.status === filterType);
    }
    setFilteredPolicies(filteredPolicies);

    // Filtrar transações
    let filteredEvents = events;
    if (searchTerm) {
      filteredEvents = filteredEvents.filter(event =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.policyId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterType !== 'all') {
      filteredEvents = filteredEvents.filter(event => event.type === filterType);
    }
    setFilteredEvents(filteredEvents);
  }, [policies, events, searchTerm, filterType]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PolicyActivated':
        return <Shield className="w-5 h-5 text-success" />;
      case 'PolicyPaused':
        return <Clock className="w-5 h-5 text-warning" />;
      case 'PolicyExpired':
        return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
      case 'WEBHOOK_PAYMENT_CONFIRMED':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'CHARGE_STARTED':
        return <DollarSign className="w-5 h-5 text-primary" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPolicyStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="secondary" className="bg-success/20 text-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'PAUSED':
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            <Pause className="w-3 h-3 mr-1" />
            Paused
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="secondary" className="bg-muted/20 text-muted-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="secondary" className="bg-success/20 text-success">
            Completed
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning/20 text-warning">
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const handlePausePolicy = async (policyId: string) => {
    try {
      await PoliciesService.pause(policyId);
      toast({
        title: "Policy paused",
        description: "The policy has been paused successfully.",
      });
      // Recarregar dados
      if (user?.id) {
        const policiesData = await PoliciesService.getUserPolicies(user.id);
        setPolicies(policiesData);
        setFilteredPolicies(policiesData);
      }
    } catch (error) {
      toast({
        title: "Error pausing policy",
        description: "Could not pause the policy.",
        variant: "destructive"
      });
    }
  };

  const handleActivatePolicy = async (policyId: string) => {
    try {
      await PoliciesService.activate(policyId);
      toast({
        title: "Policy activated",
        description: "The policy has been activated successfully.",
      });
      // Recarregar dados
      if (user?.id) {
        const policiesData = await PoliciesService.getUserPolicies(user.id);
        setPolicies(policiesData);
        setFilteredPolicies(policiesData);
      }
    } catch (error) {
      toast({
        title: "Error activating policy",
        description: "Could not activate the policy.",
        variant: "destructive"
      });
    }
  };

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Your report will be generated shortly...",
    });
    // Mock PDF export - replace with actual implementation
  };

  const totalAmount = events
    .filter(e => e.status === 'completed' && e.amount > 0)
    .reduce((sum, e) => sum + e.amount, 0);

  const totalPolicies = policies.length;
  const activePolicies = policies.filter(p => p.status === 'ACTIVE').length;
  const totalSpent = policies.reduce((sum, p) => sum + p.premium_amount, 0);

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded"></div>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">History</h1>
            <p className="text-muted-foreground">
              Manage your policies and track transactions
            </p>
          </div>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted/30 p-1 rounded-lg w-fit">
          <Button
            variant={activeTab === 'policies' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('policies')}
            className="flex items-center gap-2"
          >
            <Shield className="w-4 h-4" />
            Policies ({totalPolicies})
          </Button>
          <Button
            variant={activeTab === 'transactions' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('transactions')}
            className="flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            Transactions ({events.length})
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {activeTab === 'policies' ? (
            <>
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">R$ {totalSpent.toFixed(2)}</div>
                  <p className="text-muted-foreground">Total Spent</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold">{activePolicies}</div>
                  <p className="text-muted-foreground">Active Policies</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold">{totalPolicies}</div>
                  <p className="text-muted-foreground">Total Policies</p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
                  <p className="text-muted-foreground">Total in Transactions</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {events.filter(e => e.type === 'PolicyActivated').length}
                  </div>
                  <p className="text-muted-foreground">Policies Activated</p>
                </CardContent>
              </Card>
              
              <Card className="glass-card border-border/50">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <div className="text-2xl font-bold">
                    {events.filter(e => e.status === 'completed').length}
                  </div>
                  <p className="text-muted-foreground">Completed Transactions</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={activeTab === 'policies' 
                  ? "Search by policy number, product or status..."
                  : "Search by description, type or policy ID..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-md border border-border bg-background text-foreground"
          >
            {activeTab === 'policies' ? (
              <>
                <option value="all">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </>
            ) : (
              <>
                <option value="all">All types</option>
                <option value="PolicyActivated">Policies Activated</option>
                <option value="WEBHOOK_PAYMENT_CONFIRMED">Payments</option>
                <option value="CHARGE_STARTED">Charges</option>
                <option value="PolicyPaused">Paused</option>
                <option value="PolicyExpired">Expired</option>
              </>
            )}
          </select>
        </div>

        {/* Content List */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>
              {activeTab === 'policies' ? 'Your Policies' : 'Recent Transactions'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {activeTab === 'policies' ? (
              filteredPolicies.length === 0 ? (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No policies found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting the search filters.'
                      : 'Your policies will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredPolicies.map((policy, index) => (
                    <div
                      key={policy.id}
                      className={`p-6 hover:bg-muted/30 transition-smooth ${
                        index === 0 ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            <Shield className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{policy.product?.name || 'Produto'}</h4>
                              {getPolicyStatusBadge(policy.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span className="font-mono">
                                {policy.policy_number}
                              </span>
                              
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(policy.start_date).toLocaleDateString('en-US')} - {new Date(policy.end_date).toLocaleDateString('en-US')}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="text-right mr-4">
                            <div className="font-bold text-lg">
                              R$ {policy.premium_amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Coverage: R$ {policy.coverage_amount.toFixed(2)}
                            </div>
                          </div>
                          
                          {policy.status === 'ACTIVE' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePausePolicy(policy.id)}
                            >
                              <Pause className="w-4 h-4 mr-1" />
                              Pause
                            </Button>
                          )}
                          
                          {policy.status === 'PAUSED' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleActivatePolicy(policy.id)}
                            >
                              <Play className="w-4 h-4 mr-1" />
                              Activer
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              filteredEvents.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== 'all' 
                      ? 'Try adjusting the search filters.'
                      : 'Your transactions will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {filteredEvents.map((event, index) => (
                    <div
                      key={event.id}
                      className={`p-6 hover:bg-muted/30 transition-smooth ${
                        index === 0 ? 'bg-primary/5 border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                          <div className="mt-1">
                            {getEventIcon(event.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{event.description}</h4>
                              {getEventStatusBadge(event.status)}
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {event.timestamp.toLocaleDateString('en-US', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                              
                              {event.policyId && (
                                <span className="font-mono">
                                  ID: {event.policyId}
                                </span>
                              )}
                              
                              {event.txHash && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-auto p-0 text-xs"
                                >
                                  <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-primary"
                                  >
                                    View on Stellar
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {event.amount > 0 && (
                          <div className="text-right">
                            <div className="font-bold text-lg">
                              R$ {event.amount.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;