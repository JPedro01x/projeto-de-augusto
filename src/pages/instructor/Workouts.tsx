import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Dumbbell, User, CalendarDays, BarChart2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { WorkoutPlan } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { workoutAPI } from '@/services/api';


export default function InstructorWorkouts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);

  const { user } = useAuth();
  const instructorId = user?.id || '';

  // Buscar treinos do instrutor via API
  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!instructorId) return;
      setIsLoading(true);
      try {
        const data = await workoutAPI.getInstructorWorkouts(instructorId);
        setWorkoutPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar treinos do instrutor:', error);
        setWorkoutPlans([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [instructorId]);

  const handleCreateWorkout = () => {
    toast({
      title: 'Novo Treino',
      description: 'Funcionalidade de criação de treino ainda não implementada.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Treinos</h1>
          <p className="text-muted-foreground">Gerencie os planos de treino cadastrados para seus alunos</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por aluno ou nome do treino..."
            className="pl-10 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {workoutPlans.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum treino encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Você ainda não possui planos de treino cadastrados para seus alunos.
            </p>
            <Button onClick={handleCreateWorkout}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeiro Treino
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workoutPlans
            .filter((workout) => {
              const title = (workout.title || workout.name || '').toLowerCase();
              const studentName = (workout as any).student?.name?.toLowerCase() || '';
              return (
                title.includes(searchTerm.toLowerCase()) ||
                studentName.includes(searchTerm.toLowerCase())
              );
            })
            .map((workout) => (
              <Card key={workout.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{workout.title || workout.name || 'Treino sem nome'}</CardTitle>
                      <CardDescription className="mt-1">
                        {(workout as any).student?.name || 'Aluno não informado'}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-4 w-4" />
                      <span>
                        {new Date(workout.startDate).toLocaleDateString('pt-BR')} -
                        {' '}
                        {workout.endDate
                          ? new Date(workout.endDate).toLocaleDateString('pt-BR')
                          : 'Sem data de término'}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {workout.description && (
                    <p className="text-sm text-muted-foreground mb-3">
                      {workout.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4" />
                      <span>
                        {Array.isArray(workout.exercises)
                          ? `${workout.exercises.length} exercícios`
                          : '0 exercícios'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
