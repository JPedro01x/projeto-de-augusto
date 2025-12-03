import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
}

export function StudentForm({ open, onOpenChange, student }: StudentFormProps) {
  const { createStudent, updateStudent } = useStudents();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      name: '',
      email: '',
      cpf: '',
      phone: '',
      birthDate: '',
      address: '',
      planType: 'basic',
      emergencyContact: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      paymentStatus: 'pending',
      medicalConditions: '',
      assignedInstructor: ''
    }
  );

  // Senha para novo aluno (apenas no cadastro)
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (student) {
        // Se usuário quer alterar senha no modo edição
        const wantsPasswordChange = password.length > 0 || confirmPassword.length > 0;
        if (wantsPasswordChange) {
          if (password.length < 6) {
            toast({
              title: 'Senha inválida',
              description: 'Defina uma senha com pelo menos 6 caracteres para o aluno.',
              variant: 'destructive',
            });
            return;
          }
          if (password !== confirmPassword) {
            toast({
              title: 'Confirmação de senha',
              description: 'As senhas não coincidem.',
              variant: 'destructive',
            });
            return;
          }
        }

        await updateStudent.mutateAsync({ id: student.id, data: { ...formData, ...(wantsPasswordChange ? { password } : {}) } as any });
        toast({
          title: 'Aluno atualizado!',
          description: `${formData.name} foi atualizado com sucesso.`,
        });
      } else {
        // Validação simples de senha
        if (!password || password.length < 6) {
          toast({
            title: 'Senha inválida',
            description: 'Defina uma senha com pelo menos 6 caracteres para o aluno.',
            variant: 'destructive',
          });
          return;
        }
        if (password !== confirmPassword) {
          toast({
            title: 'Confirmação de senha',
            description: 'As senhas não coincidem.',
            variant: 'destructive',
          });
          return;
        }

        // Envia os dados + password (o backend usa o campo password se presente)
        await createStudent.mutateAsync({ ...(formData as Omit<Student, 'id'>), password } as any);
        toast({
          title: 'Aluno cadastrado!',
          description: `${formData.name} foi adicionado com sucesso.`,
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro!',
        description: 'Ocorreu um erro ao salvar os dados do aluno.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[calc(100vh-2rem)] md:max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 md:pb-4">
          <DialogTitle>{student ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno abaixo
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF *</Label>
              <Input
                id="cpf"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContact">Contato de Emergência *</Label>
              <Input
                id="emergencyContact"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="(00) 00000-0000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="planType">Plano *</Label>
              <Select
                value={formData.planType}
                onValueChange={(value) => setFormData({ ...formData, planType: value as Student['planType'] })}
              >
                <SelectTrigger id="planType">
                  <SelectValue placeholder="Selecione o plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Básico - R$ 99,90</SelectItem>
                  <SelectItem value="premium">Premium - R$ 279,90</SelectItem>
                  <SelectItem value="vip">VIP - R$ 999,90</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="medicalConditions">Condições Médicas</Label>
              <Input
                id="medicalConditions"
                value={formData.medicalConditions}
                onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
                placeholder="Se houver, descreva condições médicas relevantes"
              />
            </div>

            {/* Senha (criação obrigatória; edição opcional) */}
            <div className="space-y-2">
              <Label htmlFor="password">{student ? 'Nova Senha (opcional)' : 'Senha do Aluno *'}</Label>
              <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={student ? 'Preencha para redefinir' : 'Mínimo 6 caracteres'}
                required={!student}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{student ? 'Confirmar Nova Senha (opcional)' : 'Confirmar Senha *'}</Label>
              <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required={!student}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute inset-y-0 right-2 flex items-center text-muted-foreground hover:text-foreground"
                aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
              disabled={createStudent.isPending || updateStudent.isPending}
            >
              {student ? 'Atualizar' : 'Cadastrar'} Aluno
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}