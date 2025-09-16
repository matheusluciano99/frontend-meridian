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
  Shield
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LedgerService, LedgerEventUI } from '@/services/ledgerService';

const History: React.FC = () => {
  const [events, setEvents] = useState<LedgerEventUI[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<LedgerEventUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        const evts = await LedgerService.getUserEvents(user.id);
        setEvents(evts);
        setFilteredEvents(evts);
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error loading history',
          description: 'Could not load transaction history.',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [toast, user?.id]);

  useEffect(() => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.policyId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(event => event.type === filterType);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterType]);

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

  const getStatusBadge = (status: string) => {
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
            <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
            <p className="text-muted-foreground">
              Track all your activities and payments
            </p>
          </div>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="glass-card border-border/50">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">R$ {totalAmount.toFixed(2)}</div>
              <p className="text-muted-foreground">Total Spent</p>
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
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by description, type or policy ID..."
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
            <option value="all">All types</option>
            <option value="PolicyActivated">Policies Activated</option>
            <option value="WEBHOOK_PAYMENT_CONFIRMED">Payments</option>
            <option value="CHARGE_STARTED">Charges</option>
            <option value="PolicyPaused">Paused</option>
            <option value="PolicyExpired">Expired</option>
          </select>
        </div>

        {/* Events List */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle>Recent Events</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No events found</h3>
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
                            {getStatusBadge(event.status)}
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                            <span>
                              {event.timestamp.toLocaleDateString('pt-BR', {
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
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default History;