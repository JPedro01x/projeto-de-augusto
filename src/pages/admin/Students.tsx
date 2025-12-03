import { useState } from 'react';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/types';
import { StudentForm } from '@/components/students/student-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, Activity, Dumbbell, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAttendance } from '@/hooks/use-attendance';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StudentProfile } from '@/components/students/student-profile';

export default function Students() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const { students = [], updateStudent, deleteStudent, isLoading } = useStudents();
  const { getAttendanceStats } = useAttendance();

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.cpf.includes(searchTerm)
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      await deleteStudent.mutateAsync(id);
      toast({
        title: 'Aluno removido',
        description: 'O aluno foi removido do sistema.',
      });
    }
  };

  const toggleStatus = async (id: string) => {
    const student = students?.find(s => s.id === id);
    if (student) {
      const newStatus = student.status === 'active' ? 'inactive' : 'active' as const;
      await updateStudent.mutateAsync({
        id,
        data: { status: newStatus }
      });
    }
  };

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setIsDialogOpen(true);
  };

  const handleViewProfile = (student: Student) => {
    // Garantir que todos os campos obrigatórios estejam presentes
    const studentWithDefaults: Student = {
      ...student,
      emergencyContact: student.emergencyContact || '',
      paymentStatus: student.paymentStatus || 'pending',
      startDate: student.startDate || new Date().toISOString(),
      endDate: student.endDate || '',
      planType: student.planType || 'basic',
      status: student.status || 'active',
    };
    setViewingStudent(studentWithDefaults);
  };

  const handleAdd = () => {
    setSelectedStudent(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="container pb-6 pt-4 md:py-6 min-h-[calc(100vh-4rem)]">
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient">Alunos</h1>
            <p className="text-muted-foreground mt-1">Gerencie os alunos da academia</p>
          </div>

          <Button onClick={handleAdd} variant="gradient" size="lg" className="w-full sm:w-auto">
            <Plus className="h-5 w-5 mr-2" />
            Novo Aluno
          </Button>
        </div>

        {/* Search */}
        <Card className="border-primary/20">
          <CardContent className="pt-4 md:pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Carregando...</p>
              </CardContent>
            </Card>
          ) : filteredStudents.length === 0 ? (
            <Card className="border-primary/20">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Nenhum aluno encontrado</p>
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => (
              <Card key={student.id} className="border-primary/20 hover:border-primary/40 transition-all">
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                        <img 
                          src="/images/avatars/default-avatar.png" 
                          alt={student.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://via.placeholder.com/150';
                          }}
                        />
                      </div>
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-semibold text-base md:text-lg truncate">{student.name}</h3>
                        <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-1 text-sm text-muted-foreground">
                          <span className="truncate">{student.email}</span>
                          <span>{student.phone}</span>
                          <span>CPF: {student.cpf}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-2 py-1 rounded-md bg-primary/20 text-primary text-xs font-medium capitalize">
                            {student.planType}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 ${
                              student.status === 'active'
                                ? 'bg-green-500/20 text-green-500'
                                : student.status === 'inactive'
                                ? 'bg-red-500/20 text-red-500'
                                : 'bg-yellow-500/20 text-yellow-500'
                            }`}
                          >
                            {student.status === 'active' ? (
                              <CheckCircle className="h-3 w-3" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            {student.status === 'active' ? 'Ativo' : 
                             student.status === 'inactive' ? 'Inativo' : 'Suspenso'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => toggleStatus(student.id)}
                        title={student.status === 'active' ? 'Desativar' : 'Ativar'}
                        disabled={updateStudent.isPending}
                      >
                        {student.status === 'active' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleViewProfile(student)}
                        title="Ver perfil"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(student)}
                        title="Editar aluno"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDelete(student.id)}
                        disabled={deleteStudent.isPending}
                        title="Excluir aluno"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    </div>
                  
                    {student.status === 'active' && (
                      <div className="mt-4 pt-4 border-t border-border/20">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium flex items-center gap-2">
                            <Activity className="h-4 w-4 text-primary" />
                            Frequência Mensal
                          </span>
                          <span className="text-muted-foreground">
                            {getAttendanceStats(student.id).percentage}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
                          <div
                            className={`attendance-progress-bar ${
                              getAttendanceStats(student.id).percentage > 0 ? 'gradient-primary' : ''
                            } ${getAttendanceStats(student.id).progressClass}`}
                          />
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <StudentForm
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          student={selectedStudent}
        />

        <Dialog open={!!viewingStudent} onOpenChange={(open) => !open && setViewingStudent(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Perfil do Aluno</DialogTitle>
            </DialogHeader>
            {viewingStudent && <StudentProfile student={viewingStudent} isAdmin={true} />}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
