import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/types';

interface StudentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student?: Student;
}

export function StudentForm({ open, onOpenChange, student }: StudentFormProps) {
  const { createStudent, updateStudent } = useStudents();
  const [formData, setFormData] = useState<Partial<Student>>(
    student || {
      name: '',
      email: '',
      phone: '',
      cpf: '',
      address: '',
      birthDate: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      status: 'active',
      paymentStatus: 'pending',
      planType: 'basic',
      emergencyContact: ''
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (student) {
      await updateStudent.mutateAsync({ id: student.id, data: formData });
    } else {
      await createStudent.mutateAsync(formData as Student);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{student ? 'Editar Aluno' : 'Novo Aluno'}</DialogTitle>
          <DialogDescription>
            Preencha os dados do aluno abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Nome</Label>
              <Input
                id="name"
                className="col-span-3"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input
                id="email"
                type="email"
                className="col-span-3"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Telefone</Label>
              <Input
                id="phone"
                className="col-span-3"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="address" className="text-right">Endereço</Label>
              <Input
                id="address"
                className="col-span-3"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="birthDate" className="text-right">Data de Nasc.</Label>
              <Input
                id="birthDate"
                type="date"
                className="col-span-3"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="planType" className="text-right">Plano</Label>
              <select
                id="planType"
                className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value as Student['planType'] })}
                required
                aria-label="Tipo de Plano"
              >
                <option value="basic">Básico</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
              </select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cpf" className="text-right">CPF</Label>
              <Input
                id="cpf"
                className="col-span-3"
                value={formData.cpf}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="emergencyContact" className="text-right">Contato de Emergência</Label>
              <Input
                id="emergencyContact"
                className="col-span-3"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={createStudent.isPending || updateStudent.isPending}>
              {student ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}