import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Save, 
  X, 
  Edit, 
  Trash2, 
  Shield, 
  ArrowLeft,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';

interface ProductFormData {
  id?: string;
  code: string;
  name: string;
  description: string;
  price: number;
  coverage_amount: number;
  coverage_type: string;
  coverage_duration: number;
  is_active: boolean;
  features: string[];
  recommended: boolean;
  popular: boolean;
  trending: boolean;
  new: boolean;
}

const AdminProduct: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<ProductFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>({
    code: '',
    name: '',
    description: '',
    price: 0,
    coverage_amount: 0,
    coverage_type: '',
    coverage_duration: 1,
    is_active: true,
    features: [],
    recommended: false,
    popular: false,
    trending: false,
    new: false,
  });
  const [newFeature, setNewFeature] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const categories = [
    { value: 'acidentes', label: 'Acidentes' },
    { value: 'saude', label: 'Saúde' },
    { value: 'viagem', label: 'Viagem' },
    { value: 'trabalho', label: 'Trabalho' },
    { value: 'esporte', label: 'Esporte' },
    { value: 'residencial', label: 'Residencial' },
    { value: 'transporte', label: 'Transporte' },
    { value: 'corporativo', label: 'Corporativo' },
    { value: 'pet', label: 'Pet' },
    { value: 'digital', label: 'Digital' },
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.products.getAllForAdmin();
      setProducts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar a lista de produtos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code || !formData.name || !formData.coverage_type) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const productData = {
        ...formData,
        price: Math.round(formData.price * 100), // converter para centavos
      };

      if (editingProduct) {
        await api.products.update(editingProduct.id!, productData);
        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso!",
        });
      } else {
        await api.products.create(productData);
        toast({
          title: "Sucesso",
          description: "Produto criado com sucesso!",
        });
      }
      
      resetForm();
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      id: product.id,
      code: product.code,
      name: product.name,
      description: product.description || '',
      price: product.price / 100, // converter de centavos para reais
      coverage_amount: product.coverage_amount,
      coverage_type: product.coverage_type,
      coverage_duration: product.coverage_duration,
      is_active: product.is_active,
      features: product.features || [],
      recommended: product.recommended || false,
      popular: product.popular || false,
      trending: product.trending || false,
      new: product.new || false,
    });
    setIsCreating(true);
  };

  const handleDelete = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }

    try {
      setLoading(true);
      await api.products.delete(productId);
      toast({
        title: "Sucesso",
        description: "Produto excluído com sucesso!",
      });
      fetchProducts();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir o produto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      price: 0,
      coverage_amount: 0,
      coverage_type: '',
      coverage_duration: 1,
      is_active: true,
      features: [],
      recommended: false,
      popular: false,
      trending: false,
      new: false,
    });
    setEditingProduct(null);
    setIsCreating(false);
    setNewFeature('');
  };

  const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case 'acidentes':
        return <Shield className="w-4 h-4" />;
      case 'saude':
        return <Shield className="w-4 h-4" />;
      case 'viagem':
        return <Shield className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <Layout requireAuth>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/products')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Administração de Produtos</h1>
              <p className="text-muted-foreground">
                Gerencie os produtos de seguro disponíveis
              </p>
            </div>
          </div>
          <Button
            onClick={() => setIsCreating(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Produto
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Existentes</CardTitle>
                <CardDescription>
                  {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded animate-pulse"></div>
                    ))}
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nenhum produto cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(product.coverage_type)}
                            <Badge variant="outline">
                              {product.coverage_type}
                            </Badge>
                          </div>
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              R$ {(product.price / 100).toFixed(2)} • {product.coverage_amount.toLocaleString('pt-BR')} de cobertura
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={product.is_active ? "default" : "secondary"}>
                            {product.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          {isCreating && (
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </CardTitle>
                  <CardDescription>
                    {editingProduct ? 'Atualize as informações do produto' : 'Preencha os dados do novo produto'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Código */}
                    <div className="space-y-2">
                      <Label htmlFor="code">Código *</Label>
                      <Input
                        id="code"
                        value={formData.code}
                        onChange={(e) => handleInputChange('code', e.target.value)}
                        placeholder="Ex: ACCIDENT_48H"
                        required
                      />
                    </div>

                    {/* Nome */}
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Nome do produto"
                        required
                      />
                    </div>

                    {/* Descrição */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Descrição</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Descrição do produto"
                        rows={3}
                      />
                    </div>

                    {/* Categoria */}
                    <div className="space-y-2">
                      <Label htmlFor="coverage_type">Categoria *</Label>
                      <Select
                        value={formData.coverage_type}
                        onValueChange={(value) => handleInputChange('coverage_type', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Preço */}
                    <div className="space-y-2">
                      <Label htmlFor="price">Preço (R$) *</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.price}
                        onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    {/* Valor da Cobertura */}
                    <div className="space-y-2">
                      <Label htmlFor="coverage_amount">Valor da Cobertura (R$) *</Label>
                      <Input
                        id="coverage_amount"
                        type="number"
                        min="0"
                        value={formData.coverage_amount}
                        onChange={(e) => handleInputChange('coverage_amount', parseInt(e.target.value) || 0)}
                        placeholder="10000"
                        required
                      />
                    </div>

                    {/* Duração */}
                    <div className="space-y-2">
                      <Label htmlFor="coverage_duration">Duração (dias) *</Label>
                      <Input
                        id="coverage_duration"
                        type="number"
                        min="1"
                        value={formData.coverage_duration}
                        onChange={(e) => handleInputChange('coverage_duration', parseInt(e.target.value) || 1)}
                        placeholder="30"
                        required
                      />
                    </div>

                    {/* Features */}
                    <div className="space-y-2">
                      <Label>Características</Label>
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <span className="flex-1 text-sm">{feature}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeFeature(index)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                        <div className="flex gap-2">
                          <Input
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            placeholder="Nova característica"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                          />
                          <Button type="button" onClick={addFeature} size="sm">
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Flags */}
                    <div className="space-y-4">
                      <Label>Configurações</Label>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="is_active" className="text-sm">Ativo</Label>
                          <Switch
                            id="is_active"
                            checked={formData.is_active}
                            onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="recommended" className="text-sm">Recomendado</Label>
                          <Switch
                            id="recommended"
                            checked={formData.recommended}
                            onCheckedChange={(checked) => handleInputChange('recommended', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="popular" className="text-sm">Popular</Label>
                          <Switch
                            id="popular"
                            checked={formData.popular}
                            onCheckedChange={(checked) => handleInputChange('popular', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="trending" className="text-sm">Em Alta</Label>
                          <Switch
                            id="trending"
                            checked={formData.trending}
                            onCheckedChange={(checked) => handleInputChange('trending', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="new" className="text-sm">Novo</Label>
                          <Switch
                            id="new"
                            checked={formData.new}
                            onCheckedChange={(checked) => handleInputChange('new', checked)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-2 pt-4">
                      <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        ) : (
                          <Save className="w-4 h-4 mr-2" />
                        )}
                        {editingProduct ? 'Atualizar' : 'Criar'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetForm}
                        disabled={loading}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminProduct;
