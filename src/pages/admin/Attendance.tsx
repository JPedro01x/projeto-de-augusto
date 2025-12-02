import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { UserCheck, TrendingUp, Users, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAttendance } from '@/hooks/use-attendance';
import { Student } from '@/types';
import { studentAPI } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

type AttendanceStats = {
  activeToday: number;
  totalToday: number;
  weeklyStats: {
    [key: string]: {
      total: number;
      percentage: number;
    };
  };
  monthlyPercentage: number;
};

const Attendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const { stats, checkIn, removeAttendance, attendances } = useAttendance();
  
  // Carrega a lista de alunos da API
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await studentAPI.list();
        setStudents(data);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de alunos',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  const handleCheckIn = async (studentId: string) => {
    try {
      setRemovingId(studentId);
      const success = await checkIn(studentId);
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Presença registrada com sucesso',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Aviso',
          description: 'Presença já registrada para hoje',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erro ao registrar presença:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar a presença',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleRemoveAttendance = async (studentId: string) => {
    try {
      setRemovingId(studentId);
      const success = await removeAttendance(studentId);
      
      if (success) {
        toast({
          title: 'Sucesso',
          description: 'Presença removida com sucesso',
          variant: 'default',
        });
      } else {
        toast({
          title: 'Aviso',
          description: 'Nenhuma presença encontrada para remoção',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Erro ao remover presença:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a presença',
        variant: 'destructive',
      });
    } finally {
      setRemovingId(null);
    }
  };

  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      student.status === 'active'
    )
    .map(student => {
      const studentAttendances = attendances.filter(a => a.studentId === student.id);
      const lastAttendance = studentAttendances
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date;
      
      const today = new Date().toISOString().split('T')[0];
      const hasCheckedInToday = studentAttendances.some(
        a => a.date.startsWith(today)
      );

      return {
        ...student,
        lastAttendance,
        hasCheckedInToday
      };
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando lista de alunos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Controle de Presença</h1>
        <p className="text-muted-foreground mt-1">Acompanhe a frequência dos alunos</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alunos Ativos</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {students.filter(s => s.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">alunos ativos no total</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presença Hoje</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <UserCheck className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {attendances.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">presenças hoje</p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Presença</CardTitle>
            <div className="p-2 rounded-lg bg-accent/10">
              <TrendingUp className="h-4 w-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">
              {Math.round(
                (attendances.filter(a => {
                  const date = new Date(a.date);
                  const today = new Date();
                  const lastWeek = new Date();
                  lastWeek.setDate(today.getDate() - 7);
                  return date >= lastWeek;
                }).length / (students.filter(s => s.status === 'active').length * 3)) * 100
              ) || 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">média semanal</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <Card className="lg:col-span-1 border-primary/20">
          <CardHeader>
            <CardTitle>Calendário</CardTitle>
            <CardDescription>Selecione uma data</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              locale={ptBR}
              className="rounded-md border border-primary/20"
            />
          </CardContent>
        </Card>

        {/* Lista de Alunos */}
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Lista de Alunos</CardTitle>
                <CardDescription>Clique no botão para registrar presença</CardDescription>
              </div>
              <div className="w-full md:w-64">
                <Input
                  placeholder="Buscar aluno..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isPresent = student.hasCheckedInToday;
                  const lastAttendance = student.lastAttendance 
                    ? format(new Date(student.lastAttendance), "PPp", { locale: ptBR })
                    : 'Nunca registrado';
                  
                  return (
                    <div
                      key={student.id}
                      className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg transition-colors ${
                        isPresent ? 'bg-green-50 border-green-200' : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="mb-2 sm:mb-0">
                        <h4 className="font-medium">{student.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {isPresent 
                            ? 'Presente hoje' 
                            : `Última presença: ${lastAttendance}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Button
                          variant={isPresent ? 'outline' : 'default'}
                          className={`w-full sm:w-auto ${
                            isPresent ? 'border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700' : ''
                          }`}
                          onClick={() => {
                            if (isPresent) {
                              handleRemoveAttendance(student.id);
                            } else {
                              handleCheckIn(student.id);
                            }
                          }}
                          disabled={loading || removingId === student.id}
                        >
                          {loading || removingId === student.id ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              {isPresent ? 'Removendo...' : 'Registrando...'}
                            </>
                          ) : isPresent ? (
                            'Remover presença'
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4" />
                              Registrar presença
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 space-y-2">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground/30" />
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? 'Nenhum aluno encontrado com o termo de busca.'
                      : 'Nenhum aluno encontrado.'
                    }
                  </p>
                  {searchTerm && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setSearchTerm('')}
                    >
                      Limpar busca
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Frequência Semanal</CardTitle>
          <CardDescription>Presença dos últimos 7 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(stats.weeklyStats).map(([day, data]) => (
              <div key={day} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{day}</span>
                  <span className="text-muted-foreground">{data.percentage}%</span>
                </div>
                <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`attendance-progress-bar ${
                      data.percentage > 0 ? 'gradient-primary' : ''
                    } attendance-progress-${Math.round(data.percentage / 10) * 10}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Attendance;
