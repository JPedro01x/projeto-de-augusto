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
        {/* Resumo do pagamento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {renderPaymentStatus(student.paymentStatus)}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Mensalidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {student.monthlyFee ? 
                  `R$ ${student.monthlyFee.toFixed(2).replace('.', ',')}` : 
                  'Não definido'}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Último Pagamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {student.lastPaymentDate ? 
                  format(new Date(student.lastPaymentDate), 'dd/MM/yyyy', { locale: ptBR }) : 
                  'Nenhum registro'}
              </div>
              {student.paymentMethod && (
                <div className="text-xs text-muted-foreground">
                  {formatPaymentMethod(student.paymentMethod)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gerenciador de Pagamentos */}
        <PaymentManager 
          studentId={student.id} 
          studentName={student.name}
          onPaymentUpdate={handlePaymentUpdate}
        />
      </CardContent>
    </Card>
  );
}
