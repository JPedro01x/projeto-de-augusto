import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Dumbbell, Clock, ListChecks } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Exercise {
  nome: string;
  series: number;
  repeticoes: string;
  descanso: string;
}

interface Workout {
  id: number;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  exercises: Exercise[];
  instructor: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function StudentWorkouts() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchWorkouts = async () => {
      if (!user) return;
      
      try {
        // Obter o token do localStorage ou sessionStorage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          throw new Error('Nenhum token de autenticação encontrado');
        }

        console.log('Token encontrado:', token);
        
        const response = await fetch(`http://localhost:3000/api/students/${user.id}/workouts`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include' // Importante para enviar cookies se estiver usando
        });

        console.log('Resposta da API:', response.status, response.statusText);
        
        if (response.status === 401) {
          // Token inválido ou expirado
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setError('Sessão expirada. Por favor, faça login novamente.');
          setLoading(false);
          return;
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Erro ao carregar treinos');
        }

        const data = await response.json();
        console.log('Dados dos treinos recebidos:', data);
        setWorkouts(data);
      } catch (err) {
        console.error('Erro ao buscar treinos:', err);
        setError(err instanceof Error ? err.message : 'Não foi possível carregar os treinos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkouts();
  }, [user]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          className="mt-4"
          variant="outline"
        >
          Tentar novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Meus Treinos</h1>
          <p className="text-muted-foreground">Rotinas e treinos atribuídos</p>
        </div>

        {workouts.length === 0 ? (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Nenhum treino encontrado</CardTitle>
              <CardDescription>Você ainda não possui treinos atribuídos.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Entre em contato com seu instrutor para obter um treino personalizado.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card key={workout.id} className="border-primary/20 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{workout.title}</CardTitle>
                      <CardDescription className="mt-1">
                        Por {workout.instructor.name}
                      </CardDescription>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      workout.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : workout.status === 'paused'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {workout.status === 'active' ? 'Ativo' : 
                       workout.status === 'paused' ? 'Pausado' : 'Inativo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  {workout.description && (
                    <p className="text-sm text-muted-foreground mb-4">{workout.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-muted-foreground">
                        {formatDate(workout.startDate)} - {workout.endDate ? formatDate(workout.endDate) : 'Sem data de término'}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <Dumbbell className="h-4 w-4 mr-2 text-primary" />
                      <span className="text-muted-foreground">
                        {workout.exercises.length} exercícios
                      </span>
                    </div>
                    
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="w-full">
                        <ListChecks className="h-4 w-4 mr-2" />
                        Ver exercícios
                      </Button>
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
