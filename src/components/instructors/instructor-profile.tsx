import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Instructor, Student, WorkoutPlan } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Loader2, Users, Dumbbell, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { studentAPI, instructorAPI, workoutAPI } from '@/services/api';

interface InstructorProfileProps {
  instructor: Instructor | null;
}

export function InstructorProfile({ instructor: initialInstructor }: InstructorProfileProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [instructor, setInstructor] = useState<Instructor | null>(initialInstructor);
  const [students, setStudents] = useState<Student[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [formData, setFormData] = useState<Partial<Instructor>>({});

  // Carrega os dados do instrutor e seus alunos/treinos
  useEffect(() => {
    const init = async () => {
      try {
        let inst = initialInstructor;
        // Se não houver instrutor inicial e o usuário logado for instrutor, buscar via API
        if (!inst && user?.role === 'instructor') {
          const data = await instructorAPI.get(user.id);
          inst = data as unknown as Instructor;
        }

        if (inst) {
          setInstructor(inst);
          setFormData({
            name: inst.name || '',
            email: inst.email || '',
            phone: inst.phone || '',
            specialization: (inst.specialization || (inst as any).specialty) || '',
            bio: (inst as any).bio || '',
          });

          await loadStudents(inst.id);
          await loadWorkouts(inst.id);
        }
      } catch (err) {
        console.error('Erro inicializando perfil do instrutor:', err);
      }
    };

    init();
  }, [initialInstructor]);

  const loadStudents = async (instrId?: string) => {
    try {
      setIsLoading(true);
      const id = instrId || instructor?.id || '';
      if (!id) {
        setStudents([]);
        return;
      }
      const data = await studentAPI.getByInstructor(String(id));
      setStudents(data || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkouts = async (instrId?: string) => {
    try {
      setIsLoading(true);
      const id = instrId || instructor?.id || '';
      if (!id) {
        setWorkouts([]);
        return;
      }

      // Pegar alunos do instrutor e agregar seus treinos
      const studentsList = await studentAPI.getByInstructor(String(id));
      const allWorkouts: WorkoutPlan[] = [];
      for (const s of studentsList) {
        try {
          const ws = await workoutAPI.getStudentWorkouts(s.id);
          if (Array.isArray(ws)) allWorkouts.push(...ws as any);
        } catch (err) {
          console.error(`Erro ao buscar treinos do aluno ${s.id}:`, err);
        }
      }

      setWorkouts(allWorkouts);
    } catch (error) {
      console.error('Erro ao carregar treinos:', error);
      setWorkouts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Substitua por uma chamada real à API quando disponível
      // await instructorAPI.updateInstructor(instructor?.id || '', formData);
      setInstructor(prev => (prev ? { ...prev, ...formData } : null));
      setIsEditing(false);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!instructor) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Nenhum instrutor selecionado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Perfil */}
      <Card className="border-primary/20">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={instructor.photoUrl} alt={instructor.name} />
              <AvatarFallback>
                {instructor.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{instructor.name}</CardTitle>
              <CardDescription className="text-sm">
                {instructor.specialization || 'Instrutor de Educação Física'}
              </CardDescription>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsEditing(false)}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Salvar
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="students">
                <Users className="h-4 w-4 mr-2" />
                Alunos
              </TabsTrigger>
              <TabsTrigger value="workouts">
                <Dumbbell className="h-4 w-4 mr-2" />
                Treinos
              </TabsTrigger>
            </TabsList>

            {/* Aba de Perfil */}
            <TabsContent value="profile" className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{instructor.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{instructor.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{instructor.phone || 'Não informado'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialization">Especialização</Label>
                  {isEditing ? (
                    <Input
                      id="specialization"
                      value={formData.specialization || ''}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm">{instructor.specialization || 'Não informada'}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Sobre</Label>
                {isEditing ? (
                  <textarea
                    id="bio"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={formData.bio || ''}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {instructor.bio || 'Nenhuma informação adicional fornecida.'}
                  </p>
                )}
              </div>
            </TabsContent>

            {/* Aba de Alunos */}
            <TabsContent value="students" className="pt-4">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Aluno</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Última Aula</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          <p className="mt-2 text-sm text-muted-foreground">Carregando alunos...</p>
                        </TableCell>
                      </TableRow>
                    ) : students.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Nenhum aluno encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell>
                            <Badge variant={student.status === 'active' ? 'default' : 'secondary'}>
                              {student.status === 'active' ? 'Ativo' : 'Inativo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{student.planType}</TableCell>
                          <TableCell>
                            {student.lastAttendance
                              ? format(new Date(student.lastAttendance), "dd/MM/yyyy' às 'HH:mm", {
                                  locale: ptBR,
                                })
                              : 'Nunca'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              Ver Detalhes
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Aba de Treinos */}
            <TabsContent value="workouts" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <div className="col-span-full text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    <p className="mt-2 text-sm text-muted-foreground">Carregando treinos...</p>
                  </div>
                ) : workouts.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    Nenhum treino cadastrado
                  </div>
                ) : (
                  workouts.map((workout) => (
                    <Card key={workout.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{workout.name}</CardTitle>
                            <CardDescription className="mt-1">
                              {workout.exercises?.length || 0} exercícios
                            </CardDescription>
                          </div>
                          <Badge variant="secondary" className="capitalize">
                            {workout.difficulty || 'Não especificado'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {workout.description || 'Sem descrição'}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                          <span className="text-xs text-muted-foreground">
                            Criado em{' '}
                            {format(new Date(workout.createdAt), 'dd/MM/yyyy', {
                              locale: ptBR,
                            })}
                          </span>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
