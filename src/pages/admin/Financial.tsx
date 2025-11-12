import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  studentName: string;
  plan: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
}

const Financial = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      studentName: 'João Silva',
      plan: 'Trimestral',
      amount: 279.90,
      dueDate: '2024-03-15',
      paidDate: '2024-03-14',
      status: 'paid',
      paymentMethod: 'Cartão de Crédito',
    },
    {
      id: '2',
      studentName: 'Maria Santos',
      plan: 'Mensal',
      amount: 99.90,
      dueDate: '2024-03-10',
      status: 'pending',
    },
    {
      id: '3',
      studentName: 'Pedro Costa',
      plan: 'Anual',
      amount: 999.90,
      dueDate: '2024-02-28',
      status: 'overdue',
    },
    {
      id: '4',
      studentName: 'Ana Paula',
      plan: 'Mensal',
      amount: 99.90,
      dueDate: '2024-03-12',
      paidDate: '2024-03-12',
      status: 'paid',
      paymentMethod: 'PIX',
    },
  ]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = payments
    .filter(p => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const overdueAmount = payments
    .filter(p => p.status === 'overdue')
    .reduce((sum, p) => sum + p.amount, 0);

  const markAsPaid = (id: string) => {
    setPayments(payments.map(p =>
      p.id === id
        ? { ...p, status: 'paid' as const, paidDate: new Date().toISOString().split('T')[0] }
        : p
    ));
    toast({
      title: 'Pagamento confirmado!',
      description: 'O pagamento foi registrado com sucesso.',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'overdue':
        return 'bg-red-500/20 text-red-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Financeiro</h1>
        <p className="text-muted-foreground mt-1">Controle de pagamentos e receitas</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita do Mês</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <DollarSign className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              +8% vs mês anterior
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Pendentes</CardTitle>
            <div className="p-2 rounded-lg bg-yellow-500/10">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {pendingAmount.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.filter(p => p.status === 'pending').length} pendentes
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagamentos Atrasados</CardTitle>
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {overdueAmount.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {payments.filter(p => p.status === 'overdue').length} atrasados
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20 hover:border-primary/40 transition-all hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Pagamento</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <CheckCircle className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">95%</div>
            <p className="text-xs text-muted-foreground mt-1">em dia</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome do aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Pagos</SelectItem>
                <SelectItem value="pending">Pendentes</SelectItem>
                <SelectItem value="overdue">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.map((payment) => (
          <Card key={payment.id} className="border-primary/20 hover:border-primary/40 transition-all">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                    {payment.studentName.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{payment.studentName}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span>Plano: {payment.plan}</span>
                      <span>Vencimento: {new Date(payment.dueDate).toLocaleDateString('pt-BR')}</span>
                      {payment.paidDate && (
                        <span>Pago em: {new Date(payment.paidDate).toLocaleDateString('pt-BR')}</span>
                      )}
                    </div>
                    {payment.paymentMethod && (
                      <p className="text-xs text-muted-foreground">
                        Método: {payment.paymentMethod}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      R$ {payment.amount.toFixed(2).replace('.', ',')}
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusLabel(payment.status)}
                    </span>
                  </div>
                  
                  {payment.status !== 'paid' && (
                    <Button
                      variant="gradient"
                      size="sm"
                      onClick={() => markAsPaid(payment.id)}
                    >
                      Confirmar Pagamento
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
          </CardContent>
        </Card>
      )}

      {/* Monthly Revenue Chart */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Evolução dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'].map((month, index) => {
              const amount = [38500, 42300, 45890, 41200, 46800, 48200][index];
              const percentage = (amount / 50000) * 100;
              return (
                <div key={month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{month}</span>
                    <span className="text-muted-foreground">R$ {amount.toLocaleString('pt-BR')}</span>
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

export default Financial;
