import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Plus, Eye, MessageCircle, Calendar, DollarSign, CheckCircle, Clock, X, Send, Search, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ClaimsService, ClaimUI } from '@/services/claimsService';
import { PoliciesService, Policy } from '@/services/policiesService';

interface ClaimMessage { id: string; claimId: string; sender: 'user' | 'support'; message: string; timestamp: Date; }

const Claims: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimUI | null>(null);
  const [messages, setMessages] = useState<ClaimMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newClaim, setNewClaim] = useState({ claimType: '', description: '', incidentDate: '', claimAmount: '', policyId: '' });
  const [claimDocuments, setClaimDocuments] = useState<File[]>([]);
  const [eligibleProductCodes, setEligibleProductCodes] = useState<string[]>(['INCOME_PER_DIEM']); // Fallback padrão

  useEffect(() => { if (user?.id) fetchData(); }, [user?.id]);

  const fetchData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Buscar claims, policies e produtos elegíveis em paralelo
      const [claimsData, policiesData, eligibleProductsData] = await Promise.all([
        ClaimsService.list(user.id),
        PoliciesService.getUserPolicies(user.id),
        ClaimsService.getEligibleProducts()
      ]);
      
      setClaims(claimsData);
      setPolicies(policiesData);
      setEligibleProductCodes(eligibleProductsData.allowedProducts);
    } catch (e: any) {
      toast({ title: 'Error loading data', description: e.message || 'Request failed', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const fetchMessages = async (claimId: string) => {
    const mock: ClaimMessage[] = [
      { id: '1', claimId, sender: 'user', message: 'Hello, what is the status?', timestamp: new Date(Date.now() - 60*60*1000) },
      { id: '2', claimId, sender: 'support', message: 'Under review, we will get back to you soon.', timestamp: new Date(Date.now() - 30*60*1000) }
    ];
    setMessages(mock);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { toast({ title: 'Invalid session', description: 'User not authenticated', variant: 'destructive' }); return; }
    if (!newClaim.claimType || !newClaim.description || !newClaim.incidentDate || !newClaim.claimAmount || !newClaim.policyId) {
      toast({ title: 'Required fields', description: 'Please fill in all required fields.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const created = await ClaimsService.create(user.id, { policyId: newClaim.policyId || '', claimType: newClaim.claimType, description: newClaim.description, incidentDate: newClaim.incidentDate, claimAmount: parseFloat(newClaim.claimAmount) });
      setClaims(prev => [created, ...prev]);
      setNewClaim({ claimType: '', description: '', incidentDate: '', claimAmount: '', policyId: '' });
      setClaimDocuments([]);
      toast({ title: 'Claim created', description: `Claim ${created.claimNumber} submitted.` });
    } catch (e: any) { 
      toast({ title: 'Error creating', description: e.message || 'Creation failed', variant: 'destructive' }); 
    }
    finally { setSubmitting(false); }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedClaim) return;
    const m: ClaimMessage = { id: Date.now().toString(), claimId: selectedClaim.id, sender: 'user', message: newMessage, timestamp: new Date() };
    setMessages(prev => [...prev, m]);
    setNewMessage('');
    setTimeout(() => setMessages(prev => [...prev, { id: (Date.now()+1).toString(), claimId: selectedClaim.id, sender: 'support', message: 'Message received.', timestamp: new Date() }]), 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setClaimDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setClaimDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Submitted</Badge>;
      case 'under_review': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Eye className="w-3 h-3 mr-1" />Under Review</Badge>;
      case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'paid': return <Badge variant="secondary" className="bg-green-100 text-green-800"><DollarSign className="w-3 h-3 mr-1" />Paid</Badge>;
      default: return null;
    }
  };

  const getClaimTypeLabel = (t: string) => t === 'income_loss' ? 'Income Loss' : t;

  // Função para verificar se uma apólice permite sinistros
  const isPolicyEligibleForClaims = (policy: Policy) => {
    return policy.status === 'ACTIVE' && eligibleProductCodes.includes(policy.product?.code || '');
  };

  // Contar apólices elegíveis
  const eligiblePolicies = policies.filter(isPolicyEligibleForClaims);

  const filteredClaims = claims.filter(c => {
    const search = searchTerm.toLowerCase();
    const matchesSearch = c.claimNumber.toLowerCase().includes(search) || c.description.toLowerCase().includes(search);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-64 bg-muted rounded" />)}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Claims</h1>
            <p className="text-muted-foreground">
              Manage your claims and track the status of your requests
            </p>
            {eligiblePolicies.length === 0 && policies.filter(p => p.status === 'ACTIVE').length > 0 && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Information:</strong> In the MVP, only policies of the following types allow claims: {eligibleProductCodes.join(', ')}. 
                  You have {policies.filter(p => p.status === 'ACTIVE').length} active policie(s), but none eligible for claims.
                </p>
              </div>
            )}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary" disabled={eligiblePolicies.length === 0}>
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Claim</DialogTitle>
                <DialogDescription>
                  Fill in the claim details and attach the necessary documents
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitClaim} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimType">Claim Type *</Label>
                    <Select value={newClaim.claimType} onValueChange={(value) => setNewClaim(prev => ({ ...prev, claimType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="accident">Accident</SelectItem>
                        <SelectItem value="medical">Medical Expenses</SelectItem>
                        <SelectItem value="income_loss">Income Loss</SelectItem>
                        <SelectItem value="property">Property Damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentDate">Incident Date *</Label>
                    <Input
                      id="incidentDate"
                      type="date"
                      value={newClaim.incidentDate}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, incidentDate: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="claimAmount">Claim Amount (R$) *</Label>
                    <Input
                      id="claimAmount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={newClaim.claimAmount}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, claimAmount: e.target.value }))}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="policyId">Policy *</Label>
                    <Select value={newClaim.policyId} onValueChange={(value) => setNewClaim(prev => ({ ...prev, policyId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a policy" />
                      </SelectTrigger>
                      <SelectContent>
                        {eligiblePolicies.map(policy => (
                            <SelectItem key={policy.id} value={policy.id}>
                              {policy.policy_number} - {policy.product?.name || 'Product'} (R$ {policy.coverage_amount.toFixed(2)})
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                    {eligiblePolicies.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No eligible policies for claims found. In the MVP, only policies of the following types allow claims: {eligibleProductCodes.join(', ')}.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Claim Description *</Label>
                  <Textarea
                    id="description"
                    value={newClaim.description}
                    onChange={(e) => setNewClaim(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe in detail what happened..."
                    rows={4}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Attached Documents</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Send photos, PDFs or other related documents
                    </p>
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="claim-documents"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      asChild
                    >
                      <label htmlFor="claim-documents" className="cursor-pointer">
                        Select Files
                      </label>
                    </Button>
                  </div>
                  
                  {claimDocuments.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Files</Label>
                      <div className="space-y-2">
                        {claimDocuments.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                            <FileText className="w-4 h-4 text-muted-foreground" />
                            <span className="flex-1 text-sm">{file.name}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Claim'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by number or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map(c => (
            <Card key={c.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{c.claimNumber}</CardTitle>
                    <CardDescription className="mt-1">{getClaimTypeLabel(c.claimType)}</CardDescription>
                  </div>
                  {getStatusBadge(c.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{c.incidentDate.toLocaleDateString('en-US')}</span></div>
                  <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-primary" /><span className="font-medium">R$ {c.claimAmount.toFixed(2)}</span>{c.approvedAmount !== undefined && <span className="text-muted-foreground">(Approved: R$ {c.approvedAmount.toFixed(2)})</span>}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setSelectedClaim(c); fetchMessages(c.id); }}><MessageCircle className="w-4 h-4 mr-2" />Chat</Button>
                  <Button variant="outline" size="sm"><Eye className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No claims found</h3>
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting the search filters.'
                : 'You don\'t have any registered claims yet.'}
            </p>
          </div>
        )}
        {selectedClaim && (
          <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Chat - {selectedClaim.claimNumber}
                </DialogTitle>
                <DialogDescription>
                  Chat with our team about this claim
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                        <p className="text-sm">{m.message}</p>
                        <p className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleString('en-US')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
};

export default Claims;
