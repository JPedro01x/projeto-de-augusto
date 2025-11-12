import StudentLayout from '@/components/StudentLayout';
import { useAttendance } from '@/hooks/use-attendance';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function StudentAttendance() {
  const { user } = useAuth();
  const { attendances, checkIn, removeAttendance, stats } = useAttendance(user?.id);

  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendances.filter(a => a.date.startsWith(today) && a.studentId === user?.id);

  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Minha Presença</h1>
          <p className="text-muted-foreground">Marque presença e acompanhe sua frequência</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Presença de Hoje</CardTitle>
            <CardDescription>Registre sua presença diária</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            {todayRecords.length === 0 ? (
              <Button variant="gradient" onClick={() => user?.id && checkIn(user.id)}>
                Marcar Presença
              </Button>
            ) : (
              <Button variant="outline" onClick={() => user?.id && removeAttendance(user.id, todayRecords[0].date)}>
                Remover Presença de Hoje
              </Button>
            )}
            <div className="text-sm text-muted-foreground">
              Frequência mensal: <span className="font-medium">{stats.monthlyPercentage}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
