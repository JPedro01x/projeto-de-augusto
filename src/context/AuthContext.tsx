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
        const healthCheck = await fetch('http://localhost:3000/health');
        console.log('Status do health check:', healthCheck.status);
      } catch (healthError) {
        console.error('Erro ao conectar ao backend:', healthError);
        alert('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
        return false;
      }

      console.log('Enviando requisição para:', `${API_BASE}/auth/login`);
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // Importante para enviar cookies se estiver usando
      });
      
      console.log('Resposta do servidor:', {
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries())
      });
      
      if (!res.ok) {
        let errorData;
        try {
          errorData = await res.json();
          console.error('Erro na resposta:', errorData);
        } catch (e) {
          const text = await res.text();
          console.error('Erro ao processar resposta de erro:', text);
          throw new Error(`Erro no servidor: ${res.status} ${res.statusText}`);
        }
        throw new Error(errorData.message || 'Falha na autenticação');
      }
      const data = await res.json();
      // data: { token, user: { id, name, email, userType } }
      const mappedUser: User = {
        id: String(data.user.id),
        name: data.user.name,
        email: data.user.email,
        role: data.user.userType as UserRole,
      };

      setUser(mappedUser);

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(mappedUser));
      storage.setItem('token', data.token);

      // Navigate based on role
      if (mappedUser.role === 'admin') {
        navigate('/admin');
      } else if (mappedUser.role === 'instructor') {
        navigate('/instructor');
      } else {
        navigate('/student');
      }
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
