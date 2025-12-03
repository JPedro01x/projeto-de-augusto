import { useState } from 'react';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Students = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { students = [], createStudent, updateStudent, deleteStudent, isLoading } = useStudents();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpf: '',
    phone: '',
    birthDate: '',
    planType: 'basic' as const,
    emergencyContact: ''
  });

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cpf.includes(searchTerm)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newStudent = {
      ...formData,
      status: 'active' as const,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      paymentStatus: 'pending' as const,
    };

    await createStudent.mutateAsync(newStudent);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      cpf: '',
      phone: '',
      birthDate: '',
      planType: 'basic',
      emergencyContact: ''
    });

    toast({
      title: 'Aluno cadastrado!',
      description: `${formData.name} foi adicionado com sucesso.`,
    });
  };

  const handleDelete = async (id: string) => {
    await deleteStudent.mutateAsync(id);
    toast({
      title: 'Aluno removido',
      description: 'O aluno foi removido do sistema.',
    });
  };

  const toggleStatus = async (id: string) => {
    const student = students?.find(s => s.id === id);
    if (student) {
      await updateStudent.mutateAsync({
        id,
        data: { status: student.status === 'active' ? 'inactive' : 'active' }
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Alunos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os alunos da academia</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Aluno
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Aluno</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo aluno
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="birthDate">Data de Nascimento *</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Contato de Emergência *</Label>
                  <Input
                    id="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="planType">Plano *</Label>
                  <Select
                    value={formData.planType}
                    onValueChange={(value) => setFormData({ ...formData, planType: value as Student['planType'] })}
                  >
                    <SelectTrigger id="planType">
                      <SelectValue placeholder="Selecione o plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básico - R$ 99,90</SelectItem>
                      <SelectItem value="premium">Premium - R$ 279,90</SelectItem>
                      <SelectItem value="vip">VIP - R$ 999,90</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="gradient" className="flex-1">
                  Cadastrar Aluno
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid gap-4">
        {isLoading ? (
          <Card className="border-primary/20">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Carregando...</p>
            </CardContent>
          </Card>
        ) : filteredStudents.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum aluno encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => (
            <Card key={student.id} className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
                      {student.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">{student.name}</h3>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span>{student.email}</span>
                        <span>{student.phone}</span>
                        <span>CPF: {student.cpf}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium capitalize">
                          {student.planType}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                            student.status === 'active'
                              ? 'bg-green-500/20 text-green-500'
                              : 'bg-red-500/20 text-red-500'
                          }`}
                        >
                          {student.status === 'active' ? (
                            <CheckCircle className="h-3 w-3" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleStatus(student.id)}
                      title={student.status === 'active' ? 'Desativar' : 'Ativar'}
                      disabled={updateStudent.isPending}
                    >
                      {student.status === 'active' ? (
                        <XCircle className="h-4 w-4" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button variant="outline" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(student.id)}
                      disabled={deleteStudent.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Students;