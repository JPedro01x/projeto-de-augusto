import { useEffect, useState } from 'react';
import StudentLayout from '@/components/StudentLayout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { studentAPI } from '@/services/api';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any | null>(null);

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
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Meu Perfil</h1>
          <p className="text-muted-foreground">Informações da sua conta</p>
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
    </StudentLayout>
  );
}
