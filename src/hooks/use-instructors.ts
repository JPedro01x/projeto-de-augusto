import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { instructorAPI } from '@/services/api';
import { Instructor } from '@/types';
import { useToast } from '@/components/ui/use-toast';

export function useInstructors() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Listar todos os instrutores
  const { data: instructors, isLoading, error } = useQuery({
    queryKey: ['instructors'],
    queryFn: instructorAPI.list,
  });

  // Criar instrutor
  const createInstructor = useMutation({
    mutationFn: instructorAPI.create,
    onSuccess: (newInstructor) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast({
        title: 'Instrutor cadastrado',
        description: `${newInstructor.name} foi cadastrado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao cadastrar',
        description: 'Não foi possível cadastrar o instrutor.',
        variant: 'destructive',
      });
    },
  });

  // Atualizar instrutor
  const updateInstructor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Instructor> }) =>
      instructorAPI.update(id, data),
    onSuccess: (updatedInstructor) => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast({
        title: 'Instrutor atualizado',
        description: `${updatedInstructor?.name} foi atualizado com sucesso.`,
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao atualizar',
        description: 'Não foi possível atualizar o instrutor.',
        variant: 'destructive',
      });
    },
  });

  // Deletar instrutor
  const deleteInstructor = useMutation({
    mutationFn: instructorAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructors'] });
      toast({
        title: 'Instrutor removido',
        description: 'O instrutor foi removido com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro ao remover',
        description: 'Não foi possível remover o instrutor.',
        variant: 'destructive',
      });
    },
  });

  return {
    instructors,
    isLoading,
    error,
    createInstructor,
    updateInstructor,
    deleteInstructor,
  };
}