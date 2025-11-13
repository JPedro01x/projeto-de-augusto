export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao' | 'transferencia' | 'outro';

export interface PaymentHistory {
  id: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled';
  referenceMonth: string; // Formato: YYYY-MM
  receiptUrl?: string;
  notes?: string;
  processedBy?: string;
  processedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: string;
  status: 'active' | 'inactive' | 'suspended';
  planType: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  emergencyContact: string;
  emergencyContactPhone?: string;
  medicalConditions?: string;
  assignedInstructor?: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  lastPaymentDate?: string;
  nextPaymentDate?: string;
  paymentMethod?: PaymentMethod;
  paymentHistory?: PaymentHistory[];
  monthlyFee?: number;
  avatar?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  instructorName?: string;
  registrationDate?: string;
  updatedAt?: string;
  notes?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: string;
  status: 'active' | 'inactive';
  specialties: string[];
  schedule: {
    [key: string]: { // dia da semana
      start: string;
      end: string;
    };
  };
  assignedStudents: string[];
  salary: number;
  hireDate: string;
  certifications: string[];
}

export interface WorkoutPlan {
  id: string;
  studentId: string;
  instructorId: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  exercises: Exercise[];
  status: 'active' | 'completed' | 'cancelled';
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  equipment?: string;
  notes?: string;
  restTime?: number; // em segundos
}

export interface Attendance {
  studentId: string;
  date: string; // ISO string
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: 'pending' | 'paid' | 'cancelled' | 'refunded' | 'overdue';
  method: 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bank_transfer' | string; // string para compatibilidade
  planType: 'basic' | 'premium' | 'vip' | string; // string para compatibilidade
  dueDate: string;
  paidDate?: string;
  // Adicionando propriedades opcionais para compatibilidade
  paymentDate?: string;
  studentName?: string;
  paymentMethod?: string;
}

export interface FinancialSummary {
  summary: {
    currentMonthRevenue: {
      amount: number;
      change: number;
      trend: 'up' | 'down';
    };
    pendingPayments: {
      amount: number;
      count: number;
    };
    overduePayments: {
      amount: number;
      count: number;
    };
    paymentRate: number;
  };
  recentPayments: Array<{
    studentName: string;
    planType: string;
    dueDate: string;
    paymentDate: string | null;
    amount: number;
    status: string;
    paymentMethod: string;
  }>;
  monthlyRevenue: Array<{
    month: string;
    revenue: number;
  }>;
}

export interface PaymentFilter {
  status?: 'pending' | 'paid' | 'overdue' | 'cancelled';
  startDate?: string;
  endDate?: string;
  studentId?: string;
}

export interface DashboardStats {
  summary: {
    activeStudents: {
      count: number;
      change: number;
      trend: 'up' | 'down';
    };
    monthlyRevenue: {
      amount: number;
      change: number;
      trend: 'up' | 'down';
    };
    todayAttendance: {
      count: number;
      change: number;
      trend: 'up' | 'down';
    };
    activeWorkouts: {
      count: number;
      change: number;
      trend: 'up' | 'down';
    };
  };
  recentActivities: Array<{
    name: string;
    action: string;
    time: string;
  }>;
  weeklyStats: {
    attendanceRate: number;
    newStudents: number;
    renewals: number;
    mostPopularPlan: string;
    peakHour: string;
  };
}