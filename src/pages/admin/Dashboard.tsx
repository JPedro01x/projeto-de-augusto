import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Dumbbell, TrendingUp, Calendar, DollarSign, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/services/api';
import { DashboardStats } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardAPI.getStats();
        setStats(data);
      } catch (err) {
        console.error('Erro ao buscar dados do dashboard:', err);
        setError('Falha ao carregar os dados do dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value}%`;
  };

  const statsData = [
    {
      title: 'Alunos Ativos',
      value: stats?.summary.activeStudents.count.toString() || '0',
      change: stats ? formatPercentage(stats.summary.activeStudents.change) : '0%',
      icon: Users,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: stats?.summary.activeStudents.trend || 'up',
    },
    {
      title: 'Receita Mensal',
      value: stats ? formatCurrency(stats.summary.monthlyRevenue.amount) : 'R$ 0',
      change: stats ? formatPercentage(stats.summary.monthlyRevenue.change) : '0%',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      trend: stats?.summary.monthlyRevenue.trend || 'up',
    },
    {
      title: 'Presença Hoje',
      value: stats?.summary.todayAttendance.count.toString() || '0',
      change: stats ? formatPercentage(stats.summary.todayAttendance.change) : '0%',
      icon: UserCheck,
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      trend: stats?.summary.todayAttendance.trend || 'up',
    },
    {
      title: 'Treinos Ativos',
      value: stats?.summary.activeWorkouts.count.toString() || '0',
      change: stats ? formatPercentage(stats.summary.activeWorkouts.change) : '0%',
      icon: Dumbbell,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      trend: stats?.summary.activeWorkouts.trend || 'up',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados do dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Nenhum dado disponível no momento.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Bem-vindo, <span className="text-gradient">{user?.name}</span>
        </h1>
        <p className="text-muted-foreground">
          Aqui está o resumo da sua academia hoje, {format(new Date(), "d 'de' MMMM", { locale: ptBR })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
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
                <span className={`font-semibold ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.change}
                </span> desde o mês passado
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
              {stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                      {activity.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.name}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">Nenhuma atividade recente</p>
              )}
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
                <span className="text-sm font-semibold">{stats.weeklyStats.attendanceRate}%</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary" 
                  style={{ width: `${Math.min(stats.weeklyStats.attendanceRate, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Novos Alunos</span>
                <span className="text-sm font-semibold">{stats.weeklyStats.newStudents}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary" 
                  style={{ width: `${Math.min((stats.weeklyStats.newStudents / 25) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Renovações</span>
                <span className="text-sm font-semibold">{stats.weeklyStats.renewals}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full gradient-primary" 
                  style={{ width: `${Math.min((stats.weeklyStats.renewals / 50) * 100, 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Plano Mais Vendido</p>
                  <p className="text-lg font-bold text-primary">
                    {stats.weeklyStats.mostPopularPlan || 'Nenhum'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Horário de Pico</p>
                  <p className="text-lg font-bold text-primary">
                    {stats.weeklyStats.peakHour}
                  </p>
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
