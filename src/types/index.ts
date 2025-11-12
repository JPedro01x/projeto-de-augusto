export interface Student {
  id: string;
  name: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: string;
  status: 'active' | 'inactive';
  planType: 'basic' | 'premium' | 'vip';
  startDate: string;
  endDate: string;
  emergencyContact: string;
  medicalConditions?: string;
  assignedInstructor?: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
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
  status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  method: 'credit_card' | 'debit_card' | 'cash' | 'pix' | 'bank_transfer';
  planType: 'basic' | 'premium' | 'vip';
  dueDate: string;
  paidDate?: string;
}