import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { fileService } from '@/services/fileService';
import { studentAPI } from '@/services/api';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Edit, Save, X, Loader2, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentPayments } from './StudentPayments';
import { useAuth } from '@/context/AuthContext';

interface StudentProfileProps {
  student: Student | null;
  isAdmin?: boolean;
}

export function StudentProfile({ student, isAdmin = false }: StudentProfileProps) {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(student);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Student>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Atualiza o formulário quando o aluno é carregado
  useEffect(() => {
    if (student) {
      setCurrentStudent(student);
      setFormData({
        name: student.name || '',
        email: student.email || '',
        cpf: student.cpf || '',
        phone: student.phone || '',
        birthDate: student.birthDate || '',
        address: student.address || '',
        emergencyContact: student.emergencyContact || '',
        emergencyContactPhone: student.emergencyContactPhone || '',
        medicalConditions: student.medicalConditions || '',
        planType: student.planType || 'basic',
        gender: student.gender || 'prefer_not_to_say',
      });
    }
  }, [student]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveChanges = async () => {
    if (!currentStudent) return;
    
    try {
      setIsLoading(true);
      const updatedStudent = await studentAPI.update(currentStudent.id, formData);
      if (updatedStudent) {
        setCurrentStudent(updatedStudent);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!currentStudent) return;
    
    try {
      setIsUpdating(true);
      
      // Fazer upload do novo avatar
      const { url } = await fileService.uploadFile(file, 'avatars');
      
      // Atualizar o avatar do aluno na API
      const updatedStudent = await studentAPI.update(currentStudent.id, { 
        ...currentStudent,
        avatar: url 
      });
      
      if (updatedStudent) {
        setCurrentStudent(updatedStudent);
      }
    } catch (error) {
      console.error('Erro ao atualizar o avatar:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Função auxiliar para renderizar campos de formulário
  const renderField = (label: string, value: string | undefined, fieldName: keyof Student) => {
    if (isEditing) {
      if (fieldName === 'gender') {
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Select 
              value={formData[fieldName] as string || ''} 
              onValueChange={(value) => handleSelectChange(fieldName, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o gênero" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Masculino</SelectItem>
                <SelectItem value="female">Feminino</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
                <SelectItem value="prefer_not_to_say">Prefiro não informar</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      } else if (fieldName === 'planType') {
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Select 
              value={formData[fieldName] as string || ''} 
              onValueChange={(value) => handleSelectChange(fieldName, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      } else if (fieldName === 'medicalConditions' || fieldName === 'address') {
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Textarea
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] as string || ''}
              onChange={handleInputChange}
              placeholder={`Digite ${label.toLowerCase()}`}
            />
          </div>
        );
      } else {
        return (
          <div className="space-y-2">
            <Label htmlFor={fieldName}>{label}</Label>
            <Input
              id={fieldName}
              name={fieldName}
              value={formData[fieldName] as string || ''}
              onChange={handleInputChange}
              placeholder={`Digite ${label.toLowerCase()}`}
              type={fieldName === 'birthDate' ? 'date' : 'text'}
            />
          </div>
        );
      }
    }

    return (
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="font-medium">
          {value || 'Não informado'}
        </p>
      </div>
    );
  };

  // Função para lidar com a atualização do aluno
  const handleStudentUpdate = (updatedStudent: Student) => {
    setCurrentStudent(updatedStudent);
  };

  if (!currentStudent) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        Nenhum aluno selecionado
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md mb-6">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="relative">
                    {isAdmin ? (
                      // Avatar view-only para admin
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                        <img
                          src={currentStudent.avatar ? fileService.getFileUrl(currentStudent.avatar) : '/images/avatars/default-avatar.png'}
                          alt={currentStudent.name || 'Aluno'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/images/avatars/default-avatar.png';
                          }}
                        />
                      </div>
                    ) : (
                      // Avatar com upload para o próprio aluno
                      <>
                        <AvatarUpload 
                          currentAvatar={currentStudent.avatar ? fileService.getFileUrl(currentStudent.avatar) : ''}
                          onUpload={handleAvatarUpload}
                          className="w-16 h-16"
                        />
                        {isUpdating && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  <div className="text-center sm:text-left">
                    <CardTitle className="text-2xl">
                      {isEditing ? (
                        <Input
                          name="name"
                          value={formData.name || ''}
                          onChange={handleInputChange}
                          placeholder="Nome completo"
                          className="text-2xl font-bold"
                        />
                      ) : (
                        currentStudent.name || 'Nome não informado'
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {isEditing ? (
                        <Input
                          name="email"
                          type="email"
                          value={formData.email || ''}
                          onChange={handleInputChange}
                          placeholder="E-mail"
                          className="mt-1"
                        />
                      ) : (
                        currentStudent.email || 'E-mail não informado'
                      )}
                    </CardDescription>
                    {isUpdating && (
                      <p className="text-xs text-blue-500 mt-1">Atualizando foto de perfil...</p>
                    )}
                  </div>
                </div>
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={handleSaveChanges}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        Salvar alterações
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar perfil
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {renderField('CPF', currentStudent.cpf, 'cpf')}
              {renderField('Telefone', currentStudent.phone, 'phone')}
              {renderField('Data de Nascimento', currentStudent.birthDate ? format(new Date(currentStudent.birthDate), 'dd/MM/yyyy', { locale: ptBR }) : '', 'birthDate')}
              {renderField('Gênero', 
                currentStudent.gender === 'male' ? 'Masculino' : 
                currentStudent.gender === 'female' ? 'Feminino' : 
                currentStudent.gender === 'other' ? 'Outro' : 
                'Prefiro não informar', 
                'gender'
              )}
              {renderField('Endereço', currentStudent.address, 'address')}
              {renderField('Contato de Emergência', currentStudent.emergencyContact, 'emergencyContact')}
              {renderField('Telefone de Emergência', currentStudent.emergencyContactPhone, 'emergencyContactPhone')}
              {renderField('Plano', 
                currentStudent.planType === 'basic' ? 'Básico' : 
                currentStudent.planType === 'premium' ? 'Premium' : 
                currentStudent.planType === 'vip' ? 'VIP' : 
                'Não definido', 
                'planType'
              )}
              {renderField('Status', 
                currentStudent.status === 'active' ? 'Ativo' : 
                currentStudent.status === 'inactive' ? 'Inativo' : 
                'Suspenso', 
                'status'
              )}
              {currentStudent.startDate && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Data de Início</p>
                  <p className="font-medium">
                    {format(new Date(currentStudent.startDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
              {currentStudent.endDate && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Data de Término</p>
                  <p className="font-medium">
                    {format(new Date(currentStudent.endDate), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {currentStudent.medicalConditions && (
            <Card>
              <CardHeader className="border-b">
                <CardTitle>Condições Médicas</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="whitespace-pre-line">{currentStudent.medicalConditions}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments">
          {currentStudent && (
            <StudentPayments 
              student={currentStudent} 
              onUpdate={handleStudentUpdate} 
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
