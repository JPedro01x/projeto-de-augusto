import { useState, useCallback, useEffect } from 'react';

type Attendance = {
  studentId: string;
  date: string; // ISO string
};

interface AttendanceStats {
  activeToday: number; 
  totalToday: number;
  weeklyStats: {
    [key: string]: {
      total: number;
      percentage: number;
    };
  };
  monthlyPercentage: number;
}

const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

// Calcula a porcentagem de presença mensal
const calculateMonthlyPercentage = (attendances: Attendance[], studentId: string) => {
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  // Filtra as presenças do aluno nos últimos 30 dias
  const studentAttendances = attendances.filter(
    (a) => a.studentId === studentId && new Date(a.date) >= thirtyDaysAgo
  );

  // Calcula a porcentagem (esperado comparecer pelo menos 3x por semana)
  const expectedAttendances = Math.round((30 / 7) * 3); // ~12 presenças esperadas
  const percentage = Math.round((studentAttendances.length / expectedAttendances) * 100);
  return Math.min(percentage, 100); // Limita a 100%
};

export function useAttendance(studentId?: string) {
  const [attendances, setAttendances] = useState<Attendance[]>(() => {
    const saved = localStorage.getItem('attendances');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<AttendanceStats>({
    activeToday: 0,
    totalToday: 0,
    weeklyStats: Object.fromEntries(
      WEEKDAYS.map(day => [day, { total: 0, percentage: 0 }])
    ),
    monthlyPercentage: 0
  });

  // Salva as presenças no localStorage
  const saveAttendances = useCallback((newAttendances: Attendance[]) => {
    localStorage.setItem('attendances', JSON.stringify(newAttendances));
    setAttendances(newAttendances);
  }, []);

  // Calcula estatísticas
  const calculateStats = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendances.filter(r => r.date.startsWith(today));

    // Stats de hoje
    const activeToday = todayRecords.length;
    const totalToday = todayRecords.length;

    // Stats semanais
    const weeklyStats: AttendanceStats['weeklyStats'] = {};
    WEEKDAYS.forEach(day => {
      weeklyStats[day] = { total: 0, percentage: 0 };
    });

    // Últimos 7 dias
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    attendances
      .filter(a => new Date(a.date) >= last7Days)
      .forEach(a => {
        const day = WEEKDAYS[new Date(a.date).getDay()];
        weeklyStats[day].total++;
      });

    // Calcula porcentagens semanais
    Object.keys(weeklyStats).forEach(day => {
      const expectedPerDay = day === 'Domingo' ? 0 : 1; // Não espera presenças no domingo
      weeklyStats[day].percentage = Math.min(
        100,
        Math.round((weeklyStats[day].total / expectedPerDay) * 100)
      );
    });

    // Porcentagem mensal (se um ID de aluno específico foi fornecido)
    const monthlyPercentage = studentId ? calculateMonthlyPercentage(attendances, studentId) : 0;

    setStats({
      activeToday,
      totalToday,
      weeklyStats,
      monthlyPercentage
    });
  }, [attendances, studentId]);

  // Marca presença
  const checkIn = useCallback((id: string) => {
    const today = new Date().toISOString().split('T')[0];

    // Verifica se já existe presença para hoje
    const alreadyCheckedIn = attendances.some(
      (a) => a.studentId === id && a.date.startsWith(today)
    );

    if (alreadyCheckedIn) {
      return false;
    }

    // Adiciona nova presença
    saveAttendances([
      ...attendances,
      { studentId: id, date: new Date().toISOString() }
    ]);
    return true;
  }, [attendances, saveAttendances]);

  // Remove a última presença de um aluno
  const removeAttendance = useCallback((studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    // Encontra o índice da última presença do aluno hoje
    const lastAttendanceIndex = [...attendances]
      .reverse()
      .findIndex(a => a.studentId === studentId && a.date.startsWith(today));
    
    if (lastAttendanceIndex === -1) {
      console.warn('Nenhuma presença encontrada para remoção');
      return false;
    }
    
    // Calcula o índice real no array original
    const realIndex = attendances.length - 1 - lastAttendanceIndex;
    
    // Remove a presença
    const updatedAttendances = [...attendances];
    updatedAttendances.splice(realIndex, 1);
    
    saveAttendances(updatedAttendances);
    return true;
  }, [attendances, saveAttendances]);

  // Atualiza as estatísticas quando os dados mudam
  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Obtém estatísticas agregadas para um aluno específico (usado em Students.tsx)
  const getAttendanceStats = useCallback((id: string) => {
    const percentage = calculateMonthlyPercentage(attendances, id);
    const progress = Math.round(percentage / 10) * 10; // 0,10,20,...100
    const progressClass = `attendance-progress-${progress}`;
    return { percentage, progressClass };
  }, [attendances]);

  return {
    stats,
    attendances,
    checkIn,
    removeAttendance,
    calculateStats,
    getAttendanceStats
  };
}