import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Shield, 
  Wallet, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Upload,
  Edit,
  Save,
  X,
  Eye,
  Download,
  ExternalLink,
  Activity,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  document?: string;
  walletAddress?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocumentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  type: 'login' | 'policy' | 'payment' | 'kyc' | 'profile';
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    walletAddress: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchActivities();
  }, []);

  const fetchProfile = async () => {
    try {
      // Mock API call - replace with actual endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockProfile: UserProfile = {
        id: user?.id || 'user_123',
        email: user?.email || 'usuario@exemplo.com',
        name: user?.name || 'João Silva',
        phone: '+55 11 99999-9999',
        document: '123.456.789-00',
        walletAddress: 'GCKFBEIYTKP...XLWVYHS',
        kycStatus: 'pending',
        kycDocumentUrl: undefined,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      };
      
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        document: mockProfile.document || '',
        walletAddress: mockProfile.walletAddress || ''
      });
    } catch (error) {
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar os dados do perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      // Mock activities data
      const mockActivities: ActivityLog[] = [
        {
          id: '1',
          action: 'Login realizado',
          description: 'Acesso ao sistema via email',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'login'
        },
        {
          id: '2',
          action: 'Apólice ativada',
          description: 'Acidentes 48h - R$ 3,00',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          type: 'policy'
        },
        {
          id: '3',
          action: 'Pagamento confirmado',
          description: 'PIX - R$ 3,00',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
          type: 'payment'
        },
        {
          id: '4',
          action: 'Documento enviado',
          description: 'RG para verificação KYC',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'kyc'
        },
        {
          id: '5',
          action: 'Perfil atualizado',
          description: 'Telefone alterado',
          timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
          type: 'profile'
        }
      ];
      
      setActivities(mockActivities);
    } catch (error) {
      console.error('Erro ao carregar atividades:', error);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Mock API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setProfile(prev => prev ? {
        ...prev,
        ...formData,
        updatedAt: new Date()
      } : null);
      
      setEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        document: profile.document || '',
        walletAddress: profile.walletAddress || ''
      });
    }
    setEditing(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // Mock file upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProfile(prev => prev ? {
        ...prev,
        kycDocumentUrl: URL.createObjectURL(file),
        kycStatus: 'pending'
      } : null);
      
      toast({
        title: "Documento enviado",
        description: "Seu documento foi enviado para verificação.",
      });
    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o documento.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getKycStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge variant="secondary" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            Verificado
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejeitado
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <User className="w-4 h-4 text-primary" />;
      case 'policy':
        return <Shield className="w-4 h-4 text-success" />;
      case 'payment':
        return <Wallet className="w-4 h-4 text-secondary" />;
      case 'kyc':
        return <FileText className="w-4 h-4 text-warning" />;
      case 'profile':
        return <Settings className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Layout requireAuth>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
              <div className="h-96 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) return null;

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meu Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais e configurações
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Pessoal</TabsTrigger>
                <TabsTrigger value="kyc">Verificação</TabsTrigger>
                <TabsTrigger value="wallet">Carteira</TabsTrigger>
              </TabsList>

              {/* Personal Information */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Informações Pessoais
                        </CardTitle>
                        <CardDescription>
                          Gerencie seus dados pessoais e de contato
                        </CardDescription>
                      </div>
                      {!editing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancelar
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Salvando...' : 'Salvar'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          disabled={!editing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          disabled={!editing}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                          disabled={!editing}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="document">CPF/CNPJ</Label>
                        <Input
                          id="document"
                          value={formData.document}
                          onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                          disabled={!editing}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* KYC Verification */}
              <TabsContent value="kyc" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Verificação de Identidade (KYC)
                    </CardTitle>
                    <CardDescription>
                      Envie seus documentos para verificação de identidade
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* KYC Status */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-medium">Status da Verificação</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.kycStatus === 'verified' && 'Sua identidade foi verificada com sucesso'}
                            {profile.kycStatus === 'pending' && 'Aguardando análise dos documentos'}
                            {profile.kycStatus === 'rejected' && 'Documentos rejeitados - envie novamente'}
                          </p>
                        </div>
                      </div>
                      {getKycStatusBadge(profile.kycStatus)}
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-4">
                      <Label>Documento de Identidade</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Envie uma foto do seu RG, CNH ou Passaporte
                        </p>
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="kyc-upload"
                          disabled={uploading}
                        />
                        <Button
                          variant="outline"
                          asChild
                          disabled={uploading}
                        >
                          <label htmlFor="kyc-upload" className="cursor-pointer">
                            {uploading ? 'Enviando...' : 'Selecionar Arquivo'}
                          </label>
                        </Button>
                      </div>
                    </div>

                    {/* Document Preview */}
                    {profile.kycDocumentUrl && (
                      <div className="space-y-2">
                        <Label>Documento Enviado</Label>
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="flex-1 text-sm">documento_identidade.pdf</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Wallet */}
              <TabsContent value="wallet" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wallet className="w-5 h-5" />
                      Carteira Stellar
                    </CardTitle>
                    <CardDescription>
                      Gerencie seu endereço da carteira Stellar
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="walletAddress">Endereço da Carteira</Label>
                      <div className="flex gap-2">
                        <Input
                          id="walletAddress"
                          value={formData.walletAddress}
                          onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
                          disabled={!editing}
                          placeholder="GCKFBEIYTKP...XLWVYHS"
                        />
                        <Button variant="outline" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium text-primary mb-1">Sobre a Carteira Stellar</h3>
                          <p className="text-sm text-muted-foreground">
                            Sua carteira Stellar é usada para receber pagamentos de sinistros 
                            e gerenciar transações na blockchain. Mantenha-a segura e atualizada.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Summary */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle>Resumo do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{profile.name}</p>
                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Membro desde</span>
                    <span>{profile.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status KYC</span>
                    {getKycStatusBadge(profile.kycStatus)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Atividades Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.timestamp.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
