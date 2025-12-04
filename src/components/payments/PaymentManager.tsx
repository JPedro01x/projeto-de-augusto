import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useStudents } from '@/hooks/use-students';
import { CheckCircle, Clock, XCircle, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type PlanType = 'mensal' | 'trimestral' | 'semestral' | 'anual';
type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';
type PaymentStatus = 'pending' | 'paid' | 'overdue';

const PLAN_PRICES = {
  mensal: 99.9,
  trimestral: 279.9,
  semestral: 539.9,
  anual: 999.9
} as const;

const PLAN_LABELS = {
  mensal: 'Mensal - R$99,90',
  trimestral: 'Trimestral - R$279,90',
  semestral: 'Semestral - R$539,90',
  anual: 'Anual - R$999,90'
} as const;

interface PaymentManagerProps {
  studentId: string;
  studentName: string;
  currentPlan?: PlanType;
  currentStatus?: PaymentStatus;
  lastPaymentDate?: string;
  onPaymentUpdate: () => void;
  onLocalStatusChange: (params: {
    status: PaymentStatus;
    method: PaymentMethod;
    lastPaymentDate: string;
    planType: PlanType;
    amount: number;
  }) => void;
}

export function PaymentManager({
  studentId,
  studentName,
  currentPlan = 'mensal',
  currentStatus = 'pending',
  lastPaymentDate,
  onPaymentUpdate,
  onLocalStatusChange
}: PaymentManagerProps) {
  const { toast } = useToast();
  const { updateStudent } = useStudents();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(currentStatus);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(currentPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [nextPaymentDate, setNextPaymentDate] = useState<Date>(new Date());

  const paymentAmount = PLAN_PRICES[selectedPlan];

  useEffect(() => {
    setPaymentStatus(currentStatus);
  }, [currentStatus]);

  useEffect(() => {
    setSelectedPlan(currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    setNextPaymentDate(calculateNextPaymentDate(selectedPlan));
  }, [selectedPlan]);

  const calculateNextPaymentDate = (plan: PlanType): Date => {
    const date = new Date();
    switch (plan) {
      case 'mensal':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'trimestral':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'semestral':
        date.setMonth(date.getMonth() + 6);
        break;
      case 'anual':
        date.setFullYear(date.getFullYear() + 1);
        break;
    }
    return date;
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setIsLoading(true);
      const now = new Date().toISOString();
      const amount = PLAN_PRICES[selectedPlan];

      // Prepare data payload
      const updateData: any = {
        paymentStatus,
        planType: selectedPlan,
        paymentMethod
      };

      // Only include payment details if status is 'paid'
      if (paymentStatus === 'paid') {
        updateData.amountPaid = amount;
        updateData.lastPaymentDate = now;
      }

      await updateStudent.mutateAsync({
        id: studentId,
        data: updateData,
      });

      toast({
        title: 'Pagamento atualizado',
        description: `Status de pagamento de ${studentName} atualizado com sucesso.`,
      });

      onLocalStatusChange({
        status: paymentStatus,
        method: paymentMethod,
        lastPaymentDate: paymentStatus === 'paid' ? now : (lastPaymentDate || ''),
        planType: selectedPlan,
        amount
      });

      onPaymentUpdate();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: 'Erro ao atualizar pagamento',
        description: 'Não foi possível atualizar o status de pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    if (!date) return 'Nenhum registro';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return format(dateObj, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Status do Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {paymentStatus === 'overdue' && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Pagamento em Atraso</p>
              <p>O plano {selectedPlan} está vencido. Valor pendente: R$ {PLAN_PRICES[selectedPlan].toFixed(2).replace('.', ',')}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Status Atual</Label>
              <div className="flex items-center gap-2">
                {paymentStatus === 'paid' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : paymentStatus === 'overdue' ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
                <span className="capitalize">
                  {paymentStatus === 'paid' ? 'Pago' :
                    paymentStatus === 'pending' ? 'Pendente' : 'Atrasado'}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Mensalidade</Label>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <span>{PLAN_LABELS[selectedPlan]}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Último Pagamento</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{lastPaymentDate ? formatDate(lastPaymentDate) : 'Nenhum registro'}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Próximo Vencimento</Label>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span>{formatDate(nextPaymentDate)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Selecione o Plano</Label>
            <Select
              value={selectedPlan}
              onValueChange={(value: PlanType) => setSelectedPlan(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PLAN_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Método de Pagamento</Label>
            <Select
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método de pagamento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="cartao">Cartão de Crédito/Débito</SelectItem>
                <SelectItem value="transferencia">Transferência Bancária</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Status do Pagamento</Label>
            <RadioGroup
              value={paymentStatus}
              onValueChange={(value: PaymentStatus) => setPaymentStatus(value)}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="pending" id="pending" className="peer sr-only" />
                <Label
                  htmlFor="pending"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <Clock className="mb-2 h-6 w-6 text-yellow-500" />
                  Pendente
                </Label>
              </div>
              <div>
                <RadioGroupItem value="paid" id="paid" className="peer sr-only" />
                <Label
                  htmlFor="paid"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <CheckCircle className="mb-2 h-6 w-6 text-green-500" />
                  Pago
                </Label>
              </div>
              <div>
                <RadioGroupItem value="overdue" id="overdue" className="peer sr-only" />
                <Label
                  htmlFor="overdue"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  <XCircle className="mb-2 h-6 w-6 text-red-500" />
                  Atrasado
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleUpdatePaymentStatus}
            disabled={isLoading}
            className="w-full mt-4"
            size="lg"
          >
            {isLoading ? 'Salvando...' : 'Atualizar Status de Pagamento'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
