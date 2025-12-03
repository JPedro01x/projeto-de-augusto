import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { instructorAPI } from '@/services/api';
import { Users } from 'lucide-react';

type Trainer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
};

export default function StudentTrainers() {
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const list = await instructorAPI.list();
        setTrainers(list as any);
      } catch (e) {
        setError('Falha ao carregar treinadores');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Treinadores</h1>
          <p className="text-muted-foreground">Lista de treinadores da academia</p>
        </div>

        {loading ? (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">Carregando...</CardContent>
          </Card>
        ) : error ? (
          <Card className="border-destructive/20">
            <CardContent className="p-8 text-center text-destructive">{error}</CardContent>
          </Card>
        ) : trainers.length === 0 ? (
          <Card className="border-primary/20">
            <CardContent className="p-8 text-center text-muted-foreground">Nenhum treinador encontrado</CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {trainers.map((t) => (
              <Card key={t.id} className="border-primary/20 hover:border-primary/40 transition-all">
                <CardHeader className="pb-2 flex flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{t.name}</CardTitle>
                    <CardDescription>{t.email}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{t.phone || '—'}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
    </div>
  );
}
