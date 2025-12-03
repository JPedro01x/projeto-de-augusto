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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Dumbbell, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
}

interface Workout {
  id: string;
  name: string;
  studentName: string;
  instructor: string;
  category: string;
  exercises: Exercise[];
  createdAt: string;
}

const Workouts = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      id: '1',
      name: 'Treino A - Peito e Tríceps',
      studentName: 'João Silva',
      instructor: 'Carlos Silva',
      category: 'Hipertrofia',
      exercises: [
        { name: 'Supino Reto', sets: '4', reps: '12', rest: '60s' },
        { name: 'Supino Inclinado', sets: '3', reps: '12', rest: '60s' },
        { name: 'Crucifixo', sets: '3', reps: '15', rest: '45s' },
        { name: 'Tríceps Testa', sets: '3', reps: '12', rest: '60s' },
      ],
      createdAt: '2024-01-15',
    },
    {
      id: '2',
      name: 'Treino B - Costas e Bíceps',
      studentName: 'Maria Santos',
      instructor: 'Carlos Silva',
      category: 'Hipertrofia',
      exercises: [
        { name: 'Puxada Frontal', sets: '4', reps: '12', rest: '60s' },
        { name: 'Remada Curvada', sets: '4', reps: '10', rest: '90s' },
        { name: 'Rosca Direta', sets: '3', reps: '12', rest: '60s' },
      ],
      createdAt: '2024-02-01',
    },
    {
      id: '3',
      name: 'Treino Full Body',
      studentName: 'Pedro Costa',
      instructor: 'Maria Santos',
      category: 'Funcional',
      exercises: [
        { name: 'Agachamento', sets: '4', reps: '15', rest: '90s' },
        { name: 'Flexão', sets: '3', reps: '15', rest: '60s' },
        { name: 'Burpee', sets: '3', reps: '10', rest: '60s' },
      ],
      createdAt: '2024-02-10',
    },
  ]);

  const [formData, setFormData] = useState({
    name: '',
    studentName: '',
    instructor: '',
    category: '',
    exercises: [] as Exercise[],
  });

  const filteredWorkouts = workouts.filter(workout =>
    workout.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    workout.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = ['Hipertrofia', 'Emagrecimento', 'Funcional', 'Condicionamento', 'Força'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Treinos</h1>
          <p className="text-muted-foreground mt-1">Gerencie os treinos dos alunos</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Novo Treino
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Novo Treino</DialogTitle>
              <DialogDescription>
                Monte um treino personalizado para o aluno
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome do Treino *</Label>
                  <Input placeholder="Ex: Treino A - Peito" />
                </div>

                <div className="space-y-2">
                  <Label>Aluno *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="joao">João Silva</SelectItem>
                      <SelectItem value="maria">Maria Santos</SelectItem>
                      <SelectItem value="pedro">Pedro Costa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Instrutor *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o instrutor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="carlos">Carlos Silva</SelectItem>
                      <SelectItem value="maria-inst">Maria Santos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea placeholder="Instruções especiais para o treino..." />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="gradient" className="flex-1">
                  Criar Treino
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Treinos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{workouts.length}</div>
          </CardContent>
        </Card>
        
        {categories.slice(0, 3).map((cat) => (
          <Card key={cat} className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{cat}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {workouts.filter(w => w.category === cat).length}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, aluno ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Workouts List */}
      <div className="grid gap-4">
        {filteredWorkouts.map((workout) => (
          <Card key={workout.id} className="border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center">
                    <Dumbbell className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg">{workout.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Aluno: {workout.studentName} • Instrutor: {workout.instructor}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium">
                        {workout.category}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                        {workout.exercises.length} exercícios
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedWorkout(workout)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setWorkouts(workouts.filter(w => w.id !== workout.id));
                      toast({
                        title: 'Treino removido',
                        description: 'O treino foi removido do sistema.',
                      });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workout Details Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedWorkout?.name}</DialogTitle>
            <DialogDescription>
              Aluno: {selectedWorkout?.studentName} • Instrutor: {selectedWorkout?.instructor}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              {selectedWorkout?.exercises.map((exercise, index) => (
                <Card key={index} className="border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{exercise.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          {exercise.sets} séries • {exercise.reps} repetições • {exercise.rest} descanso
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {filteredWorkouts.length === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum treino encontrado</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Workouts;
