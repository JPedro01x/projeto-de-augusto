<<<<<<< HEAD
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { studentAPI, workoutAPI } from '@/services/api';

type StatItem = {
  title: string;
  value: string;
  change: string;
  icon: typeof Users;
  color: string;
  bgColor: string;
};

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StatItem[]>([]);

  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) {
        return;
      }

      try {
        const [students, workouts] = await Promise.all([
          studentAPI.getByInstructor(String(user.id)),
          workoutAPI.getInstructorWorkouts(String(user.id)),
        ]);

        const totalStudents = students.length;
        const totalWorkouts = workouts.length;

        setStats([
          {
            title: 'Meus Alunos',
            value: String(totalStudents),
            change: totalStudents === 1 ? '1 aluno' : `${totalStudents} alunos`,
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Treinos Criados',
            value: String(totalWorkouts),
            change: totalWorkouts === 1 ? '1 treino' : `${totalWorkouts} treinos`,
            icon: Dumbbell,
            color: 'text-secondary',
            bgColor: 'bg-secondary/10',
          },
          {
            title: 'Presença Média',
            value: '0%',
            change: 'em breve',
            icon: TrendingUp,
            color: 'text-accent',
            bgColor: 'bg-accent/10',
          },
          {
            title: 'Aulas Hoje',
            value: '0',
            change: 'em breve',
            icon: Calendar,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          },
        ]);
      } catch (error) {
        console.error('Erro ao carregar estatísticas do instrutor:', error);

        // fallback simples caso a API falhe
        setStats([
          {
            title: 'Meus Alunos',
            value: '0',
            change: 'erro ao carregar',
            icon: Users,
            color: 'text-primary',
            bgColor: 'bg-primary/10',
          },
          {
            title: 'Treinos Criados',
            value: '0',
            change: 'erro ao carregar',
            icon: Dumbbell,
            color: 'text-secondary',
            bgColor: 'bg-secondary/10',
          },
          {
            title: 'Presença Média',
            value: '0%',
            change: 'em breve',
            icon: TrendingUp,
            color: 'text-accent',
            bgColor: 'bg-accent/10',
          },
          {
            title: 'Aulas Hoje',
            value: '0',
            change: 'em breve',
            icon: Calendar,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
          },
        ]);
      }
    };

    loadStats();
  }, [user?.id]);
=======
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const InstructorDashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Meus Alunos',
      value: '45',
      change: '+3 este mês',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Treinos Criados',
      value: '128',
      change: '+12 esta semana',
      icon: Dumbbell,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Presença Média',
      value: '87%',
      change: '+5% vs mês anterior',
      icon: TrendingUp,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      title: 'Aulas Hoje',
      value: '8',
      change: '3 restantes',
      icon: Calendar,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
  ];
>>>>>>> 0d414629ca48619aaaa7f2291a3a5d332df37fbf

  const recentStudents = [
    { name: 'João Silva', lastWorkout: 'Peito e Tríceps', progress: 85 },
    { name: 'Maria Santos', lastWorkout: 'Costas e Bíceps', progress: 92 },
    { name: 'Pedro Costa', lastWorkout: 'Pernas', progress: 78 },
    { name: 'Ana Paula', lastWorkout: 'Ombros', progress: 88 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bem-vindo, <span className="text-gradient">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Acompanhe o progresso dos seus alunos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-primary font-semibold">{stat.change}</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Students */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Alunos Recentes
            </CardTitle>
            <CardDescription>
              Últimos treinos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentStudents.map((student, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.lastWorkout}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">{student.progress}%</p>
                    <p className="text-xs text-muted-foreground">progresso</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Schedule */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Agenda de Hoje
            </CardTitle>
            <CardDescription>
              Seus horários agendados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { time: '06:00 - 07:00', type: 'Musculação Iniciante', students: 8 },
              { time: '07:00 - 08:00', type: 'Treino Funcional', students: 12 },
              { time: '08:00 - 09:00', type: 'Personal Training', students: 1 },
              { time: '18:00 - 19:00', type: 'CrossFit', students: 15 },
              { time: '19:00 - 20:00', type: 'Musculação Avançada', students: 10 },
            ].map((schedule, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium">{schedule.time}</p>
                  <p className="text-sm text-muted-foreground">{schedule.type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-primary">{schedule.students}</p>
                  <p className="text-xs text-muted-foreground">alunos</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Progresso Semanal dos Alunos</CardTitle>
          <CardDescription>Média de conclusão de treinos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'].map((day, index) => {
              const percentage = [92, 88, 95, 87, 90, 85][index];
              return (
                <div key={day} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day}</span>
                    <span className="text-muted-foreground">{percentage}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstructorDashboard;
