import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileText, 
  Plus, 
  Upload, 
  Eye, 
  Download, 
  MessageCircle,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Send,
  Camera,
  FileImage,
  ExternalLink,
  Filter,
  Search
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface Claim {
  id: string;
  claimNumber: string;
  policyId: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'paid';
  claimType: string;
  description: string;
  incidentDate: Date;
  claimAmount: number;
  approvedAmount?: number;
  documents: ClaimDocument[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ClaimDocument {
  id: string;
  name: string;
  type: 'image' | 'pdf' | 'other';
  url: string;
  uploadedAt: Date;
}

interface ClaimMessage {
  id: string;
  claimId: string;
  sender: 'user' | 'support';
  message: string;
  timestamp: Date;
  attachments?: string[];
}

const Claims: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [messages, setMessages] = useState<ClaimMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Form states for new claim
  const [newClaim, setNewClaim] = useState({
    claimType: '',
    description: '',
    incidentDate: '',
    claimAmount: '',
    policyId: ''
  });
  const [claimDocuments, setClaimDocuments] = useState<File[]>([]);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockClaims: Claim[] = [
        {
          id: '1',
          claimNumber: 'CLM-20241201-000001',
          policyId: 'policy_123',
          status: 'under_review',
          claimType: 'accident',
          description: 'Acidente de trânsito durante deslocamento para trabalho',
          incidentDate: new Date('2024-11-28'),
          claimAmount: 5000,
          approvedAmount: undefined,
          documents: [
            {
              id: '1',
              name: 'boletim_ocorrencia.pdf',
              type: 'pdf',
              url: '/documents/boletim_ocorrencia.pdf',
              uploadedAt: new Date('2024-11-29')
            },
            {
              id: '2',
              name: 'foto_dano.jpg',
              type: 'image',
              url: '/documents/foto_dano.jpg',
              uploadedAt: new Date('2024-11-29')
            }
          ],
          notes: 'Aguardando análise dos documentos enviados',
          createdAt: new Date('2024-11-29'),
          updatedAt: new Date('2024-11-30')
        },
        {
          id: '2',
          claimNumber: 'CLM-20241115-000002',
          policyId: 'policy_122',
          status: 'approved',
          claimType: 'medical',
          description: 'Despesas médicas por acidente doméstico',
          incidentDate: new Date('2024-11-10'),
          claimAmount: 2500,
          approvedAmount: 2500,
          documents: [
            {
              id: '3',
              name: 'receita_medica.pdf',
              type: 'pdf',
              url: '/documents/receita_medica.pdf',
              uploadedAt: new Date('2024-11-11')
            }
          ],
          notes: 'Sinistro aprovado e pago',
          createdAt: new Date('2024-11-11'),
          updatedAt: new Date('2024-11-20')
        },
        {
          id: '3',
          claimNumber: 'CLM-20241020-000003',
          policyId: 'policy_121',
          status: 'rejected',
          claimType: 'accident',
          description: 'Acidente durante atividade esportiva',
          incidentDate: new Date('2024-10-15'),
          claimAmount: 3000,
          approvedAmount: 0,
          documents: [
            {
              id: '4',
              name: 'atestado_medico.pdf',
              type: 'pdf',
              url: '/documents/atestado_medico.pdf',
              uploadedAt: new Date('2024-10-16')
            }
          ],
          notes: 'Sinistro rejeitado - atividade não coberta pela apólice',
          createdAt: new Date('2024-10-16'),
          updatedAt: new Date('2024-10-25')
        }
      ];
      
      setClaims(mockClaims);
    } catch (error) {
      toast({
        title: "Error loading claims",
        description: "Could not load your claims.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (claimId: string) => {
    try {
      // Mock messages for the claim
      const mockMessages: ClaimMessage[] = [
        {
          id: '1',
          claimId,
          sender: 'user',
          message: 'Hello, I would like to know the status of my claim.',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          claimId,
          sender: 'support',
          message: 'Hello! Your claim is under review. We will analyze the submitted documents and respond within 5 business days.',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        {
          id: '3',
          claimId,
          sender: 'user',
          message: 'Thank you for the information. Can I send additional documents if needed?',
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '4',
          claimId,
          sender: 'support',
          message: 'Yes, you can send. Any additional document that can help with the analysis is welcome.',
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newClaim.claimType || !newClaim.description || !newClaim.incidentDate || !newClaim.claimAmount) {
      toast({
        title: "Required fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      // Mock API call to create claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newClaimData: Claim = {
        id: Date.now().toString(),
        claimNumber: `CLM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(claims.length + 1).padStart(6, '0')}`,
        policyId: newClaim.policyId || 'policy_123',
        status: 'submitted',
        claimType: newClaim.claimType,
        description: newClaim.description,
        incidentDate: new Date(newClaim.incidentDate),
        claimAmount: parseFloat(newClaim.claimAmount),
        documents: claimDocuments.map((file, index) => ({
          id: index.toString(),
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : file.type === 'application/pdf' ? 'pdf' : 'other',
          url: URL.createObjectURL(file),
          uploadedAt: new Date()
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setClaims(prev => [newClaimData, ...prev]);
      
      // Reset form
      setNewClaim({
        claimType: '',
        description: '',
        incidentDate: '',
        claimAmount: '',
        policyId: ''
      });
      setClaimDocuments([]);
      
      toast({
        title: "Claim created successfully!",
        description: `Claim ${newClaimData.claimNumber} has been created and is under review.`,
      });
    } catch (error) {
      toast({
        title: "Error creating claim",
        description: "Could not create the claim. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setClaimDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setClaimDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedClaim) return;
    
    const message: ClaimMessage = {
      id: Date.now().toString(),
      claimId: selectedClaim.id,
      sender: 'user',
      message: newMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Mock response from support
    setTimeout(() => {
      const supportMessage: ClaimMessage = {
        id: (Date.now() + 1).toString(),
        claimId: selectedClaim.id,
        sender: 'support',
        message: 'Message received. Our team will respond shortly.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportMessage]);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" />
            Submitted
          </Badge>
        );
      case 'under_review':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            <Eye className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      case 'paid':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <DollarSign className="w-3 h-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return null;
    }
  };

  const getClaimTypeLabel = (type: string) => {
    switch (type) {
      case 'accident':
        return 'Accident';
      case 'medical':
        return 'Medical Expenses';
      case 'income_loss':
        return 'Income Loss';
      case 'property':
        return 'Property Damage';
      default:
        return type;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded"></div>
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
            <h1 className="text-3xl font-bold mb-2">Claims</h1>
            <p className="text-muted-foreground">
              Manage your claims and track request status
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="w-4 h-4 mr-2" />
                New Claim
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Claim</DialogTitle>
                <DialogDescription>
                  Fill in the claim data and attach the necessary documents
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
                    <Label htmlFor="policyId">Policy ID</Label>
                    <Input
                      id="policyId"
                      value={newClaim.policyId}
                      onChange={(e) => setNewClaim(prev => ({ ...prev, policyId: e.target.value }))}
                      placeholder="policy_123"
                    />
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

        {/* Filters */}
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
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Claims Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClaims.map((claim) => (
            <Card key={claim.id} className="glass-card border-border/50 hover:border-primary/50 transition-smooth">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{claim.claimNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      {getClaimTypeLabel(claim.claimType)}
                    </CardDescription>
                  </div>
                  {getStatusBadge(claim.status)}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {claim.description}
                  </p>
                  
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{claim.incidentDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="font-medium">R$ {claim.claimAmount.toFixed(2)}</span>
                    {claim.approvedAmount !== undefined && (
                      <span className="text-muted-foreground">
                        (Aprovado: R$ {claim.approvedAmount.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setSelectedClaim(claim);
                      fetchMessages(claim.id);
                    }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat
                  </Button>
                  
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
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

        {/* Chat Modal */}
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
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-muted/30 rounded-lg">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.sender === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-background border'
                        }`}
                      >
                        <p className="text-sm">{message.message}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Message Input */}
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
