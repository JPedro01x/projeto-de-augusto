import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'instructor' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  cpf?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api'; // Usando o prefixo /api para todas as requisições

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored user on mount (first check localStorage, then sessionStorage)
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      console.log('Tentando fazer login com:', { email });
      
      // Verificar se o backend está acessível
      try {
        const healthResponse = await fetch('http://localhost:3000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!healthResponse.ok) {
          throw new Error(`Erro no health check: ${healthResponse.status} ${healthResponse.statusText}`);
        }
        
        const healthData = await healthResponse.json();
        console.log('Health check:', healthData);
      } catch (healthError) {
        console.error('Erro ao conectar ao backend:', healthError);
        throw new Error('Não foi possível conectar ao servidor. Verifique se o backend está rodando corretamente na porta 3000.');
      }
      
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache': 'no-cache'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', // Importante para enviar cookies
        mode: 'cors'
      });

      console.log('Resposta do servidor:', {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.error('Erro na resposta:', errorData);
        } catch (e) {
          const text = await response.text();
          console.error('Erro ao processar resposta de erro:', text);
          throw new Error(`Erro no servidor: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.message || 'Falha na autenticação');
      }

      const data = await response.json();
      const { token, user: userData } = data;
      
      // Mapear o usuário para o formato esperado
      console.log('Dados recebidos do servidor:', data);
      console.log('Token recebido:', token);
      console.log('Dados do usuário recebidos:', userData);

      // Mapear o usuário para o formato esperado
      const mappedUser: User = {
        id: String(userData.user?.id || userData.id || ''),
        name: userData.user?.name || userData.name || '',
        email: userData.user?.email || userData.email || '',
        role: (userData.userType || userData.user?.userType || userData.role || 'student').toLowerCase() as UserRole,
        cpf: userData.user?.cpf || userData.cpf,
        phone: userData.user?.phone || userData.phone
      };

      console.log('Usuário mapeado para o contexto:', mappedUser);

      // Armazenar o token e o usuário
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('token', token);
      storage.setItem('user', JSON.stringify(mappedUser));
      
      // Definir o usuário no estado
      setUser(mappedUser);

      // Navegar com base na função do usuário com pequeno atraso para garantir a atualização do estado
      setTimeout(() => {
        console.log('Redirecionando usuário com função:', mappedUser.role);
        if (mappedUser.role === 'admin') {
          console.log('Redirecionando para /admin');
          navigate('/admin');
        } else if (mappedUser.role === 'instructor') {
          console.log('Redirecionando para /instructor/dashboard');
          navigate('/instructor/dashboard');
        } else {
          console.log('Redirecionando para /student/dashboard');
          navigate('/student/dashboard');
        }
      }, 100);
      
      return true;
    } catch (e) {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    // Clear both localStorage and sessionStorage on logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
