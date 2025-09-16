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
import { LedgerService, LedgerEventUI } from '@/services/ledgerService';
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

// Usar LedgerEventUI em vez de ActivityLog
type ActivityLog = LedgerEventUI;

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

  // Effect to update wallet data when "wallet" tab is opened
  useEffect(() => {
    if (activeTab === 'wallet') {
      console.log('💳 Wallet tab opened - updating data...');
      refreshWalletData();
    }
  }, [activeTab]);

  // Function to update all wallet data
  const refreshWalletData = async () => {
    if (wallet) {
      setRefreshingWallet(true);
      try {
        console.log('🔄 Updating wallet data...');
        
        // Update balance
        await getBalance();
        
        // Check account status
        // Note: The checkAccountActivation and requestTestnetFunds functions 
        // will be called by specific buttons when needed
        
        console.log('✅ Wallet data updated');
        
        toast({
          title: "Data updated",
          description: "Wallet information has been updated successfully.",
        });
      } catch (error) {
        console.error('❌ Error updating wallet data:', error);
        toast({
          title: "Error updating",
          description: "Could not update wallet data.",
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
        // Mocked extra information
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
        // Extra information
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
        title: "Error loading profile",
        description: "Could not load profile data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchActivities = async () => {
    try {
      if (!user?.id) return;
      
      const ledgerEvents = await LedgerService.getUserEvents(user.id);
      setActivities(ledgerEvents);
    } catch (error) {
      console.error('Error loading activities:', error);
      // Em caso de erro, manter array vazio
      setActivities([]);
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
        title: "Profile updated",
        description: "Your information has been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving",
        description: "Could not update the profile.",
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
        // Extra information
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
        // Extra information
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
        title: "Document sent",
        description: "Your document has been sent for verification.",
      });
    } catch (error) {
      toast({
        title: "Upload error",
        description: "Could not send the document.",
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
        title: "Wallet connected",
        description: "Your Freighter wallet has been connected successfully!",
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Error connecting wallet",
        description: "Could not connect to Freighter wallet. Please check if the extension is installed.",
        variant: "destructive"
      });
    }
  };

  const handleDisconnectWallet = () => {
    disconnectWallet();
    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully.",
    });
  };

  const handleRefreshBalance = async () => {
    if (wallet) {
      try {
        const balance = await getBalance();
        toast({
          title: "Balance updated",
          description: `Current balance: ${balance.toFixed(2)} XLM`,
        });
      } catch (error) {
        toast({
          title: "Error updating balance",
          description: "Could not update wallet balance.",
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
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-warning text-warning-foreground">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-destructive text-destructive-foreground">
            <AlertCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'PolicyActivated':
        return <Shield className="w-4 h-4 text-success" />;
      case 'PolicyPaused':
        return <Shield className="w-4 h-4 text-warning" />;
      case 'PolicyExpired':
        return <Shield className="w-4 h-4 text-destructive" />;
      case 'WEBHOOK_PAYMENT_CONFIRMED':
        return <Wallet className="w-4 h-4 text-secondary" />;
      case 'CHARGE_STARTED':
        return <Wallet className="w-4 h-4 text-primary" />;
      case 'UserLogin':
        return <User className="w-4 h-4 text-primary" />;
      case 'ProfileUpdated':
        return <Settings className="w-4 h-4 text-muted-foreground" />;
      case 'KycDocumentUploaded':
        return <FileText className="w-4 h-4 text-warning" />;
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
          <h1 className="text-3xl font-bold mb-2">My Profile</h1>
          <p className="text-muted-foreground">
            Manage your personal information and settings
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
                <TabsTrigger value="personal">Basic Information</TabsTrigger>
                <TabsTrigger value="extra">Personal Information</TabsTrigger>
                <TabsTrigger value="kyc">Verification</TabsTrigger>
                <TabsTrigger value="wallet">Wallet</TabsTrigger>
              </TabsList>

              {/* Basic Information */}
              <TabsContent value="personal" className="space-y-6">
                <Card className="glass-card border-border/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5" />
                          Basic Information
                        </CardTitle>
                        <CardDescription>
                          Basic identification and contact data
                        </CardDescription>
                      </div>
                      {!editing ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditing(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancel}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
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
                        <Label htmlFor="phone">Phone</Label>
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
                          Personal Information
                        </CardTitle>
                        <CardDescription>
                          Detailed personal data for insurance risk assessment
                        </CardDescription>
                      </div>
                      {!editingExtra ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingExtra(true)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCancelExtra}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSave}
                            disabled={saving}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {saving ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Demographic Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-primary" />
                        Demographic Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="birthDate">Birth Date</Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                            disabled={!editingExtra}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="maritalStatus">Marital Status</Label>
                          <select
                            id="maritalStatus"
                            value={formData.maritalStatus}
                            onChange={(e) => setFormData(prev => ({ ...prev, maritalStatus: e.target.value as any }))}
                            disabled={!editingExtra}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="single">Single</option>
                            <option value="married">Married</option>
                            <option value="divorced">Divorced</option>
                            <option value="widowed">Widowed</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dependents">Number of Dependents</Label>
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
                          <Label htmlFor="education">Education</Label>
                          <select
                            id="education"
                            value={formData.education}
                            onChange={(e) => setFormData(prev => ({ ...prev, education: e.target.value as any }))}
                            disabled={!editingExtra}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="elementary">Elementary School</option>
                            <option value="high_school">High School</option>
                            <option value="college">College</option>
                            <option value="graduate">Graduate</option>
                            <option value="postgraduate">Master's/PhD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Professional and Financial Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        Professional and Financial Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="occupation">Profession/Occupation</Label>
                          <Input
                            id="occupation"
                            value={formData.occupation}
                            onChange={(e) => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="Ex: Engineer, Doctor, Salesperson..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="monthlyIncome">Monthly Income (R$)</Label>
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

                    {/* Address */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Address
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <Label htmlFor="address">Full Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                            disabled={!editingExtra}
                            placeholder="Street, number, complement..."
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                            disabled={!editingExtra}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.state}
                            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                            disabled={!editingExtra}
                            maxLength={2}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code</Label>
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

                    {/* Health Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Heart className="w-5 h-5 text-primary" />
                        Health Information
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
                            Smoker
                          </Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="preExistingConditions">Pre-existing Conditions</Label>
                          <Input
                            id="preExistingConditions"
                            value={formData.preExistingConditions.join(', ')}
                            onChange={(e) => setFormData(prev => ({ 
                              ...prev, 
                              preExistingConditions: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                            }))}
                            disabled={!editingExtra}
                            placeholder="Ex: Diabetes, Hypertension..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Current Insurance */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary" />
                        Current Insurance
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
                          <Label htmlFor="hasHealthInsurance" className="text-sm">Health</Label>
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
                          <Label htmlFor="hasLifeInsurance" className="text-sm">Life</Label>
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
                          <Label htmlFor="hasHomeInsurance" className="text-sm">Home</Label>
                        </div>
                      </div>
                    </div>

                    {/* Hobbies and Activities */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Hobbies and Activities
                      </h3>
                      <div className="space-y-2">
                        <Label htmlFor="hobbies">Hobbies/Activities (separated by comma)</Label>
                        <Input
                          id="hobbies"
                          value={formData.hobbies.join(', ')}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            hobbies: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                          }))}
                           disabled={!editingExtra}
                          placeholder="Ex: Football, Reading, Travel, Extreme sports..."
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
                      Identity Verification (KYC)
                    </CardTitle>
                    <CardDescription>
                      Submit your documents for identity verification
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* KYC Status */}
                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-primary" />
                        <div>
                          <p className="font-medium">Verification Status</p>
                          <p className="text-sm text-muted-foreground">
                            {profile.kycStatus === 'verified' && 'Your identity has been successfully verified'}
                            {profile.kycStatus === 'pending' && 'Waiting for document analysis'}
                            {profile.kycStatus === 'rejected' && 'Documents rejected - please resubmit'}
                          </p>
                        </div>
                      </div>
                      {getKycStatusBadge(profile.kycStatus)}
                    </div>

                    {/* Document Upload */}
                    <div className="space-y-4">
                      <Label>Identity Document</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Upload a photo of your ID, Driver's License or Passport
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
                            {uploading ? 'Uploading...' : 'Select File'}
                          </label>
                        </Button>
                      </div>
                    </div>

                    {/* Document Preview */}
                    {profile.kycDocumentUrl && (
                      <div className="space-y-2">
                        <Label>Submitted Document</Label>
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="flex-1 text-sm">identity_document.pdf</span>
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
                          Freighter Wallet
                        </CardTitle>
                        <CardDescription>
                          Connect your Freighter wallet for payments and receipts
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
                          {refreshingWallet ? 'Updating...' : 'Update'}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {!wallet ? (
                      <div className="text-center py-8">
                        <Wallet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Connect Freighter Wallet</h3>
                        <p className="text-muted-foreground mb-6">
                          Connect your Freighter wallet to make payments and receive claims
                        </p>
                        <Button 
                          onClick={handleConnectWallet}
                          disabled={isConnecting}
                          size="lg"
                          className="gradient-primary"
                        >
                          <Wallet className="w-5 h-5 mr-2" />
                          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                        </Button>
                        
                        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                          <h4 className="font-medium mb-2">How to connect:</h4>
                          <ol className="text-sm text-muted-foreground space-y-1 text-left">
                            <li>1. Install the Freighter extension in your browser</li>
                            <li>2. Create or import your Stellar wallet</li>
                            <li>3. Click "Connect Wallet" above</li>
                            <li>4. Approve the connection in the extension</li>
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
                                Wallet Connected
                              </span>
                            </div>
                            <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300">
                              {wallet.network === 'testnet' ? 'Testnet' : 'Mainnet'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <Label className="text-sm text-muted-foreground">Wallet Address</Label>
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
                            Update Balance
                          </Button>
                          <Button 
                            variant="destructive" 
                            onClick={handleDisconnectWallet}
                            className="flex-1"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Info Card */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Wallet className="w-5 h-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-medium text-primary mb-1">About Freighter Wallet</h3>
                          <p className="text-sm text-muted-foreground">
                            Freighter is a secure wallet for the Stellar network. Use it to make policy 
                            payments and receive claim payments directly on the blockchain.
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
                <CardTitle>Profile Summary</CardTitle>
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
                    <span className="text-muted-foreground">Member since</span>
                    <span>{profile.createdAt.toLocaleDateString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">KYC Status</span>
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
                    Recent Activities
                  </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {activities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      {activity.amount > 0 && (
                        <p className="text-xs text-muted-foreground">
                          R$ {activity.amount.toFixed(2)}
                        </p>
                      )}
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
