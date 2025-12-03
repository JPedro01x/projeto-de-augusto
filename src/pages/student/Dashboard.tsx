import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { studentAPI } from '@/services/api';
import { fileService } from '@/services/fileService';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { toast } from '@/components/ui/use-toast';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarUpload = async (file: File) => {
    try {
      setIsUploading(true);
      // Upload the file
      const { url } = await fileService.uploadFile(file, 'avatars');
      
      // Update student profile with new avatar URL
      if (profile?.id) {
        const updatedStudent = await studentAPI.update(profile.id, { ...profile, avatar: url });
        setProfile(updatedStudent);
        
        toast({
          title: 'Sucesso!',
          description: 'Foto de perfil atualizada com sucesso',
        });
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a foto de perfil',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const list = await studentAPI.list();
        const me = list.find((s: any) => s.email === user?.email);
        setProfile(me || null);
      } catch (e) {
        setProfile(null);
      }
    };
    load();
  }, [user?.email]);

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Meu Perfil</h1>
            <p className="text-muted-foreground">Informações da sua conta</p>
          </div>
          <div className="relative group">
            <AvatarUpload 
              currentAvatar={profile?.avatar ? fileService.getFileUrl(profile.avatar) : ''}
              onUpload={handleAvatarUpload}
              className="w-20 h-20"
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </div>
            )}
          </div>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Dados Pessoais</CardTitle>
            <CardDescription>Seus dados cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Nome</p>
              <p className="font-medium">{profile?.name || user?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CPF</p>
              <p className="font-medium">{profile?.cpf || '-'} </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefone</p>
              <p className="font-medium">{profile?.phone || '-'}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-sm text-muted-foreground">Endereço</p>
              <p className="font-medium">{profile?.address || '-'}</p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
}
