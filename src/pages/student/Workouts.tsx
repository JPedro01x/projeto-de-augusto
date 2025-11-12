import StudentLayout from '@/components/StudentLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function StudentWorkouts() {
  return (
    <StudentLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gradient">Meus Treinos</h1>
          <p className="text-muted-foreground">Rotinas e treinos atribuídos</p>
        </div>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>Em breve</CardTitle>
            <CardDescription>Esta seção mostrará seus treinos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Placeholder da página de Treinos.</p>
          </CardContent>
        </Card>
      </div>
    </StudentLayout>
  );
}
