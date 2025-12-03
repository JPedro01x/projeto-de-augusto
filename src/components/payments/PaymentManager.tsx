import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Clock, Send, XCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useStudents } from '@/hooks/use-students';

type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia';
type PaymentStatus = 'pending' | 'paid' | 'overdue';

interface PaymentManagerProps {
  studentId: string;
  studentName: string;
  onPaymentUpdate: () => void;
  onLocalStatusChange?: (params: { status: PaymentStatus; method: PaymentMethod; lastPaymentDate: string }) => void;
}

export function PaymentManager({ studentId, studentName, onPaymentUpdate, onLocalStatusChange }: PaymentManagerProps) {
  const { toast } = useToast();
  const { updateStudent } = useStudents();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendNotification = async () => {
    if (!message.trim()) {
      toast({
        title: 'Mensagem vazia',
        description: 'Por favor, digite uma mensagem para o aluno.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      // Aqui você implementaria o envio da notificação para o aluno
      // Por exemplo, enviar um email ou uma notificação no sistema
      
      // Simulando uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Notificação enviada',
        description: `Mensagem enviada para ${studentName} com sucesso.`,
      });
      
      setMessage('');
    } catch (error) {
      toast({
        title: 'Erro ao enviar notificação',
        description: 'Não foi possível enviar a mensagem para o aluno.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentStatus = async () => {
    try {
      setIsLoading(true);
      const lastPaymentDate = new Date().toISOString();
      
      await updateStudent.mutateAsync({
        id: studentId,
        data: {
          lastPaymentDate,
          paymentStatus: paymentStatus,
          paymentMethod: paymentMethod,
        },
      });
      
      toast({
        title: 'Pagamento atualizado',
        description: `Status de pagamento de ${studentName} atualizado com sucesso.`,
      });
      
      // Atualização otimista no frontend
      onLocalStatusChange?.({
        status: paymentStatus,
        method: paymentMethod,
        lastPaymentDate,
      });
      onPaymentUpdate();
    } catch (error) {
      toast({
        title: 'Erro ao atualizar pagamento',
        description: 'Não foi possível atualizar o status de pagamento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Pagamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
            className="w-full"
          >
            {isLoading ? 'Salvando...' : 'Atualizar Status de Pagamento'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notificar Aluno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem para o aluno</Label>
            <Textarea
              id="message"
              placeholder={`Digite uma mensagem para ${studentName} sobre o pagamento...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>
          
          <Button 
            onClick={handleSendNotification}
            disabled={isLoading || !message.trim()}
            className="w-full"
            variant="outline"
          >
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
