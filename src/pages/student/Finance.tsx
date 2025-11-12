import StudentLayout from '@/components/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useEffect, useMemo, useState } from 'react';
import { studentAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function StudentFinance() {
  const { user } = useAuth();
  const [registrationDate, setRegistrationDate] = useState<Date | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await studentAPI.list();
        const me = list.find((s: any) => s.email === user?.email);
        if (me?.startDate) setRegistrationDate(new Date(me.startDate));
      } catch {}
    };
    load();
  }, [user?.email]);

  const { overdue, daysToNext, pixCode } = useMemo(() => {
    const today = new Date();
    const base = registrationDate || today;
    const days = daysBetween(today, base);
    const cycleDays = 30;
    const remainder = days % cycleDays;
    const daysToNext = remainder === 0 ? 0 : cycleDays - remainder;
    const overdue = remainder === 0 && days > 0; // venceu hoje ou antes
    const pixCode = `00020126360014BR.GOV.BCB.PIX0114+556199999999520400005303986540599.905802BR5920GymTech Academia6009SAO PAULO62070503***6304ABCD`;
    return { overdue, daysToNext, pixCode };
  }, [registrationDate]);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Financeiro</h1>
          <p className="text-muted-foreground">Acompanhe a sua mensalidade</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>
              {overdue ? 'Mensalidade vencida' : `Próximo vencimento em ${daysToNext} dias`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Valor do plano: <span className="font-medium">R$ 99,90/mês</span>
            </div>
            {overdue && (
              <div className="space-y-2">
                <p className="text-sm">Copie o código PIX abaixo para realizar o pagamento:</p>
                <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto">{pixCode}</pre>
                <Button
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(pixCode)}
                >
                  Copiar código PIX
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
