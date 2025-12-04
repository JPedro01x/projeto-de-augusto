import { toast } from '@/components/ui/use-toast';

// Obter o token de autenticação
export const getAuthToken = (): string | null => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Obter o tipo de armazenamento atual (localStorage ou sessionStorage)
export const getAuthStorage = (): Storage => {
  return localStorage.getItem('token') ? localStorage : sessionStorage;
};

// Verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Função para fazer requisições autenticadas
export const fetchWithAuth = async (
  url: string, 
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  // Configurar cabeçalhos padrão
  const headers = new Headers(options.headers);
  
  // Adicionar cabeçalhos de autenticação se houver token
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Garantir que o tipo de conteúdo seja JSON
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Configurar opções da requisição
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include' as RequestCredentials, // Importante para enviar cookies
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    // Verificar se a resposta é um erro de autenticação
    if (response.status === 401) {
      // Token expirado ou inválido, fazer logout
      window.dispatchEvent(new Event('unauthorized'));
      throw new Error('Sessão expirada. Por favor, faça login novamente.');
    }

    // Se houver um erro na resposta, lançar uma exceção
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: 'Erro desconhecido' };
      }
      
      // Mostrar notificação de erro
      toast({
        title: 'Erro',
        description: errorData.message || 'Ocorreu um erro ao processar sua solicitação',
        variant: 'destructive',
      });
      
      throw new Error(errorData.message || 'Erro na requisição');
    }

    return response;
  } catch (error) {
    if (error instanceof Error) {
      // Se for um erro de rede ou outro erro de requisição
      toast({
        title: 'Erro de conexão',
        description: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        variant: 'destructive',
      });
    }
    throw error;
  }
};

// Função auxiliar para requisições GET
export const get = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'GET',
  });
  return response.json();
};

// Função auxiliar para requisições POST
export const post = async <T>(
  url: string, 
  data: any = null, 
  options: RequestInit = {}
): Promise<T> => {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'POST',
    body,
  });
  
  // Se a resposta não tiver conteúdo, retornar vazio
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Função auxiliar para requisições PUT
export const put = async <T>(
  url: string, 
  data: any, 
  options: RequestInit = {}
): Promise<T> => {
  const body = data instanceof FormData ? data : JSON.stringify(data);
  
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'PUT',
    body,
  });
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Função auxiliar para requisições DELETE
export const del = async <T>(
  url: string, 
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithAuth(url, {
    ...options,
    method: 'DELETE',
  });
  
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

// Função para verificar a sessão do usuário
export const checkSession = async (): Promise<boolean> => {
  try {
    const token = getAuthToken();
    if (!token) return false;
    
    const response = await fetchWithAuth('/api/auth/check-session');
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Configurar interceptador global para erros de autenticação
const setupAuthInterceptor = () => {
  window.addEventListener('unauthorized', () => {
    // Limpar dados de autenticação
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    
    // Redirecionar para a página de login
    if (window.location.pathname !== '/login') {
      const redirectUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
      window.location.href = `/login?redirect=${encodeURIComponent(redirectUrl)}`;
    }
  });
};

// Inicializar o interceptador quando o módulo for carregado
setupAuthInterceptor();
