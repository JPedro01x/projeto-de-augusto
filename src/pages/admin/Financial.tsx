import { useState, useEffect } from 'react';
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
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Search, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { financeAPI, studentAPI } from '@/services/api';
import { Payment, FinancialSummary } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Financial = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        // Primeiro buscamos o resumo financeiro
        const summary = await financeAPI.getFinancialSummary();
        console.log('Resumo financeiro:', summary);
        
        // Depois buscamos os pagamentos sem filtro de status
        const payments = await financeAPI.getPayments({});
        
        setFinancialData(summary);
        
        // Log para verificar a estrutura dos dados de receita mensal
        if (summary && summary.monthlyRevenue) {
          console.log('Dados de receita mensal:', summary.monthlyRevenue);
        }
        // Mapeamos os pagamentos para incluir o nome do aluno
        const paymentsWithStudentNames = await Promise.all(payments.map(async (payment: Payment) => {
          try {
            // Usando o método get da studentAPI para buscar os detalhes do aluno
            const student = await studentAPI.get(payment.studentId);
            return {
              ...payment,
              studentName: student?.name || 'Aluno não encontrado',
              // Garantindo que as propriedades opcionais estejam definidas
              paymentMethod: payment.method || 'cash',
              paymentDate: payment.paidDate
            };
          } catch (error) {
            console.error('Erro ao buscar dados do aluno:', error);
            return {
              ...payment,
              studentName: `Aluno (${payment.studentId.substring(0, 6)}...)`,
              paymentMethod: payment.method || 'cash',
              paymentDate: payment.paidDate
            };
          }
        }));
        
        setPayments(paymentsWithStudentNames);
      } catch (error) {
        console.error('Erro ao carregar dados financeiros:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar os dados financeiros.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinancialData();
  }, [toast]);

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (payment.studentName?.toLowerCase().includes(searchLower) ||
       payment.id.toLowerCase().includes(searchLower) ||
       payment.planType?.toLowerCase().includes(searchLower));
       
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading || !financialData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados financeiros...</span>
      </div>
    );
  }

  const { summary, recentPayments, monthlyRevenue } = financialData;
  const { currentMonthRevenue, pendingPayments, overduePayments, paymentRate } = summary;

  const markAsPaid = async (id: string) => {
    try {
      setIsLoading(true);
      // Atualiza o status do pagamento para pago e define a data de pagamento
      await financeAPI.updatePayment(id, { 
        status: 'paid', 
        paidDate: new Date().toISOString(),
        paymentDate: new Date().toISOString()
      } as any); // Usando 'as any' temporariamente para evitar erros de tipagem
      
      // Atualiza o estado local com o pagamento atualizado
      setPayments(payments.map(p =>
        p.id === id
          ? { 
              ...p, 
              status: 'paid', 
              paidDate: new Date().toISOString(),
              paymentDate: new Date().toISOString(),
              paymentMethod: p.paymentMethod || 'Dinheiro' // Valor padrão para o método de pagamento
            }
          : p
      ));
      
      // Atualiza o resumo financeiro
      const updatedSummary = await financeAPI.getFinancialSummary();
      setFinancialData(updatedSummary);
      
      toast({
        title: 'Pagamento confirmado!',
        description: 'O pagamento foi registrado com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível registrar o pagamento.',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string | undefined) => {
    if (!status) return 'bg-muted text-muted-foreground';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-500';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'overdue':
        return 'bg-red-500/20 text-red-500';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-500';
      case 'refunded':
        return 'bg-blue-500/20 text-blue-500';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return 'Desconhecido';
    
    switch (status.toLowerCase()) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      case 'overdue':
        return 'Atrasado';
      case 'cancelled':
        return 'Cancelado';
      case 'refunded':
        return 'Reembolsado';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string | Date | undefined | null): string => {
    if (!dateString) return 'Data não informada';
    
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      
      // Verifica se a data é válida
      if (isNaN(date.getTime())) {
        return 'Data inválida';
      }
      
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
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
              {formatCurrency(currentMonthRevenue.amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              {currentMonthRevenue.trend === 'up' ? (
                <TrendingUp className="h-3 w-3 text-green-500" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500" />
              )}
              {Math.abs(currentMonthRevenue.change)}% vs mês anterior
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
              {formatCurrency(pendingPayments.amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {pendingPayments.count} {pendingPayments.count === 1 ? 'pendente' : 'pendentes'}
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
              {formatCurrency(overduePayments.amount)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {overduePayments.count} {overduePayments.count === 1 ? 'atrasado' : 'atrasados'}
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
            <div className="text-2xl font-bold text-primary">{paymentRate}%</div>
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
        {filteredPayments.length > 0 ? (
          filteredPayments.map((payment) => (
            <Card key={payment.id} className="border-primary/20 hover:border-primary/40 transition-all">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-medium">
                      {payment.studentName || `Aluno (${payment.studentId.substring(0, 6)}...)`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Plano: {payment.planType ? payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1) : 'N/A'}
                    </p>
                    <p className="text-sm">
                      Vencimento: {formatDate(payment.dueDate)}
                    </p>
                    {payment.paymentDate && (
                      <p className="text-sm">
                        Pago em: {formatDate(payment.paymentDate)}
                        {payment.paymentMethod && ` • ${payment.paymentMethod}`}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(payment.amount || 0)}
                      </div>
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status || 'pending')}`}>
                        {getStatusLabel(payment.status || 'pending')}
                      </span>
                    </div>
                    
                    {payment.status !== 'paid' && (
                      <Button
                        variant="gradient"
                        size="sm"
                        onClick={() => markAsPaid(payment.id)}
                        disabled={isLoading}
                        className="min-w-[150px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          'Confirmar Pagamento'
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-primary/20">
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Nenhum pagamento encontrado</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Monthly Revenue Chart */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>Receita Mensal</CardTitle>
          <CardDescription>Evolução dos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData?.monthlyRevenue?.length ? (
              financialData.monthlyRevenue.map(({ month, revenue }) => {
                // Encontrar o valor máximo para calcular a porcentagem relativa
                const maxRevenue = Math.max(...financialData.monthlyRevenue.map(mr => mr.revenue), 1);
                const percentage = (revenue / maxRevenue) * 100;
                
                return (
                  <div key={month} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{month}</span>
                      <span className="text-muted-foreground">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(revenue || 0)}
                      </span>
                    </div>
                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum dado de receita disponível
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Financial;
