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
  Settings,
  Copy,
  LogOut,
  RefreshCw,
  Calendar,
  Briefcase,
  DollarSign,
  MapPin,
  Heart,
  Car,
  Home,
  GraduationCap,
  Users,
  FileSearch
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  document?: string;
  kycStatus: 'pending' | 'verified' | 'rejected';
  kycDocumentUrl?: string;
  // Informações extras para avaliação de risco
  birthDate?: string;
  age?: number;
  occupation?: string;
  monthlyIncome?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed';
  dependents?: number;
  education?: 'elementary' | 'high_school' | 'college' | 'graduate' | 'postgraduate';
  hasHealthInsurance?: boolean;
  hasLifeInsurance?: boolean;
  hasAutoInsurance?: boolean;
  hasHomeInsurance?: boolean;
  smoker?: boolean;
  preExistingConditions?: string[];
  hobbies?: string[];
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
  const { wallet, isConnecting, connectWallet, disconnectWallet, getBalance } = useWallet();
  const { toast } = useToast();
  
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('personal');
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingExtra, setEditingExtra] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [refreshingWallet, setRefreshingWallet] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    document: '',
    // Informações extras
    birthDate: '',
    occupation: '',
    monthlyIncome: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    maritalStatus: 'single' as 'single' | 'married' | 'divorced' | 'widowed',
    dependents: 0,
    education: 'high_school' as 'elementary' | 'high_school' | 'college' | 'graduate' | 'postgraduate',
    hasHealthInsurance: false,
    hasLifeInsurance: false,
    hasAutoInsurance: false,
    hasHomeInsurance: false,
    smoker: false,
    preExistingConditions: [] as string[],
    hobbies: [] as string[]
  });

  useEffect(() => {
    fetchProfile();
    fetchActivities();
  }, []);

  // Efeito para atualizar dados da carteira quando a aba "wallet" for aberta
  useEffect(() => {
    if (activeTab === 'wallet') {
      console.log('💳 Aba carteira aberta - atualizando dados...');
      refreshWalletData();
    }
  }, [activeTab]);

  // Função para atualizar todos os dados da carteira
  const refreshWalletData = async () => {
    if (wallet) {
      setRefreshingWallet(true);
      try {
        console.log('🔄 Atualizando dados da carteira...');
        
        // Atualizar saldo
        await getBalance();
        
        // Verificar status da conta
        // Note: As funções checkAccountActivation e requestTestnetFunds 
        // serão chamadas pelos botões específicos quando necessário
        
        console.log('✅ Dados da carteira atualizados');
        
        toast({
          title: "Dados atualizados",
          description: "Informações da carteira foram atualizadas com sucesso.",
        });
      } catch (error) {
        console.error('❌ Erro ao atualizar dados da carteira:', error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar os dados da carteira.",
          variant: "destructive"
        });
      } finally {
        setRefreshingWallet(false);
      }
    }
  };

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
        kycStatus: 'pending',
        kycDocumentUrl: undefined,
        // Informações extras mockadas
        birthDate: '1990-05-15',
        age: 34,
        occupation: 'Engenheiro de Software',
        monthlyIncome: 15000,
        address: 'Rua das Flores, 123',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01234-567',
        maritalStatus: 'married',
        dependents: 2,
        education: 'college',
        hasHealthInsurance: true,
        hasLifeInsurance: false,
        hasAutoInsurance: true,
        hasHomeInsurance: false,
        smoker: false,
        preExistingConditions: ['Hipertensão leve'],
        hobbies: ['Futebol', 'Leitura', 'Viagem'],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date()
      };
      
      setProfile(mockProfile);
      setFormData({
        name: mockProfile.name,
        email: mockProfile.email,
        phone: mockProfile.phone || '',
        document: mockProfile.document || '',
        // Informações extras
        birthDate: mockProfile.birthDate || '',
        occupation: mockProfile.occupation || '',
        monthlyIncome: mockProfile.monthlyIncome?.toString() || '',
        address: mockProfile.address || '',
        city: mockProfile.city || '',
        state: mockProfile.state || '',
        zipCode: mockProfile.zipCode || '',
        maritalStatus: mockProfile.maritalStatus || 'single',
        dependents: mockProfile.dependents || 0,
        education: mockProfile.education || 'high_school',
        hasHealthInsurance: mockProfile.hasHealthInsurance || false,
        hasLifeInsurance: mockProfile.hasLifeInsurance || false,
        hasAutoInsurance: mockProfile.hasAutoInsurance || false,
        hasHomeInsurance: mockProfile.hasHomeInsurance || false,
        smoker: mockProfile.smoker || false,
        preExistingConditions: mockProfile.preExistingConditions || [],
        hobbies: mockProfile.hobbies || []
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
        monthlyIncome: formData.monthlyIncome ? parseFloat(formData.monthlyIncome) : undefined,
        updatedAt: new Date()
      } : null);
      
      setEditing(false);
      setEditingExtra(false);
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
        // Informações extras
        birthDate: profile.birthDate || '',
        occupation: profile.occupation || '',
        monthlyIncome: profile.monthlyIncome?.toString() || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        maritalStatus: profile.maritalStatus || 'single',
        dependents: profile.dependents || 0,
        education: profile.education || 'high_school',
        hasHealthInsurance: profile.hasHealthInsurance || false,
        hasLifeInsurance: profile.hasLifeInsurance || false,
        hasAutoInsurance: profile.hasAutoInsurance || false,
        hasHomeInsurance: profile.hasHomeInsurance || false,
        smoker: profile.smoker || false,
        preExistingConditions: profile.preExistingConditions || [],
        hobbies: profile.hobbies || []
      });
    }
    setEditing(false);
  };

  const handleCancelExtra = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || '',
        document: profile.document || '',
        // Informações extras
        birthDate: profile.birthDate || '',
        occupation: profile.occupation || '',
        monthlyIncome: profile.monthlyIncome?.toString() || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        zipCode: profile.zipCode || '',
        maritalStatus: profile.maritalStatus || 'single',
        dependents: profile.dependents || 0,
        education: profile.education || 'high_school',
        hasHealthInsurance: profile.hasHealthInsurance || false,
        hasLifeInsurance: profile.hasLifeInsurance || false,
        hasAutoInsurance: profile.hasAutoInsurance || false,
        hasHomeInsurance: profile.hasHomeInsurance || false,
        smoker: profile.smoker || false,
        preExistingConditions: profile.preExistingConditions || [],
        hobbies: profile.hobbies || []
      });
    }
    setEditingExtra(false);
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

  const handleConnectWallet = async () => {
    try {
      await connectWallet();
      toast({
        title: "Carteira conectada",
        description: "Sua carteira Freighter foi conectada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
      toast({
        title: "Erro ao conectar carteira",
        description: "Não foi possível conectar à carteira Freighter. Verifique se a extensão está instalada.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    toast({
      title: "Carteira desconectada",
      description: "Sua carteira foi desconectada com sucesso.",
    });
  };

  const handleRefreshBalance = async () => {
    if (wallet) {
      try {
        const balance = await getBalance();
        toast({
          title: "Saldo atualizado",
          description: `Saldo atual: ${balance.toFixed(2)} XLM`,
        });
      } catch (error) {
        toast({
          title: "Erro ao atualizar saldo",
          description: "Não foi possível atualizar o saldo da carteira.",
          variant: "destructive"
        });
      }
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
            <Tabs 
              defaultValue="personal" 
              className="w-full"
              onValueChange={(value) => {
                console.log('🔄 Mudança de aba:', value);
                setActiveTab(value);
              }}
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal">Informações Básicas</TabsTrigger>
                <TabsTrigger value="extra">Informações Pessoais</TabsTrigger>
                <TabsTrigger value="kyc">Verificação</TabsTrigger>
                <TabsTrigger value="wallet">Carteira</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Informações Básicas
                        </CardTitle>
                        <CardDescription>
                          Dados básicos de identificação e contato
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
                           disabled={!editingExtra}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                           disabled={!editingExtra}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                           disabled={!editingExtra}
                          placeholder="(11) 99999-9999"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="document">CPF/CNPJ</Label>
                        <Input
                          id="document"
                          value={formData.document}
                          onChange={(e) => setFormData(prev => ({ ...prev, document: e.target.value }))}
                           disabled={!editingExtra}
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Personal Information */}
              <TabsContent value="extra" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <FileSearch className="w-5 h-5" />
                          Informações Pessoais
                        </CardTitle>
                        <CardDescription>
                          Dados pessoais detalhados para avaliação de risco em seguros
                        </CardDescription>
                      </div>
                      {!editingExtra ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingExtra(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelExtra}
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
                  <CardContent className="space-y-6">
                    {/* Informações Demográficas */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Informações Demográficas
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Data de Nascimento</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                            disabled={!editingExtra}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Estado Civil</Label>
                          <select
                            id="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value as any }))}
                            disabled={!editingExtra}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="single">Solteiro(a)</option>
                            <option value="married">Casado(a)</option>
                            <option value="divorced">Divorciado(a)</option>
                            <option value="widowed">Viúvo(a)</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dependents">Número de Dependentes</Label>
                          <Input
                            id="dependents"
                            type="number"
                            min="0"
                            value={formData.dependents}
                            onChange={(e) => setFormData(prev => ({ ...prev, dependents: parseInt(e.target.value) || 0 }))}
                            disabled={!editingExtra}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="education">Escolaridade</Label>
                          <select
                            id="education"
                            value={formData.education}
                            onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value as any }))}
                            disabled={!editingExtra}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="elementary">Ensino Fundamental</option>
                            <option value="high_school">Ensino Médio</option>
                            <option value="college">Ensino Superior</option>
                            <option value="graduate">Pós-graduação</option>
                            <option value="postgraduate">Mestrado/Doutorado</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Informações Profissionais e Financeiras */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Informações Profissionais e Financeiras
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Profissão/Ocupação</Label>
                          <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="Ex: Engenheiro, Médico, Vendedor..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthlyIncome">Renda Mensal (R$)</Label>
                          <Input
                            id="monthlyIncome"
                            type="number"
                            value={formData.monthlyIncome}
                            onChange={(e) => setFormData(prev => ({ ...prev, monthlyIncome: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="0"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Endereço */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Endereço
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="address">Endereço Completo</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="Rua, número, complemento..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">Cidade</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            disabled={!editingExtra}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            disabled={!editingExtra}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">CEP</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="00000-000"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Informações de Saúde */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        Informações de Saúde
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={formData.smoker}
                              onChange={(e) => setFormData(prev => ({ ...prev, smoker: e.target.checked }))}
                              disabled={!editingExtra}
                              className="rounded border-input"
                            />
                            Fumante
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preExistingConditions">Condições Pré-existentes</Label>
                          <Input
                            id="preExistingConditions"
                            value={formData.preExistingConditions.join(', ')}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              preExistingConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }))}
                            disabled={!editingExtra}
                            placeholder="Ex: Diabetes, Hipertensão..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Seguros Atuais */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Seguros Atuais
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hasHealthInsurance"
                            checked={formData.hasHealthInsurance}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasHealthInsurance: e.target.checked }))}
                            disabled={!editingExtra}
                            className="rounded border-input"
                          />
                          <Label htmlFor="hasHealthInsurance" className="text-sm">Saúde</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hasLifeInsurance"
                            checked={formData.hasLifeInsurance}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasLifeInsurance: e.target.checked }))}
                            disabled={!editingExtra}
                            className="rounded border-input"
                          />
                          <Label htmlFor="hasLifeInsurance" className="text-sm">Vida</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hasAutoInsurance"
                            checked={formData.hasAutoInsurance}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasAutoInsurance: e.target.checked }))}
                            disabled={!editingExtra}
                            className="rounded border-input"
                          />
                          <Label htmlFor="hasAutoInsurance" className="text-sm">Auto</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="hasHomeInsurance"
                            checked={formData.hasHomeInsurance}
                            onChange={(e) => setFormData(prev => ({ ...prev, hasHomeInsurance: e.target.checked }))}
                            disabled={!editingExtra}
                            className="rounded border-input"
                          />
                          <Label htmlFor="hasHomeInsurance" className="text-sm">Residencial</Label>
                        </div>
                      </div>
                    </div>

                    {/* Hobbies e Atividades */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Hobbies e Atividades
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="hobbies">Hobbies/Atividades (separados por vírgula)</Label>
                        <Input
                          id="hobbies"
                          value={formData.hobbies.join(', ')}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            hobbies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          }))}
                           disabled={!editingExtra}
                          placeholder="Ex: Futebol, Leitura, Viagem, Esportes radicais..."
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
                {/* Freighter Wallet Connection */}
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Wallet className="w-5 h-5" />
                          Carteira Freighter
                        </CardTitle>
                        <CardDescription>
                          Conecte sua carteira Freighter para pagamentos e recebimentos
                        </CardDescription>
                      </div>
                      {wallet && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshWalletData}
                          disabled={refreshingWallet}
                        >
                          <RefreshCw className={`w-4 h-4 mr-2 ${refreshingWallet ? 'animate-spin' : ''}`} />
                          {refreshingWallet ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!wallet ? (
                      <div className="text-center py-8">
                        <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Conectar Carteira Freighter</h3>
                        <p className="text-muted-foreground mb-6">
                          Conecte sua carteira Freighter para fazer pagamentos e receber sinistros
                        </p>
                        <Button 
                          onClick={handleConnectWallet}
                          disabled={isConnecting}
                          size="lg"
                          className="gradient-primary"
                        >
                          <Wallet className="w-5 h-5 mr-2" />
                          {isConnecting ? 'Conectando...' : 'Conectar Carteira'}
                        </Button>
                        
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">Como conectar:</h4>
                          <ol className="text-sm text-muted-foreground space-y-1 text-left">
                            <li>1. Instale a extensão Freighter no seu navegador</li>
                            <li>2. Crie ou importe sua carteira Stellar</li>
                            <li>3. Clique em "Conectar Carteira" acima</li>
                            <li>4. Aprove a conexão na extensão</li>
                          </ol>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Wallet Info */}
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Wallet className="w-5 h-5 text-green-600" />
                              <span className="font-medium text-green-700 dark:text-green-300">
                                Carteira Conectada
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
                              {wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm text-muted-foreground">Endereço da Carteira</Label>
                              <div className="flex items-center gap-2 mt-1">
                                <code className="flex-1 bg-background px-3 py-2 rounded border text-sm font-mono">
                                  {wallet.publicKey}
                                </code>
                                <Button variant="outline" size="sm">
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm text-muted-foreground">Saldo XLM</Label>
                              <div className="mt-1">
                                <span className="text-2xl font-bold text-green-600">
                                  {wallet.balance?.toFixed(2) || '0.00'} XLM
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={handleRefreshBalance}
                            className="flex-1"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Atualizar Saldo
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDisconnectWallet}
                            className="flex-1"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Desconectar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Info Card */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium text-primary mb-1">Sobre a Carteira Freighter</h3>
                          <p className="text-sm text-muted-foreground">
                            A Freighter é uma carteira segura para a rede Stellar. Use-a para fazer pagamentos 
                            de apólices e receber pagamentos de sinistros diretamente na blockchain.
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
