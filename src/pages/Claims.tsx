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
import { FileText, Plus, Eye, MessageCircle, Calendar, DollarSign, CheckCircle, Clock, X, Send, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ClaimsService, ClaimUI } from '@/services/claimsService';

interface ClaimMessage { id: string; claimId: string; sender: 'user' | 'support'; message: string; timestamp: Date; }

const Claims: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [claims, setClaims] = useState<ClaimUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<ClaimUI | null>(null);
  const [messages, setMessages] = useState<ClaimMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [newClaim, setNewClaim] = useState({ claimType: '', description: '', incidentDate: '', claimAmount: '', policyId: '' });

  useEffect(() => { if (user?.id) fetchClaims(); }, [user?.id]);

  const fetchClaims = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const data = await ClaimsService.list(user.id);
      setClaims(data);
    } catch (e: any) {
      toast({ title: 'Erro ao carregar sinistros', description: e.message || 'Falha na requisição', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const fetchMessages = async (claimId: string) => {
    const mock: ClaimMessage[] = [
      { id: '1', claimId, sender: 'user', message: 'Olá, qual o status?', timestamp: new Date(Date.now() - 60*60*1000) },
      { id: '2', claimId, sender: 'support', message: 'Em análise, retornaremos em breve.', timestamp: new Date(Date.now() - 30*60*1000) }
    ];
    setMessages(mock);
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) { toast({ title: 'Sessão inválida', description: 'Usuário não autenticado', variant: 'destructive' }); return; }
    if (!newClaim.claimType || !newClaim.description || !newClaim.incidentDate || !newClaim.claimAmount) {
      toast({ title: 'Campos obrigatórios', description: 'Preencha todos os campos.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const created = await ClaimsService.create(user.id, { policyId: newClaim.policyId || '', claimType: newClaim.claimType, description: newClaim.description, incidentDate: newClaim.incidentDate, claimAmount: parseFloat(newClaim.claimAmount) });
      setClaims(prev => [created, ...prev]);
      setNewClaim({ claimType: '', description: '', incidentDate: '', claimAmount: '', policyId: '' });
      toast({ title: 'Sinistro criado', description: `Sinistro ${created.claimNumber} enviado.` });
    } catch (e: any) { toast({ title: 'Erro ao criar', description: e.message || 'Falha na criação', variant: 'destructive' }); }
    finally { setSubmitting(false); }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedClaim) return;
    const m: ClaimMessage = { id: Date.now().toString(), claimId: selectedClaim.id, sender: 'user', message: newMessage, timestamp: new Date() };
    setMessages(prev => [...prev, m]);
    setNewMessage('');
    setTimeout(() => setMessages(prev => [...prev, { id: (Date.now()+1).toString(), claimId: selectedClaim.id, sender: 'support', message: 'Mensagem recebida.', timestamp: new Date() }]), 1500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />Enviado</Badge>;
      case 'under_review': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Eye className="w-3 h-3 mr-1" />Em Análise</Badge>;
      case 'approved': return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Aprovado</Badge>;
      case 'rejected': return <Badge variant="secondary" className="bg-red-100 text-red-800"><X className="w-3 h-3 mr-1" />Rejeitado</Badge>;
      case 'paid': return <Badge variant="secondary" className="bg-green-100 text-green-800"><DollarSign className="w-3 h-3 mr-1" />Pago</Badge>;
      default: return null;
    }
  };

  const getClaimTypeLabel = (t: string) => t === 'income_loss' ? 'Perda de Renda' : t;

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
            <h1 className="text-3xl font-bold mb-2">Sinistros</h1>
            <p className="text-muted-foreground">Gerencie seus sinistros e acompanhe o status</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary"><Plus className="w-4 h-4 mr-2" />Novo Sinistro</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Sinistro</DialogTitle>
                <DialogDescription>Informe os detalhes do evento</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitClaim} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Sinistro *</Label>
                    <Select value={newClaim.claimType} onValueChange={v => setNewClaim(p => ({ ...p, claimType: v }))}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income_loss">Perda de Renda</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Data do Incidente *</Label>
                    <Input type="date" value={newClaim.incidentDate} onChange={e => setNewClaim(p => ({ ...p, incidentDate: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor do Sinistro (R$) *</Label>
                    <Input type="number" min="0" step="0.01" value={newClaim.claimAmount} onChange={e => setNewClaim(p => ({ ...p, claimAmount: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>ID da Apólice (opcional)</Label>
                    <Input value={newClaim.policyId} onChange={e => setNewClaim(p => ({ ...p, policyId: e.target.value }))} placeholder="policy_id" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Descrição *</Label>
                  <Textarea rows={4} value={newClaim.description} onChange={e => setNewClaim(p => ({ ...p, description: e.target.value }))} required />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? 'Enviando...' : 'Enviar Sinistro'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input className="pl-10" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-48"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="submitted">Enviado</SelectItem>
              <SelectItem value="under_review">Em Análise</SelectItem>
              <SelectItem value="approved">Aprovado</SelectItem>
              <SelectItem value="rejected">Rejeitado</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
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
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Calendar className="w-4 h-4" /><span>{c.incidentDate.toLocaleDateString('pt-BR')}</span></div>
                  <div className="flex items-center gap-2 text-sm"><DollarSign className="w-4 h-4 text-primary" /><span className="font-medium">R$ {c.claimAmount.toFixed(2)}</span>{c.approvedAmount !== undefined && <span className="text-muted-foreground">(Aprovado: R$ {c.approvedAmount.toFixed(2)})</span>}</div>
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
            <h3 className="text-lg font-medium mb-2">Nenhum sinistro encontrado</h3>
            <p className="text-muted-foreground">{searchTerm || statusFilter !== 'all' ? 'Ajuste os filtros.' : 'Você ainda não possui sinistros.'}</p>
          </div>
        )}
        {selectedClaim && (
          <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><MessageCircle className="w-5 h-5" />Chat - {selectedClaim.claimNumber}</DialogTitle>
                <DialogDescription>Converse sobre este sinistro</DialogDescription>
              </DialogHeader>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${m.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background border'}`}>
                        <p className="text-sm">{m.message}</p>
                        <p className="text-xs opacity-70 mt-1">{m.timestamp.toLocaleString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Digite sua mensagem..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}><Send className="w-4 h-4" /></Button>
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
