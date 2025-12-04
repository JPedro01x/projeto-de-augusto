import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Search, Loader2, User, Send, Calendar, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { financeAPI, studentAPI, apiRequest } from '@/services/api';
import { Payment, FinancialSummary, Student } from '@/types';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

const Financial = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [financialData, setFinancialData] = useState<FinancialSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<StudentWithPaymentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');

  // Estados para o diálogo de cobrança
  const [isSendingRequest, setIsSendingRequest] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const [selectedStudentForRequest, setSelectedStudentForRequest] = useState<StudentWithPaymentInfo | null>(null);
  const [dueDate, setDueDate] = useState<string>(format(addDays(new Date(), 7), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('Mensalidade');

  // Função para enviar cobrança
  const handleSendPaymentRequest = async () => {
    if (!selectedStudentForRequest || !amount) return;

    // Verifica se o aluno já tem pagamentos pendentes
    if (selectedStudentForRequest.paymentStatus === 'pending') {
      toast({
        title: 'Atenção',
        description: 'Este aluno já possui pagamentos pendentes. Verifique antes de enviar nova cobrança.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSendingRequest(true);
      const response = await financeAPI.sendPaymentRequest(
        selectedStudentForRequest.id,
        parseFloat(amount),
        dueDate,
        description
      );

      if (response.success) {
        toast({
          title: 'Sucesso',
          description: 'Cobrança enviada com sucesso!',
        });
        setIsRequestDialogOpen(false);
        // Recarregar os dados financeiros
        fetchFinancialData();
      }
    } catch (error) {
      console.error('Erro ao enviar cobrança:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar a cobrança. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleCheckOverdue = async () => {
    try {
      setIsLoading(true);
      // const result = await studentAPI.checkOverdue();
      const result = await apiRequest<{ message: string; processed: number }>('/students/check-overdue', {
        method: 'POST',
      });
      toast({
        title: 'Verificação concluída',
        description: `${result.processed} pagamentos verificados e atualizados.`,
      });
      fetchFinancialData();
    } catch (error) {
      console.error('Erro ao verificar atrasos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível verificar atrasos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para carregar os dados financeiros
  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      // Primeiro buscamos o resumo financeiro
      const summary = await financeAPI.getFinancialSummary();

      // Depois buscamos os pagamentos com filtro de aluno, se houver
      const filters: any = {};
      if (selectedStudent && selectedStudent !== 'all') {
        filters.studentId = selectedStudent;
      }

      const payments = await financeAPI.listPayments(filters);

      setFinancialData(summary);
      setPayments(payments);
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

  // Atualizar os dados quando o filtro de aluno mudar
  useEffect(() => {
    fetchFinancialData();
  }, [selectedStudent]);

  // Tipagem estendida para o aluno com informações de pagamento
  interface StudentWithPaymentInfo extends Omit<Student, 'monthlyFee' | 'planType' | 'paymentStatus'> {
    monthlyFee: number;
    planType: string;
    paymentStatus: 'pending' | 'paid' | 'overdue';
    lastPaymentStatus: string;
  }

  // Carregar alunos para o campo de busca com informações de pagamento
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoadingStudents(true);
        // Carrega a lista de alunos
        const studentsList = await studentAPI.list();

        // Para cada aluno, verifica o status de pagamento mais recente
        const studentsWithPaymentInfo = await Promise.all(studentsList.map(async (student) => {
          try {
            // Busca o último pagamento do aluno
            const payments = await financeAPI.listPayments({ studentId: student.id, status: 'pending' });
            const hasPendingPayments = payments.length > 0;

            // Define o plano e valor da mensalidade
            let planType = student.planType ? String(student.planType) : 'Não definido';
            let monthlyFee = student.monthlyFee || 0;

            // Se não tiver mensalidade definida, define um valor padrão baseado no plano
            if (!monthlyFee) {
              const planName = planType.toLowerCase();
              if (planName.includes('basic')) {
                monthlyFee = 99.90;
                planType = 'Básico';
              } else if (planName.includes('premium')) {
                monthlyFee = 149.90;
                planType = 'Premium';
              } else if (planName.includes('vip')) {
                monthlyFee = 199.90;
                planType = 'VIP';
              } else {
                monthlyFee = 0;
                planType = 'Personalizado';
              }
            }

            // Garante que o status de pagamento seja um dos valores esperados
            const paymentStatus = hasPendingPayments
              ? 'pending'
              : (student.paymentStatus === 'overdue' ? 'overdue' : 'paid');

            return {
              ...student,
              monthlyFee,
              paymentStatus,
              lastPaymentStatus: hasPendingPayments ? 'Atrasado' : 'Em dia',
              planType: planType.charAt(0).toUpperCase() + planType.slice(1)
            } as StudentWithPaymentInfo;
          } catch (error) {
            console.error(`Erro ao carregar informações de pagamento para o aluno ${student.name}:`, error);
            // Retorna um objeto com valores padrão que atendem à tipagem
            return {
              ...student,
              monthlyFee: student.monthlyFee || 0,
              paymentStatus: 'paid' as const, // Usa 'paid' como valor padrão em caso de erro
              lastPaymentStatus: 'Erro ao verificar',
              planType: student.planType ? String(student.planType) : 'Não definido'
            } as StudentWithPaymentInfo;
          }
        }));

        setStudents(studentsWithPaymentInfo);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível carregar a lista de alunos.',
          variant: 'destructive',
        });
      } finally {
        setIsLoadingStudents(false);
      }
    };

    loadStudents();
  }, [toast]);

  // Carregar dados financeiros
  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);

        // Buscar pagamentos com filtro de aluno, se selecionado
        const filters: any = {};
        if (selectedStudent !== 'all') {
          filters.studentId = selectedStudent;
        }

        const [summary, payments] = await Promise.all([
          financeAPI.getFinancialSummary(),
          financeAPI.listPayments(filters)
        ]);

        setFinancialData(summary);

        // Mapear pagamentos para incluir nome do aluno
        const paymentsWithStudentNames = payments.map(payment => ({
          ...payment,
          studentName: payment.studentName || 'Aluno não encontrado',
          paymentMethod: payment.paymentMethod || 'cash',
          paymentDate: payment.paymentDate
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
  }, [toast, selectedStudent]);

  const filteredPayments = payments.filter(payment => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (payment.studentName?.toLowerCase().includes(searchLower) ||
        (payment.id && payment.id.toString().toLowerCase().includes(searchLower)) ||
        (payment.planType && payment.planType.toLowerCase().includes(searchLower)));

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gradient">Financeiro</h1>
          <p className="text-muted-foreground mt-1">Controle de pagamentos e receitas</p>
        </div>
        <Button onClick={handleCheckOverdue} disabled={isLoading} variant="outline">
          <Clock className="mr-2 h-4 w-4" />
          Verificar Atrasos
        </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Student Selection */}
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Select
                value={selectedStudent}
                onValueChange={(value) => {
                  setSelectedStudent(value);
                  // Definir o aluno selecionado para o diálogo de cobrança
                  if (value !== 'all') {
                    const student = students.find(s => s.id === value) || null;
                    setSelectedStudentForRequest(student);
                    if (student?.monthlyFee) {
                      setAmount(student.monthlyFee.toString());
                    }
                  }
                }}
                disabled={isLoadingStudents}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue placeholder="Selecionar aluno" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      <span>Todos os alunos</span>
                    </div>
                  </SelectItem>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2" />
                        <span>{student.name}</span>
                        {student.status === 'inactive' && (
                          <Badge variant="outline" className="ml-2 text-xs">Inativo</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botão de enviar cobrança */}
            <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  disabled={!selectedStudent || selectedStudent === 'all' || isLoadingStudents}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Cobrança
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Cobrança</DialogTitle>
                  <DialogDescription>
                    Envie uma cobrança para o aluno selecionado.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="student" className="text-right">
                      Aluno
                    </Label>
                    <div className="col-span-3">
                      <div className="font-medium">{selectedStudentForRequest?.name || 'Nenhum aluno selecionado'}</div>
                      {selectedStudentForRequest && (
                        <div className="text-sm text-muted-foreground">
                          Plano: {selectedStudentForRequest.planType}
                          {selectedStudentForRequest.paymentStatus === 'pending' && (
                            <span className="ml-2 text-amber-500">(Pagamento pendente)</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="amount" className="text-right">
                      Valor
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-muted-foreground">R$</span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="pl-10"
                          placeholder="0,00"
                        />
                      </div>
                      <div className="space-y-2">
                        {selectedStudentForRequest?.monthlyFee && selectedStudentForRequest.monthlyFee > 0 ? (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <span>Mensalidade do plano: R$ {selectedStudentForRequest.monthlyFee.toFixed(2)}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 ml-2 text-xs"
                              onClick={() => setAmount(selectedStudentForRequest.monthlyFee?.toString() || '')}
                            >
                              Usar valor da mensalidade
                            </Button>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">
                            Mensalidade não definida para este plano
                          </div>
                        )}
                        {selectedStudentForRequest?.paymentStatus === 'pending' && (
                          <div className="flex items-center text-sm text-amber-500">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <span>Aluno com pagamento pendente</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">
                      Vencimento
                    </Label>
                    <div className="col-span-3 relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="pl-10"
                        min={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="description" className="text-right mt-2">
                      Descrição
                    </Label>
                    <div className="col-span-3">
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descrição da cobrança"
                        className="min-h-[100px]"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Adicione detalhes sobre a cobrança, se necessário.
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsRequestDialogOpen(false)}
                    disabled={isSendingRequest}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSendPaymentRequest}
                    disabled={!amount || isSendingRequest}
                  >
                    {isSendingRequest ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Enviar Cobrança
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, ID ou plano..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                disabled={isLoading}
              />
            </div>

            {/* Status Filter */}
            <div>
              <Select
                value={filterStatus}
                onValueChange={setFilterStatus}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                      <span>Todos os status</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="paid">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                      <span>Pagos</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="pending">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                      <span>Pendentes</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="overdue">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                      <span>Atrasados</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
