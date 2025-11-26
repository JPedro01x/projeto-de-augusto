import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { UserCheck, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAttendance } from '@/hooks/use-attendance';
import { Student } from '@/types';

const Attendance = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const { stats, checkIn, removeAttendance, attendances } = useAttendance();
  
  // Carrega a lista de alunos do localStorage
  useEffect(() => {
    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      setStudents(JSON.parse(savedStudents));
    }
  }, []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    student.status === 'active'
  ).map(student => ({
    ...student,
    lastAttendance: attendances
      .filter(a => a.studentId === student.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date
  }));

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

        {/* Today's Attendance */}
        <Card className="lg:col-span-2 border-primary/20">
          <CardHeader>
            <CardTitle>Marcar Presença</CardTitle>
            <CardDescription>
              {format(date, "EEEE, dd 'de' MMMM", { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Buscar aluno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex flex-col">
                          <span className="font-medium">{student.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {student.lastAttendance 
                              ? `Última presença: ${new Date(student.lastAttendance).toLocaleDateString('pt-BR')}`
                              : 'Nenhuma presença registrada'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      onClick={() => checkIn(student.id)}
                    >
                      Marcar Presença
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredStudents.length === 0 && (
              <div className="text-center p-8 text-muted-foreground">
                Nenhum aluno encontrado
              </div>
            )}
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
