import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, TrendingUp, Calendar, DollarSign, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      title: 'Alunos Ativos',
      value: '248',
      change: '+12%',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Receita Mensal',
      value: 'R$ 45.890',
      change: '+8%',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Presença Hoje',
      value: '156',
      change: '+5%',
      icon: UserCheck,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
    },
    {
      title: 'Treinos Ativos',
      value: '312',
      change: '+18%',
      icon: Dumbbell,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
  ];

  const recentActivities = [
    { student: 'João Silva', action: 'Check-in realizado', time: '2 min atrás' },
    { student: 'Maria Santos', action: 'Novo treino criado', time: '15 min atrás' },
    { student: 'Pedro Costa', action: 'Pagamento confirmado', time: '32 min atrás' },
    { student: 'Ana Paula', action: 'Check-in realizado', time: '1 hora atrás' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bem-vindo, <span className="text-gradient">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua academia hoje
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
                <span className="text-primary font-semibold">{stat.change}</span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações na academia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                    {activity.student.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{activity.student}</p>
                    <p className="text-sm text-muted-foreground">{activity.action}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Estatísticas Semanais
            </CardTitle>
            <CardDescription>
              Visão geral da semana
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Taxa de Presença</span>
                <span className="text-sm font-semibold">87%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary w-[87%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Novos Alunos</span>
                <span className="text-sm font-semibold">15</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary w-[60%]" />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Renovações</span>
                <span className="text-sm font-semibold">42</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full gradient-primary w-[75%]" />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Planos Mais Vendidos</p>
                  <p className="text-lg font-bold text-primary">Trimestral</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Horário de Pico</p>
                  <p className="text-lg font-bold text-primary">18h - 20h</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
