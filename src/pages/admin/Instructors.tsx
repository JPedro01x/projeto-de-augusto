import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Award, Clock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Instructor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  certifications: string;
  schedule: string;
  activeStudents: number;
  password?: string; // Senha opcional para edição
}

const Instructors = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [instructors, setInstructors] = useState<Instructor[]>([]);

  // Carregar instrutores da API
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/instructors', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) {
          throw new Error('Erro ao carregar instrutores');
        }
        
        const data = await response.json();
        
        // Mapeia os dados da API para o formato esperado pelo componente
        const formattedInstructors = data.map((instructor: any) => ({
          id: instructor.id.toString(),
          name: instructor.name,
          email: instructor.email,
          phone: instructor.phone || '',
          specialty: instructor.specialty || '',
          certifications: instructor.certifications || '',
          schedule: instructor.schedule || 'Seg a Sex: 08:00 - 18:00',
          activeStudents: 0, // Será calculado posteriormente
          cpf: instructor.cpf || ''
        }));
        
        setInstructors(formattedInstructors);
      } catch (error) {
        console.error('Erro ao carregar instrutores:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de instrutores',
          variant: 'destructive',
        });
      }
    };
    
    fetchInstructors();
  }, []);

  const [formData, setFormData] = useState<Omit<Instructor, 'id' | 'activeStudents'> & {
    cpf?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({
    name: '',
    email: '',
    phone: '',
    specialty: '',
    certifications: '',
    schedule: '',
  });

  const filteredInstructors = instructors.filter(instructor =>
    instructor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    instructor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Função para abrir o diálogo de edição
  const handleEditClick = (instructor: Instructor) => {
    setEditingInstructor(instructor);
    setFormData({
      name: instructor.name,
      email: instructor.email,
      phone: instructor.phone,
      specialty: instructor.specialty,
      certifications: instructor.certifications,
      schedule: instructor.schedule,
    });
    setIsEditDialogOpen(true);
  };

  // Função para atualizar um instrutor
  const handleUpdateInstructor = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingInstructor) return;

    // Verifica se as senhas coincidem
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem!',
        variant: 'destructive',
      });
      return;
    }

    const updatedInstructor = {
      ...formData,
      // Se uma nova senha foi fornecida, usa ela, senão mantém a senha atual
      ...(formData.newPassword && { password: formData.newPassword })
    };

    const updatedInstructors = instructors.map(instructor => 
      instructor.id === editingInstructor.id 
        ? { 
            ...instructor, 
            ...updatedInstructor,
            // Mantém o número de alunos ativos
            activeStudents: editingInstructor.activeStudents 
          }
        : instructor
    );

    setInstructors(updatedInstructors);
    setIsEditDialogOpen(false);
    setEditingInstructor(null);
    resetForm();

    toast({
      title: 'Sucesso!',
      description: 'Instrutor atualizado com sucesso!',
      variant: 'default',
    });
  };

  // Função para resetar o formulário
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      certifications: '',
      schedule: '',
      password: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validação básica
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        toast({
          title: 'Erro',
          description: 'Todos os campos são obrigatórios',
          variant: 'destructive',
        });
        return;
      }
      
      // Validação de senha
      if (formData.password.length < 6) {
        toast({
          title: 'Erro',
          description: 'A senha deve ter pelo menos 6 caracteres',
          variant: 'destructive',
        });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Erro',
          description: 'As senhas não coincidem',
          variant: 'destructive',
        });
        return;
      }


      const response = await fetch('http://localhost:3000/api/instructors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || sessionStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          cpf: formData.cpf || `000.000.000-${Math.floor(Math.random() * 100)}`, // CPF temporário se não fornecido
          specialty: formData.specialty,
          certifications: formData.certifications,
          schedule: formData.schedule,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao cadastrar instrutor');
      }

      const newInstructor = await response.json();
      
      // Atualiza a lista de instrutores
      setInstructors([...instructors, {
        id: newInstructor.id.toString(),
        name: newInstructor.name,
        email: newInstructor.email,
        phone: newInstructor.phone || '',
        specialty: newInstructor.instructor?.specialty || '',
        certifications: newInstructor.instructor?.certifications || '',
        schedule: newInstructor.instructor?.schedule || 'Seg a Sex: 08:00 - 18:00',
        activeStudents: 0,
      }]);
      
      setIsDialogOpen(false);
      resetForm();

      toast({
        title: 'Instrutor cadastrado!',
        description: `${newInstructor.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao cadastrar instrutor:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao cadastrar instrutor',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = (id: string) => {
    setInstructors(instructors.filter(instructor => instructor.id !== id));
    toast({
      title: 'Instrutor removido',
      description: 'O instrutor foi removido com sucesso.',
    });
  };

  // Fechar o diálogo de edição quando o diálogo de adição for aberto e vice-versa
  useEffect(() => {
    if (isDialogOpen) {
      setIsEditDialogOpen(false);
      resetForm();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (isEditDialogOpen) {
      setIsDialogOpen(false);
    }
  }, [isEditDialogOpen]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Instrutores</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe de instrutores</p>
        </div>

        {/* Diálogo para adicionar novo instrutor */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Instrutor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Instrutor</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo instrutor. Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="certifications">Certificações</Label>
                  <Textarea
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    rows={3}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Horário de Atendimento</Label>
                  <Input
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="Ex: Seg a Sex: 09:00 - 18:00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Digite uma senha forte"
                      required
                      minLength={6}
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      </span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    A senha deve ter pelo menos 6 caracteres
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    Confirmar Senha <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword || ''}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirme a senha"
                      required
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Instrutor</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Diálogo para editar instrutor */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Instrutor</DialogTitle>
              <DialogDescription>
                Atualize os dados do instrutor. Clique em salvar quando terminar.
              </DialogDescription>
            </DialogHeader>
            {editingInstructor && (
              <form onSubmit={handleUpdateInstructor} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-name">Nome Completo</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-email">E-mail</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-password">Nova Senha</Label>
                    <div className="relative">
                      <Input
                        id="edit-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword || ''}
                        onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                        placeholder="Deixe em branco para manter a senha atual"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="sr-only">
                          {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        </span>
                      </Button>
                    </div>
                  </div>
                  
                  {formData.newPassword && (
                    <div className="space-y-2">
                      <Label htmlFor="edit-confirm-password">Confirmar Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="edit-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirmPassword || ''}
                          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                          placeholder="Confirme a nova senha"
                          className="pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword ? 'Ocultar senha' : 'Mostrar senha'}
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-phone">Telefone</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="edit-cpf">CPF <span className="text-red-500">*</span></Label>
                    <Input
                      id="edit-cpf"
                      value={formData.cpf || ''}
                      onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-specialty">Especialidade</Label>
                    <Input
                      id="edit-specialty"
                      value={formData.specialty}
                      onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-certifications">Certificações</Label>
                    <Textarea
                      id="edit-certifications"
                      value={formData.certifications}
                      onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="edit-schedule">Horário de Atendimento</Label>
                    <Input
                      id="edit-schedule"
                      value={formData.schedule}
                      onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Instructors Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filteredInstructors.map((instructor) => (
          <Card key={instructor.id} className="border-primary/20 hover:border-primary/40 transition-all hover:scale-[1.02]">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
                    {instructor.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{instructor.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Award className="h-3 w-3" />
                      {instructor.specialty}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">Email:</span>
                  <span>{instructor.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-medium">Telefone:</span>
                  <span>{instructor.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{instructor.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Award className="h-4 w-4" />
                  <span>{instructor.certifications}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Alunos Ativos</span>
                  <span className="text-2xl font-bold text-primary">{instructor.activeStudents}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleEditClick(instructor)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(instructor.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInstructors.length === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum instrutor encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Instructors;
