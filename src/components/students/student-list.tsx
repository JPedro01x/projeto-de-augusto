import { useState } from 'react';
import { useStudents } from '@/hooks/use-students';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { StudentForm } from '@/components/forms/student-form';
import { Student } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Students() {
  const { students, deleteStudent, isLoading } = useStudents();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | undefined>();

  const handleEdit = (student: Student) => {
    setSelectedStudent(student);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno?')) {
      await deleteStudent.mutateAsync(id);
    }
  };

  const handleAdd = () => {
    setSelectedStudent(undefined);
    setShowForm(true);
  };

  const filteredStudents = students?.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Alunos</CardTitle>
              <CardDescription>Gerencie os alunos da academia</CardDescription>
            </div>
            <Button onClick={handleAdd}>Novo Aluno</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Pesquisar alunos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredStudents?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Nenhum aluno encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStudents?.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell className="capitalize">{student.planType}</TableCell>
                      <TableCell>
                        <div className={`
                          inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                          ${student.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        `}>
                          {student.status === 'active' ? 'Ativo' : 'Inativo'}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(student)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(student.id)}
                            disabled={deleteStudent.isPending}
                          >
                            Excluir
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <StudentForm
        open={showForm}
        onOpenChange={setShowForm}
        student={selectedStudent}
      />
    </>
  );
}