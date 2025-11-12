import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, Phone, Mail, Calendar, Dumbbell, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStudents } from '@/hooks/use-students';
import { Student } from '@/types';

export default function InstructorStudents() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const { students = [], isLoading } = useStudents();

  // Filtrar alunos atribuídos a este instrutor
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    student.assignedInstructor === 'instructor-1' // Substituir pelo ID do instrutor logado
  );

  const handleViewWorkouts = (studentId: string) => {
    // Navegar para a página de treinos do aluno
    console.log('Visualizar treinos do aluno:', studentId);
  };

  const handleContact = (student: Student) => {
    // Lógica para entrar em contato com o aluno
    toast({
      title: 'Contato',
      description: `Enviando mensagem para ${student.name}...`,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Alunos</h1>
          <p className="text-muted-foreground">Gerencie os alunos sob sua orientação</p>
        </div>
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar alunos..."
            className="pl-10 w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredStudents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum aluno encontrado</h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm ? 'Nenhum aluno corresponde à sua busca.' : 'Você ainda não tem alunos atribuídos.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{student.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {student.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {student.status === 'active' ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Phone className="mr-2 h-4 w-4" />
                      <span>{student.phone || 'Não informado'}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Desde {new Date(student.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Frequência</span>
                      <span className="font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: '85%' }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleViewWorkouts(student.id)}
                  >
                    <Dumbbell className="mr-2 h-4 w-4" />
                    Ver Treinos
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => handleContact(student)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Contatar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
