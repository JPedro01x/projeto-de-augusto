import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentAPI } from '@/services/api';
import { Student } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function useStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Listar todos os alunos
  const { data: students, isLoading, error } = useQuery({
    queryKey: ['students'],
    queryFn: studentAPI.list,
  });

  // Criar aluno
  const createStudent = useMutation({
    mutationFn: studentAPI.create,
    onSuccess: (newStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Aluno cadastrado',
        description: `${newStudent.name} foi cadastrado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o aluno.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar aluno
  const updateStudent = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Student> }) =>
      studentAPI.update(id, data),
    onSuccess: (updatedStudent) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Aluno atualizado',
        description: `${updatedStudent?.name} foi atualizado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o aluno.',
        variant: 'destructive',
      });
    },
  });

  // Deletar aluno
  const deleteStudent = useMutation({
    mutationFn: studentAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast({
        title: 'Aluno removido',
        description: 'O aluno foi removido com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o aluno.',
        variant: 'destructive',
      });
    },
  });

  return {
    students,
    isLoading,
    error,
    createStudent,
    updateStudent,
    deleteStudent,
  };
}