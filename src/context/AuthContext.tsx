import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWithAuth, getAuthStorage } from '@/utils/http';

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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = '/api'; // Usando o prefixo /api para todas as requisições

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Função para fazer logout
  const logout = useCallback(() => {
    setUser(null);
    // Limpar ambos os armazenamentos ao fazer logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');

    // Disparar evento de logout
    window.dispatchEvent(new Event('auth-state-changed'));

    // Navegar para a página de login
    navigate('/login', { replace: true });
  }, [navigate]);

  // Função para verificar a autenticação
  const checkAuth = useCallback(() => {
    try {
      const storage = getAuthStorage();
      const storedUser = storage.getItem('user');
      const token = storage.getItem('token');

      if (storedUser && token) {
        console.log('Usuário encontrado no armazenamento');
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return true;
      } else {
        console.log('Nenhum usuário autenticado encontrado');
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Erro ao carregar usuário do armazenamento:', error);
      setUser(null);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Função para verificar a sessão
  const checkSession = useCallback(async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (!token) {
        console.log('Nenhum token encontrado, deslogando...');
        logout();
        return;
      }

      const response = await fetch('http://localhost:3000/api/auth/check-session', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.log('Sessão inválida, fazendo logout...');
        logout();
      }
    } catch (error) {
      console.error('Erro ao verificar sessão:', error);
      logout();
    }
  }, [logout]);

  // Efeito para verificar autenticação inicial e configurar listeners
  useEffect(() => {
    // Verificar autenticação inicial
    checkAuth();

    // Função para lidar com mudanças de autenticação
    const handleAuthChange = () => {
      console.log('Evento de mudança de autenticação detectado');
      checkAuth();
    };

    // Adicionar listener para eventos de mudança de autenticação
    window.addEventListener('auth-state-changed', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Verificar na montagem
    checkSession();

    // Verificar a cada 5 minutos
    const sessionCheckInterval = setInterval(checkSession, 5 * 60 * 1000);

    // Limpar listeners e intervalo ao desmontar
    return () => {
      window.removeEventListener('auth-state-changed', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      clearInterval(sessionCheckInterval);
    };
  }, [checkAuth, checkSession]);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<boolean> => {
    try {
      console.log('Tentando fazer login com:', { email });

      // Verificar se o backend está acessível
      try {
        const healthResponse = await fetchWithAuth('http://localhost:3000/api/health', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
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

      // Fazer a requisição de login
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cache': 'no-cache'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
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

      // Atualizar o estado do usuário
      setUser(mappedUser);

      // Disparar evento de login bem-sucedido
      window.dispatchEvent(new Event('auth-state-changed'));

      // Navegar com base na função do usuário com pequeno atraso para garantir a atualização do estado
      const redirectPath = mappedUser.role === 'admin'
        ? '/admin'
        : mappedUser.role === 'instructor'
          ? '/instructor/dashboard'
          : '/student/dashboard';

      console.log(`Redirecionando usuário ${mappedUser.role} para:`, redirectPath);
      navigate(redirectPath, { replace: true });

      return true;
    } catch (e) {
      return false;
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
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
