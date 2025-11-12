import { Student, Instructor, WorkoutPlan, Payment, Attendance } from '@/types';

const STORAGE_KEYS = {
  STUDENTS: 'gym_students',
  INSTRUCTORS: 'gym_instructors',
  WORKOUTS: 'gym_workouts',
  PAYMENTS: 'gym_payments',
  ATTENDANCE: 'gym_attendance',
} as const;

// Função auxiliar para gerar IDs únicos
const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

// Função auxiliar para simular delay de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para obter dados do localStorage
const getStorageData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Função para salvar dados no localStorage
const setStorageData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

const API_BASE = 'http://localhost:3000/api';
const getToken = (): string | null => localStorage.getItem('token') || sessionStorage.getItem('token');

// API de Alunos
export const studentAPI = {
  // Listar todos os alunos
  list: async (): Promise<Student[]> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/students`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao listar alunos');
    const data = await res.json();
    // Backend retorna Student com relação user; mapeamos para o tipo do frontend
    const mapped: Student[] = data.map((s: any) => ({
      id: String(s.user.id),
      name: s.user.name,
      email: s.user.email,
      cpf: s.user.cpf,
      phone: s.user.phone,
      birthDate: s.user.birthDate,
      address: s.user.address,
      status: s.user.status || 'active',
      planType: s.planType || 'basic',
      startDate: s.startDate || '',
      endDate: s.endDate || '',
      emergencyContact: s.emergencyContactName || '',
      paymentStatus: s.paymentStatus || 'pending',
      assignedInstructor: s.assignedInstructor || '',
      medicalConditions: s.healthConditions || '',
    }));
    return mapped;
  },

  // Buscar um aluno por ID
  get: async (id: string): Promise<Student | null> => {
    const all = await studentAPI.list();
    return all.find(s => s.id === id) || null;
  },

  // Criar um novo aluno
  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: student.name,
        email: student.email,
        // usa a senha vinda do formulário; fallback para '123456' apenas se não informada
        password: (student as any).password ?? '123456',
        cpf: student.cpf,
        phone: student.phone,
        birthDate: student.birthDate,
        address: student.address,
        emergencyContactName: student.emergencyContact,
      }),
    });
    if (!res.ok) throw new Error('Falha ao criar aluno');
    const data = await res.json();
    return { ...student, id: String(data.id) } as Student;
  },

  // Atualizar um aluno
  update: async (id: string, data: Partial<Student>): Promise<Student | null> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        // permite redefinir senha quando fornecida
        password: (data as any).password,
        cpf: data.cpf,
        phone: data.phone,
        birthDate: data.birthDate,
        address: data.address,
        emergencyContactName: data.emergencyContact,
        status: data.status,
      }),
    });
    if (!res.ok) return null;
    const updated = await res.json();
    return {
      id,
      name: updated.user.name,
      email: updated.user.email,
      cpf: updated.user.cpf,
      phone: updated.user.phone,
      birthDate: updated.user.birthDate,
      address: updated.user.address,
      status: updated.user.status || 'active',
      planType: data.planType || 'basic',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      emergencyContact: updated.emergencyContactName || '',
      paymentStatus: data.paymentStatus || 'pending',
      assignedInstructor: data.assignedInstructor || '',
      medicalConditions: data.medicalConditions || '',
    } as Student;
  },

  // Excluir um aluno
  delete: async (id: string): Promise<boolean> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/students/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.status === 204;
  },

  // Buscar alunos por status (client-side)
  getByStatus: async (status: Student['status']): Promise<Student[]> => {
    const students = await studentAPI.list();
    return students.filter(student => student.status === status);
  },

  // Buscar alunos por instrutor (client-side)
  getByInstructor: async (instructorId: string): Promise<Student[]> => {
    const students = await studentAPI.list();
    return students.filter(student => student.assignedInstructor === instructorId);
  },
};

// API de Instrutores
export const instructorAPI = {
  // Listar todos os instrutores
  list: async (): Promise<Instructor[]> => {
    const token = getToken();
    const res = await fetch(`${API_BASE}/instructors`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Falha ao listar instrutores');
    const data = await res.json();
    // Map para o tipo do frontend (mantém compatibilidade)
    const mapped: Instructor[] = data.map((i: any) => ({
      id: String(i.id),
      name: i.name,
      email: i.email,
      cpf: i.cpf || '',
      phone: i.phone || '',
      specialties: [],
      schedule: {},
      assignedStudents: [],
      salary: 0,
      hireDate: '',
      certifications: [],
    }));
    return mapped;
  },

  // Buscar um instrutor por ID
  get: async (id: string): Promise<Instructor | null> => {
    await delay(300);
    const instructors = getStorageData<Instructor>(STORAGE_KEYS.INSTRUCTORS);
    return instructors.find(instructor => instructor.id === id) || null;
  },

  // Criar um novo instrutor
  create: async (instructor: Omit<Instructor, 'id'>): Promise<Instructor> => {
    await delay(500);
    const instructors = getStorageData<Instructor>(STORAGE_KEYS.INSTRUCTORS);
    const newInstructor = { ...instructor, id: generateId() };
    setStorageData(STORAGE_KEYS.INSTRUCTORS, [...instructors, newInstructor]);
    return newInstructor;
  },

  // Atualizar um instrutor
  update: async (id: string, data: Partial<Instructor>): Promise<Instructor | null> => {
    await delay(500);
    const instructors = getStorageData<Instructor>(STORAGE_KEYS.INSTRUCTORS);
    const index = instructors.findIndex(instructor => instructor.id === id);
    
    if (index === -1) return null;
    
    const updatedInstructor = { ...instructors[index], ...data };
    instructors[index] = updatedInstructor;
    setStorageData(STORAGE_KEYS.INSTRUCTORS, instructors);
    return updatedInstructor;
  },

  // Excluir um instrutor
  delete: async (id: string): Promise<boolean> => {
    await delay(500);
    const instructors = getStorageData<Instructor>(STORAGE_KEYS.INSTRUCTORS);
    const filtered = instructors.filter(instructor => instructor.id !== id);
    
    if (filtered.length === instructors.length) return false;
    
    setStorageData(STORAGE_KEYS.INSTRUCTORS, filtered);
    return true;
  },

  // Buscar instrutores por especialidade
  getBySpecialty: async (specialty: string): Promise<Instructor[]> => {
    await delay(300);
    const instructors = getStorageData<Instructor>(STORAGE_KEYS.INSTRUCTORS);
    return instructors.filter(instructor => 
      instructor.specialties.includes(specialty.toLowerCase())
    );
  },
};

// Inicializar dados de exemplo
export const initializeData = () => {
  // Verifica se já existem dados
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    // Dados de exemplo para alunos
    const sampleStudents: Student[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao@email.com',
        cpf: '123.456.789-00',
        phone: '(11) 99999-9999',
        birthDate: '1990-01-01',
        address: 'Rua A, 123',
        status: 'active',
        planType: 'premium',
        startDate: '2023-01-01',
        endDate: '2024-01-01',
        emergencyContact: '(11) 88888-8888',
        paymentStatus: 'paid',
      },
      // Adicione mais alunos de exemplo aqui
    ];
    setStorageData(STORAGE_KEYS.STUDENTS, sampleStudents);
  }

  if (!localStorage.getItem(STORAGE_KEYS.INSTRUCTORS)) {
    // Dados de exemplo para instrutores
    const sampleInstructors: Instructor[] = [
      {
        id: '1',
        name: 'Maria Oliveira',
        email: 'maria@gymtech.com',
        cpf: '987.654.321-00',
        phone: '(11) 97777-7777',
        birthDate: '1985-05-15',
        address: 'Rua B, 456',
        status: 'active',
        specialties: ['musculação', 'crossfit'],
        schedule: {
          monday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
        },
        assignedStudents: [],
        salary: 3500,
        hireDate: '2022-01-01',
        certifications: ['CREF', 'Crossfit L1'],
      },
      // Adicione mais instrutores de exemplo aqui
    ];
    setStorageData(STORAGE_KEYS.INSTRUCTORS, sampleInstructors);
  }
};