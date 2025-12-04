import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student, PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { PaymentManager } from '../payments/PaymentManager';
import { studentAPI } from '@/services/api';

interface StudentPaymentsProps {
  student: Student;
  onUpdate: (updatedStudent: Student) => void;
}

const PLAN_PRICES = {
  mensal: 99.9,
  trimestral: 279.9,
  semestral: 539.9,
  anual: 999.9,
  basic: 99.9,
  premium: 149.9,
  vip: 199.9
} as const;

export function StudentPayments({ student, onUpdate }: StudentPaymentsProps) {
  // Função para renderizar o status de pagamento com ícone
  const renderPaymentStatus = (status: 'paid' | 'pending' | 'overdue') => {
    const statusConfig = {
      paid: {
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
        label: 'Pago',
        variant: 'default' as const,
      },
      pending: {
        icon: <Clock className="h-4 w-4 mr-1" />,
        label: 'Pendente',
        variant: 'outline' as const,
      },
      overdue: {
        icon: <XCircle className="h-4 w-4 mr-1" />,
        label: 'Atrasado',
        variant: 'destructive' as const,
      },
    };

    const { icon, label, variant } = statusConfig[status] || statusConfig.pending;

    return (
      <Badge variant={variant} className="inline-flex items-center">
        {icon}
        {label}
      </Badge>
    );
  };

  // Função para formatar o método de pagamento
  const formatPaymentMethod = (method?: PaymentMethod) => {
    const methods = {
      pix: 'PIX',
      dinheiro: 'Dinheiro',
      cartao: 'Cartão',
      transferencia: 'Transferência',
      outro: 'Outro',
    };

    return method ? methods[method] : 'Não informado';
  };

  // Função auxiliar para exibir a "mensalidade" com base no plano do aluno
  const getMonthlyLabel = () => {
    if (!student.planType) return 'Não definido';

    const planType = student.planType.toLowerCase();

    // Verifica se é um dos novos planos de pagamento
    if (planType === 'mensal') return 'Mensal - R$99,90';
    if (planType === 'trimestral') return 'Trimestral - R$279,90';
    if (planType === 'semestral') return 'Semestral - R$539,90';
    if (planType === 'anual') return 'Anual - R$999,90';

    // Planos antigos (basic, premium, vip)
    switch (planType) {
      case 'basic':
        return 'Plano Básico - R$99,90';
      case 'premium':
        return 'Plano Premium - R$149,90';
      case 'vip':
        return 'Plano VIP - R$199,90';
      default:
        return student.planType;
    }
  };

  // Função para obter o tipo de plano correto para o PaymentManager
  const getCurrentPlan = (): 'mensal' | 'trimestral' | 'semestral' | 'anual' => {
    const planType = student.planType?.toLowerCase();

    // Se já for um dos novos planos, retorna diretamente
    if (planType === 'mensal' || planType === 'trimestral' ||
      planType === 'semestral' || planType === 'anual') {
      return planType;
    }

    // Se for um plano antigo, converte para mensal por padrão
    return 'mensal';
  };

  // Função para lidar com a atualização do pagamento
  const handlePaymentUpdate = async () => {
    try {
      const updatedStudent = await studentAPI.get(student.id);
      if (updatedStudent) {
        onUpdate(updatedStudent);
      }
    } catch (error) {
      console.error('Erro ao atualizar dados do aluno:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Gerenciamento de Pagamentos</CardTitle>
        </div>
        <CardDescription>
          Gerencie os pagamentos de {student.name}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gerenciador de Pagamentos */}
        <PaymentManager
          studentId={student.id}
          studentName={student.name}
          currentPlan={getCurrentPlan()}
          currentStatus={student.paymentStatus}
          lastPaymentDate={student.lastPaymentDate}
          onPaymentUpdate={handlePaymentUpdate}
          onLocalStatusChange={({ status, method, lastPaymentDate, planType, amount }) => {
            onUpdate({
              ...student,
              paymentStatus: status,
              paymentMethod: method,
              lastPaymentDate,
              planType,
              amountPaid: amount,
            });
          }}
        />
      </CardContent>
    </Card>
  );
}
