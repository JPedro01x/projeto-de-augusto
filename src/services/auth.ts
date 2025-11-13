// Função para obter o token de autenticação
export const getToken = (): string | null => {
  // Verifica primeiro no localStorage, depois no sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

// Função para verificar se o usuário está autenticado
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Função para armazenar o token
export const setAuthToken = (token: string, rememberMe: boolean = false): void => {
  if (rememberMe) {
    localStorage.setItem('token', token);
  } else {
    sessionStorage.setItem('token', token);
  }
};

// Função para remover o token (logout)
export const removeAuthToken = (): void => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Função para obter o usuário logado
export const getCurrentUser = (): any => {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Função para armazenar os dados do usuário
export const setCurrentUser = (user: any, rememberMe: boolean = false): void => {
  const userString = JSON.stringify(user);
  if (rememberMe) {
    localStorage.setItem('user', userString);
  } else {
    sessionStorage.setItem('user', userString);
  }
};

// Função para remover os dados do usuário (logout)
export const removeCurrentUser = (): void => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
};
