import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import { studentAPI, financeAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Payment } from '@/types';

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

type PaymentStatus = Payment['status'];

export default function StudentFinance() {
  const { user } = useAuth();
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Carregar dados do aluno
        const students = await studentAPI.list();
        const currentStudent = students.find((s: any) => s.email === user?.email);
        
        if (currentStudent?.startDate) {
          setRegistrationDate(new Date(currentStudent.startDate));
        }

        // Carregar pagamentos do aluno
        if (currentStudent?.id) {
          try {
            const studentPayments = await financeAPI.listPayments({ studentId: currentStudent.id });
            // Garantir que temos um array de pagamentos
            if (Array.isArray(studentPayments)) {
              setPayments(studentPayments);
            } else {
              console.error('Formato de pagamentos inválido:', studentPayments);
              setError('Erro ao carregar os pagamentos. Formato de dados inválido.');
            }
          } catch (err) {
            console.error('Erro ao carregar pagamentos:', err);
            setError('Não foi possível carregar os pagamentos. Tente novamente mais tarde.');
          }
        }
      } catch (err) {
        console.error('Erro ao carregar dados financeiros:', err);
        setError('Não foi possível carregar os dados financeiros. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user?.email]);

  const { overdue, daysToNext } = useMemo(() => {
    const today = new Date();
    const base = registrationDate || today;
    const days = daysBetween(today, base);
    const cycleDays = 30;
    const remainder = days % cycleDays;
    const daysToNext = remainder === 0 ? 0 : cycleDays - remainder;
    const overdue = remainder === 0 && days > 0; // venceu hoje ou antes
    return { overdue, daysToNext };
  }, [registrationDate]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
  };

  const getStatusBadge = (status: PaymentStatus) => {
    const statusMap = {
      pending: { label: 'Pendente', variant: 'warning' },
      paid: { label: 'Pago', variant: 'success' },
      overdue: { label: 'Atrasado', variant: 'destructive' },
      cancelled: { label: 'Cancelado', variant: 'outline' },
      refunded: { label: 'Reembolsado', variant: 'outline' },
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'default' };
    return (
      <Badge variant={statusInfo.variant as any}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (isLoading) {
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
        <h1 className="text-3xl font-bold text-gradient">Financeiro</h1>
        <p className="text-muted-foreground">Acompanhe suas cobranças e pagamentos</p>
      </div>

      <div className="grid gap-6">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Status da Mensalidade</CardTitle>
            <CardDescription>
              {overdue ? 'Mensalidade vencida' : `Próximo vencimento em ${daysToNext} dias`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Valor do plano: <span className="font-medium">R$ 99,90/mês</span>
            </div>
            {overdue && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                <p className="text-yellow-800 dark:text-yellow-200">
                  Sua mensalidade está vencida. Por favor, realize o pagamento o mais rápido possível.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Minhas Cobranças</CardTitle>
            <CardDescription>Histórico de cobranças e pagamentos</CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhuma cobrança encontrada.
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <div>
                        <p className="font-medium">
                          {payment.paymentMethod || `Pagamento ${formatDate(payment.date)}`}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {payment.date && `Vencimento: ${formatDate(payment.dueDate || payment.date)}`}
                          {payment.paidDate && ` • Pago em: ${formatDate(payment.paidDate)}`}
                          {payment.method && ` • ${payment.method.split('_').map(word => 
                            word.charAt(0).toUpperCase() + word.slice(1)
                          ).join(' ')}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">
                          {payment.planType && payment.planType.charAt(0).toUpperCase() + payment.planType.slice(1)}
                        </p>
                      </div>
                      <div className="flex justify-end mt-1">
                        {getStatusBadge(payment.status)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
