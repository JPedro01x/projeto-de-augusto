import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus, Dumbbell, User, Calendar, Clock, BarChart2, CalendarDays, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/use-students';
import { Student, WorkoutPlan, Exercise } from '@/types';

export default function InstructorWorkouts() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const { students = [], isLoading } = useStudents();

  // Dados de exemplo - substituir por chamadas à API real
  const workoutPlans: WorkoutPlan[] = [
    {
      id: '1',
      studentId: '1',
      instructorId: 'instructor-1',
      name: 'Treino A - Peito e Tríceps',
      description: 'Treino focado em peitoral e tríceps',
      startDate: '2023-10-01',
      endDate: '2023-10-31',
      status: 'active',
      exercises: [
        { id: '1', name: 'Supino Reto', sets: 4, reps: 10, weight: 50 },
        { id: '2', name: 'Supino Inclinado', sets: 3, reps: 12, weight: 40 },
        { id: '3', name: 'Tríceps Corda', sets: 3, reps: 15, weight: 25 },
      ]
    },
    // Adicione mais treinos de exemplo conforme necessário
  ];

  // Filtrar alunos atribuídos a este instrutor
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    student.assignedInstructor === 'instructor-1' // Substituir pelo ID do instrutor logado
  );

  // Filtrar treinos do aluno selecionado
  const studentWorkouts = selectedStudent 
    ? workoutPlans.filter(workout => workout.studentId === selectedStudent.id)
    : [];

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
  };

  const handleCreateWorkout = () => {
    // Lógica para criar novo treino
    toast({
      title: 'Novo Treino',
      description: 'Criando um novo plano de treino...',
    });
  };

  const handleEditWorkout = (workoutId: string) => {
    // Lógica para editar treino
    console.log('Editar treino:', workoutId);
  };

  const handleDeleteWorkout = (workoutId: string) => {
    // Lógica para excluir treino
    toast({
      title: 'Excluir Treino',
      description: 'Tem certeza que deseja excluir este treino?',
      action: (
        <>
          <Button variant="outline" size="sm" onClick={() => {
            toast({ title: 'Cancelado', description: 'Operação cancelada.' });
          }}>Cancelar</Button>
          <Button variant="destructive" size="sm" onClick={() => {
            toast({ title: 'Sucesso', description: 'Treino excluído com sucesso!' });
          }}>Excluir</Button>
        </>
      ),
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
          <p className="text-muted-foreground">Gerencie os planos de treino dos seus alunos</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            className="pl-10 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {!selectedStudent ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Card 
                key={student.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleSelectStudent(student)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                      <div className="mt-1 flex items-center">
                        <Dumbbell className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs text-muted-foreground">
                          {workoutPlans.filter(w => w.studentId === student.id).length} treinos
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="col-span-full">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <User className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchTerm ? 'Nenhum aluno corresponde à sua busca.' : 'Você ainda não tem alunos atribuídos.'}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground"
                onClick={() => setSelectedStudent(null)}
              >
                ← Voltar para lista de alunos
              </Button>
              <h2 className="text-2xl font-semibold mt-2">{selectedStudent.name}</h2>
              <p className="text-sm text-muted-foreground">
                Gerencie os treinos de {selectedStudent.name.split(' ')[0]}
              </p>
            </div>
            <Button onClick={handleCreateWorkout}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Treino
            </Button>
          </div>

          {studentWorkouts.length > 0 ? (
            <div className="grid gap-4">
              {studentWorkouts.map((workout) => (
                <Card key={workout.id} className="overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{workout.name}</h3>
                        <p className="text-sm text-muted-foreground">{workout.description}</p>
                        <div className="flex items-center mt-2 text-sm text-muted-foreground">
                          <CalendarDays className="h-4 w-4 mr-2" />
                          <span>
                            {new Date(workout.startDate).toLocaleDateString()} - {new Date(workout.endDate).toLocaleDateString()}
                          </span>
                          <span className="mx-2">•</span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {workout.status === 'active' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditWorkout(workout.id)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>

                    <div className="mt-6">
                      <h4 className="text-sm font-medium mb-3">Exercícios</h4>
                      <div className="space-y-3">
                        {workout.exercises.map((exercise) => (
                          <div key={exercise.id} className="bg-muted/50 p-3 rounded-lg">
                            <div className="flex justify-between items-center">
                              <div>
                                <h5 className="font-medium">{exercise.name}</h5>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <span className="mr-4">{exercise.sets} séries</span>
                                  <span className="mr-4">{exercise.reps} repetições</span>
                                  {exercise.weight && (
                                    <span className="mr-4">{exercise.weight} kg</span>
                                  )}
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <BarChart2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Dumbbell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum treino encontrado</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {selectedStudent.name.split(' ')[0]} ainda não tem nenhum plano de treino.
                </p>
                <Button onClick={handleCreateWorkout}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Primeiro Treino
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
