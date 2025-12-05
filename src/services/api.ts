import { Student, Instructor, WorkoutPlan, Payment, Attendance, DashboardStats, FinancialSummary, PaymentFilter } from '@/types';

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

export const API_BASE = 'http://localhost:3000/api';

// Função para obter o token de autenticação
export const getToken = (): string | null => {
  // Verifica primeiro no localStorage, depois no sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Função de requisição HTTP personalizada que inclui o token de autenticação
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  // Obter o token de autenticação
  const token = getToken();

  // Log para depuração
  console.log(`[API] Fazendo requisição para: ${endpoint}`, {
    temToken: !!token,
    metodo: options.method || 'GET'
  });

  if (!token) {
    console.error('Erro: Nenhum token de autenticação encontrado');
    // Redirecionar para a página de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    throw new Error('Token de autenticação não encontrado');
  }

  // Configurar os cabeçalhos
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...(options.headers || {})
  });

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
      mode: 'cors'
    });

    // Se recebermos um 401 (Não Autorizado), o token pode ter expirado
    if (response.status === 401) {
      console.error('Erro 401: Token expirado ou inválido');
      // Remover o token inválido
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      // Redirecionar para a página de login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Se houver outro erro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`Erro na requisição para ${endpoint}:`, {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      const error = new Error(errorData.message || `Erro na requisição: ${response.status} ${response.statusText}`) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // Se a resposta for 204 (No Content), retorna null
    if (response.status === 204) {
      return null as unknown as T;
    }

    return await response.json();
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);

    // Se for um erro de rede, fornecer uma mensagem mais amigável
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.error('Erro de conexão. Verifique sua conexão com a internet e tente novamente.');
      throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão com a internet e tente novamente.');
    }

    throw error;
  }
};

// API de Dashboard (admin)
export const dashboardAPI = {
  getStats: async (): Promise<DashboardStats> => {
    try {
      return await apiRequest<DashboardStats>('/dashboard/stats');
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  },
};

// API de Alunos
export const studentAPI = {
  // Listar todos os alunos
  list: async (): Promise<Student[]> => {
    try {
      const data = await apiRequest<any[]>('/students');
      // Backend retorna Student com relação user; mapeamos para o tipo do frontend
      return data.map((s: any) => ({
        id: String(s.user?.id || s.id),
        name: s.user?.name || s.name,
        email: s.user?.email || s.email,
        cpf: s.user?.cpf || s.cpf,
        phone: s.user?.phone || s.phone,
        birthDate: s.user?.birthDate || s.birthDate,
        address: s.user?.address || s.address || '',
        status: s.user?.status || s.status || 'active',
        planType: s.planType || 'basic',
        startDate: s.startDate || '',
        endDate: s.endDate || '',
        emergencyContact: s.emergencyContactName || s.emergencyContact || '',
        paymentStatus: s.paymentStatus || 'pending',
        assignedInstructor: s.assignedInstructor || '',
        medicalConditions: s.healthConditions || s.medicalConditions || ''
      }));
    } catch (error) {
      console.error('Erro ao listar alunos:', error);
      throw error;
    }
  },

  // Buscar um aluno por ID
  get: async (id: string): Promise<Student | null> => {
    const all = await studentAPI.list();
    return all.find(s => s.id === id) || null;
  },

  // Criar um novo aluno
  create: async (student: Omit<Student, 'id'>): Promise<Student> => {
    try {
      const data = await apiRequest<any>('/students', {
        method: 'POST',
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
          planType: student.planType,
          paymentStatus: student.paymentStatus,
          assignedInstructor: student.assignedInstructor,
          medicalConditions: student.medicalConditions
        })
      });

      return { ...student, id: String(data.id) } as Student;
    } catch (error) {
      console.error('Erro ao criar aluno:', error);
      throw error;
    }
  },

  // Atualizar um aluno
  update: async (id: string, data: Partial<Student>): Promise<Student | null> => {
    try {
      // Primeiro, obtemos os dados atuais do aluno
      const current = await studentAPI.get(id);
      if (!current) return null;

      // Enviamos a atualização para o servidor (apenas os campos fornecidos)
      const response = await apiRequest<any>(`/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      // Retornamos os dados atualizados
      return {
        ...current,
        ...response,
        id: current.id,
        name: response.user?.name || response.name || current.name,
        email: response.user?.email || response.email || current.email,
        cpf: response.user?.cpf || response.cpf || current.cpf,
        phone: response.user?.phone || response.phone || current.phone,
        birthDate: response.user?.birthDate || response.birthDate || current.birthDate,
        address: response.user?.address || response.address || current.address,
        status: response.user?.status || response.status || current.status,
        planType: response.planType || current.planType,
        paymentStatus: response.paymentStatus || current.paymentStatus,
        assignedInstructor: response.assignedInstructor || current.assignedInstructor,
        medicalConditions: response.healthConditions || response.medicalConditions || current.medicalConditions,
        emergencyContact: response.emergencyContactName || response.emergencyContact || current.emergencyContact,
        startDate: response.startDate || current.startDate,
        endDate: response.endDate || current.endDate
      };
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      return null;
    }
  },

  // Excluir um aluno
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/students/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir aluno:', error);
      return false;
    }
  },

  // Buscar alunos por status
  getByStatus: async (status: Student['status']): Promise<Student[]> => {
    try {
      // Se o backend suportar filtro por status, podemos fazer a requisição diretamente
      // Caso contrário, filtramos localmente
      const allStudents = await studentAPI.list();
      return allStudents.filter(student => student.status === status);
    } catch (error) {
      console.error(`Erro ao buscar alunos com status ${status}:`, error);
      return [];
    }
  },

  // Buscar alunos por instrutor
  getByInstructor: async (instructorId: string): Promise<Student[]> => {
    try {
      const data = await apiRequest<any[]>(`/students?instructorId=${instructorId}`);
      return data.map((s: any) => ({
        id: String(s.id),
        name: s.name,
        email: s.email,
        cpf: s.cpf,
        phone: s.phone,
        birthDate: s.birthDate,
        address: s.address || '',
        status: s.status || 'active',
        planType: s.planType || 'basic',
        startDate: s.startDate || '',
        endDate: s.endDate || '',
        emergencyContact: s.emergencyContact || '',
        paymentStatus: s.paymentStatus || 'pending',
        assignedInstructor: '',
        medicalConditions: s.medicalConditions || '',
        gender: s.gender || 'not_specified',
        avatar: s.avatar || '/images/avatars/default-avatar.png',
        registrationDate: s.registrationDate || new Date().toISOString(),
        lastPaymentDate: s.lastPaymentDate || null,
        nextPaymentDate: s.nextPaymentDate || null,
        age: s.age || null,
        updatedAt: s.updatedAt || new Date().toISOString(),
        instructorName: s.instructorName || 'Não atribuído'
      }));
    } catch (error) {
      console.error(`Erro ao buscar alunos do instrutor ${instructorId}:`, error);
      return [];
    }
  },
};

// API de Instrutores
export const instructorAPI = {
  // Listar todos os instrutores
  list: async (): Promise<Instructor[]> => {
    try {
      const data = await apiRequest<any[]>('/instructors');
      // Mapear os dados para o formato esperado pelo frontend
      return data.map((i: any) => ({
        id: String(i.user?.id || i.id),
        name: i.user?.name || i.name,
        email: i.user?.email || i.email,
        cpf: i.user?.cpf || i.cpf || '',
        phone: i.user?.phone || i.phone || '',
        birthDate: i.user?.birthDate || i.birthDate || '',
        address: i.user?.address || i.address || '',
        status: (i.user?.status || i.status || 'active') as 'active' | 'inactive',
        specialties: i.specialties || [],
        schedule: i.schedule || {},
        assignedStudents: i.assignedStudents || [],
        salary: i.salary || 0,
        hireDate: i.hireDate || new Date().toISOString().split('T')[0],
        certifications: i.certifications || []
      }));
    } catch (error) {
      console.error('Erro ao listar instrutores:', error);
      throw error;
    }
  },

  // Buscar um instrutor por ID
  get: async (id: string): Promise<Instructor | null> => {
    try {
      const data = await apiRequest<any>(`/instructors/${id}`);
      // Mapear os dados para o formato esperado pelo frontend
      return {
        id: String(data.user?.id || data.id),
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        cpf: data.user?.cpf || data.cpf || '',
        phone: data.user?.phone || data.phone || '',
        birthDate: data.user?.birthDate || data.birthDate || '',
        address: data.user?.address || data.address || '',
        status: (data.user?.status || data.status || 'active') as 'active' | 'inactive',
        specialties: data.specialties || [],
        schedule: data.schedule || {},
        assignedStudents: data.assignedStudents || [],
        salary: data.salary || 0,
        hireDate: data.hireDate || new Date().toISOString().split('T')[0],
        certifications: data.certifications || []
      };
    } catch (error) {
      console.error('Erro ao buscar instrutor:', error);
      return null;
    }
  },

  // Criar um novo instrutor
  create: async (instructor: Omit<Instructor, 'id'>): Promise<Instructor> => {
    try {
      const data = await apiRequest<any>('/instructors', {
        method: 'POST',
        body: JSON.stringify({
          name: instructor.name,
          email: instructor.email,
          password: (instructor as any).password || '123456', // Senha padrão para novos instrutores
          cpf: instructor.cpf,
          phone: instructor.phone,
          birthDate: instructor.birthDate,
          address: instructor.address,
          status: instructor.status || 'active',
          specialties: instructor.specialties || [],
          schedule: instructor.schedule || {},
          assignedStudents: instructor.assignedStudents || [],
          salary: instructor.salary || 0,
          hireDate: instructor.hireDate || new Date().toISOString().split('T')[0],
          certifications: instructor.certifications || []
        })
      });

      // Mapear a resposta para o formato esperado
      return {
        id: String(data.user?.id || data.id),
        name: data.user?.name || data.name,
        email: data.user?.email || data.email,
        cpf: data.user?.cpf || data.cpf || '',
        phone: data.user?.phone || data.phone || '',
        birthDate: data.user?.birthDate || data.birthDate || '',
        address: data.user?.address || data.address || '',
        status: (data.user?.status || data.status || 'active') as 'active' | 'inactive',
        specialties: data.specialties || [],
        schedule: data.schedule || {},
        assignedStudents: data.assignedStudents || [],
        salary: data.salary || 0,
        hireDate: data.hireDate || new Date().toISOString().split('T')[0],
        certifications: data.certifications || []
      };
    } catch (error) {
      console.error('Erro ao criar instrutor:', error);
      throw error;
    }
  },

  // Atualizar um instrutor
  update: async (id: string, data: Partial<Instructor>): Promise<Instructor | null> => {
    try {
      const response = await apiRequest<any>(`/instructors/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          cpf: data.cpf,
          phone: data.phone,
          birthDate: data.birthDate,
          address: data.address,
          status: data.status,
          specialties: data.specialties,
          schedule: data.schedule,
          assignedStudents: data.assignedStudents,
          salary: data.salary,
          hireDate: data.hireDate,
          certifications: data.certifications,
          // Permite atualizar a senha se for fornecida
          password: (data as any).password
        })
      });

      // Mapear a resposta para o formato esperado
      return {
        id: String(response.user?.id || response.id || id),
        name: response.user?.name || response.name || data.name,
        email: response.user?.email || response.email || data.email,
        cpf: response.user?.cpf || response.cpf || data.cpf || '',
        phone: response.user?.phone || response.phone || data.phone || '',
        birthDate: response.user?.birthDate || response.birthDate || data.birthDate || '',
        address: response.user?.address || response.address || data.address || '',
        status: (response.user?.status || response.status || data.status || 'active') as 'active' | 'inactive',
        specialties: response.specialties || data.specialties || [],
        schedule: response.schedule || data.schedule || {},
        assignedStudents: response.assignedStudents || data.assignedStudents || [],
        salary: response.salary || data.salary || 0,
        hireDate: response.hireDate || data.hireDate || new Date().toISOString().split('T')[0],
        certifications: response.certifications || data.certifications || []
      };
    } catch (error) {
      console.error('Erro ao atualizar instrutor:', error);
      return null;
    }
  },

  // Excluir um instrutor
  delete: async (id: string): Promise<boolean> => {
    try {
      await apiRequest(`/instructors/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Erro ao excluir instrutor:', error);
      return false;
    }
  },

  // Buscar instrutores por especialidade
  getBySpecialty: async (specialty: string): Promise<Instructor[]> => {
    try {
      const instructors = await instructorAPI.list();
      return instructors.filter(i => i.specialties.includes(specialty));
    } catch (error) {
      console.error(`Erro ao buscar instrutores por especialidade ${specialty}:`, error);
      return [];
    }
  },
};

// API de Treinos
export const workoutAPI = {
  // Obter treinos de um aluno específico
  getStudentWorkouts: async (studentId: string): Promise<WorkoutPlan[]> => {
    try {
      return await apiRequest<WorkoutPlan[]>(`/students/${studentId}/workouts`);
    } catch (error) {
      console.error(`Erro ao buscar treinos do aluno ${studentId}:`, error);
      return [];
    }
  },

  // Obter treinos de um instrutor específico (usando ID do usuário)
  getInstructorWorkouts: async (instructorId: string): Promise<WorkoutPlan[]> => {
    try {
      return await apiRequest<WorkoutPlan[]>(`/instructors/${instructorId}/workouts`);
    } catch (error) {
      console.error(`Erro ao buscar treinos do instrutor ${instructorId}:`, error);
      return [];
    }
  },

  // Obter um treino por ID
  getWorkoutById: async (id: string): Promise<WorkoutPlan | null> => {
    try {
      return await apiRequest<WorkoutPlan>(`/workouts/${id}`);
    } catch (error) {
      console.error(`Erro ao buscar treino ${id}:`, error);
      return null;
    }
  }
};

// API de Finanças
export const financeAPI = {
  // Obter resumo financeiro
  getFinancialSummary: async (): Promise<FinancialSummary> => {
    try {
      return await apiRequest<FinancialSummary>('/finance/summary');
    } catch (error) {
      console.error('Erro ao buscar resumo financeiro:', error);
      throw error;
    }
  },

  // Listar pagamentos com filtros
  listPayments: async (filters: PaymentFilter = {}): Promise<Payment[]> => {
    try {
      const query = new URLSearchParams();
      if (filters.status) query.append('status', filters.status);
      if (filters.startDate) query.append('startDate', filters.startDate);
      if (filters.endDate) query.append('endDate', filters.endDate);
      if (filters.studentId) query.append('studentId', filters.studentId);

      return await apiRequest<Payment[]>(`/finance/payments?${query.toString()}`);
    } catch (error) {
      console.error('Erro ao listar pagamentos:', error);
      throw error;
    }
  },

  // Registrar um novo pagamento
  createPayment: async (payment: Omit<Payment, 'id' | 'paymentDate'>): Promise<Payment> => {
    try {
      return await apiRequest<Payment>('/finance/payments', {
        method: 'POST',
        body: JSON.stringify(payment)
      });
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
      throw error;
    }
  },

  // Atualizar um pagamento
  updatePayment: async (id: string, updates: Partial<Payment>): Promise<Payment> => {
    try {
      return await apiRequest<Payment>(`/finance/payments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.error('Erro ao atualizar pagamento:', error);
      throw error;
    }
  },

  // Excluir um pagamento
  deletePayment: async (id: string): Promise<void> => {
    try {
      await apiRequest(`/finance/payments/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Erro ao excluir pagamento:', error);
      throw error;
    }
  },

  // Gerar relatório financeiro
  generateReport: async (startDate: string, endDate: string): Promise<Blob> => {
    try {
      const response = await fetch(
        `${API_BASE}/finance/report?startDate=${startDate}&endDate=${endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${getToken()}`,
            'Accept': 'application/pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Falha ao gerar relatório');
      }

      return response.blob();
    } catch (error) {
      console.error('Erro ao gerar relatório financeiro:', error);
      throw error;
    }
  },

  // Enviar cobrança para um aluno
  sendPaymentRequest: async (studentId: string, amount: number, dueDate: string, description: string): Promise<{ success: boolean; message: string }> => {
    try {
      return await apiRequest(`/finance/request-payment`, {
        method: 'POST',
        body: JSON.stringify({ studentId, amount, dueDate, description })
      });
    } catch (error) {
      console.error('Erro ao enviar cobrança:', error);
      throw error;
    }
  },

  // Obter métricas financeiras
  getMetrics: async (): Promise<{
    totalRevenue: number;
    pendingPayments: number;
    overduePayments: number;
    paymentRate: number;
    monthlyRevenue: Array<{ month: string; revenue: number }>;
  }> => {
    try {
      return await apiRequest('/finance/metrics');
    } catch (error) {
      console.error('Erro ao buscar métricas financeiras:', error);
      throw error;
    }
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