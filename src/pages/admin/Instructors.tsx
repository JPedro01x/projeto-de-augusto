import { useState } from 'react';
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
import { Plus, Search, Edit, Trash2, Award, Clock } from 'lucide-react';
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
}

const Instructors = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [instructors, setInstructors] = useState<Instructor[]>([
    {
      id: '1',
      name: 'Carlos Silva',
      email: 'carlos@gymtech.com',
      phone: '(11) 98765-4321',
      specialty: 'Musculação e Hipertrofia',
      certifications: 'CREF 123456, Personal Trainer',
      schedule: 'Seg a Sex: 06:00 - 12:00',
      activeStudents: 45,
    },
    {
      id: '2',
      name: 'Maria Santos',
      email: 'maria@gymtech.com',
      phone: '(11) 91234-5678',
      specialty: 'Crossfit e Condicionamento',
      certifications: 'CREF 789012, CrossFit Level 2',
      schedule: 'Seg a Sex: 14:00 - 20:00',
      activeStudents: 38,
    },
    {
      id: '3',
      name: 'Roberto Lima',
      email: 'roberto@gymtech.com',
      phone: '(11) 99876-5432',
      specialty: 'Treinamento Funcional',
      certifications: 'CREF 345678, TRX Certification',
      schedule: 'Ter e Qui: 18:00 - 22:00',
      activeStudents: 28,
    },
  ]);

  const [formData, setFormData] = useState({
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newInstructor: Instructor = {
      id: Date.now().toString(),
      ...formData,
      activeStudents: 0,
    };

    setInstructors([...instructors, newInstructor]);
    setIsDialogOpen(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialty: '',
      certifications: '',
      schedule: '',
    });

    toast({
      title: 'Instrutor cadastrado!',
      description: `${formData.name} foi adicionado com sucesso.`,
    });
  };

  const handleDelete = (id: string) => {
    setInstructors(instructors.filter(i => i.id !== id));
    toast({
      title: 'Instrutor removido',
      description: 'O instrutor foi removido do sistema.',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Instrutores</h1>
          <p className="text-muted-foreground mt-1">Gerencie a equipe de instrutores</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Instrutor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Instrutor</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo instrutor
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
                  <Label htmlFor="specialty">Especialidade *</Label>
                  <Input
                    id="specialty"
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Ex: Musculação"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="certifications">Certificações *</Label>
                  <Input
                    id="certifications"
                    value={formData.certifications}
                    onChange={(e) => setFormData({ ...formData, certifications: e.target.value })}
                    placeholder="Ex: CREF 123456, Personal Trainer"
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="schedule">Horários Disponíveis *</Label>
                  <Textarea
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    placeholder="Ex: Seg a Sex: 06:00 - 12:00"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" variant="gradient" className="flex-1">
                  Cadastrar Instrutor
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
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
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
