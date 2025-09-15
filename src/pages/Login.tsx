import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Mail, Phone, Upload, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [cpf, setCpf] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [kycStep, setKycStep] = useState<'form' | 'documents' | 'complete'>('form');

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo ao Stellar Insurance!",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erro no login",
        description: "Verifique suas credenciais e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      // Send OTP
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      setLoading(false);
      toast({
        title: "Código enviado!",
        description: "Verifique seu WhatsApp para o código de verificação.",
      });
    } else {
      // Verify OTP
      setLoading(true);
      try {
        await login(phone + '@mock.com', otp);
        navigate('/');
      } catch (error) {
        toast({
          title: "Código inválido",
          description: "Verifique o código e tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleKycSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (kycStep === 'form') {
      setKycStep('documents');
    } else if (kycStep === 'documents') {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      setKycStep('complete');
      setLoading(false);
      toast({
        title: "KYC enviado com sucesso",
        description: "Seus documentos estão sendo analisados. Você será notificado em breve.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-md p-6">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gradient-primary">Stellar Insurance</h1>
          <p className="text-muted-foreground mt-2">Entre ou cadastre-se para continuar</p>
        </div>

        <Tabs defaultValue="email" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="email">E-mail</TabsTrigger>
            <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          </TabsList>

          {/* Email Login */}
          <TabsContent value="email">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Login com E-mail
                </CardTitle>
                <CardDescription>
                  Use seu e-mail e senha para acessar sua conta
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleEmailLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          {/* WhatsApp OTP */}
          <TabsContent value="whatsapp">
            <Card className="glass-card border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Login via WhatsApp
                </CardTitle>
                <CardDescription>
                  Receba um código de verificação no seu WhatsApp
                </CardDescription>
              </CardHeader>
              <form onSubmit={handlePhoneOtp}>
                <CardContent className="space-y-4">
                  {!otpSent ? (
                    <div className="space-y-2">
                      <Label htmlFor="phone">WhatsApp</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(11) 99999-9999"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="otp">Código de Verificação</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        Código enviado para {phone}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                    {loading ? "Enviando..." : otpSent ? "Verificar Código" : "Enviar Código"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* KYC Section */}
        <Card className="glass-card border-border/50 mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Verificação KYC
              {kycStep === 'complete' && <CheckCircle className="w-5 h-5 text-success" />}
            </CardTitle>
            <CardDescription>
              Complete sua verificação para ativar seguros
            </CardDescription>
          </CardHeader>
          
          {kycStep === 'form' && (
            <form onSubmit={handleKycSubmit}>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="outline" className="w-full">
                  Próximo: Documentos
                </Button>
              </CardFooter>
            </form>
          )}

          {kycStep === 'documents' && (
            <form onSubmit={handleKycSubmit}>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Envie uma selfie segurando seu documento
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" variant="outline" className="w-full" disabled={loading}>
                  {loading ? "Enviando..." : "Enviar Documentos"}
                </Button>
              </CardFooter>
            </form>
          )}

          {kycStep === 'complete' && (
            <CardContent>
              <div className="text-center py-4">
                <CheckCircle className="w-12 h-12 text-success mx-auto mb-2" />
                <p className="font-medium text-success">KYC Enviado com Sucesso</p>
                <p className="text-sm text-muted-foreground">
                  Seus documentos estão sendo analisados
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;