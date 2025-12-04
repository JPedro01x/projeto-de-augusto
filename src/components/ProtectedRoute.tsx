import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Verificar autenticação quando o componente montar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Pequeno atraso para garantir que o contexto de autenticação seja atualizado
        await new Promise(resolve => setTimeout(resolve, 100));
        setAuthChecked(true);
      } catch (err) {
        console.error('Erro ao verificar autenticação:', err);
        setError('Erro ao verificar autenticação. Tente novamente.');
      }
    };

    checkAuth();
  }, [isAuthenticated, isLoading]);

  // Se estiver carregando, mostrar um indicador de carregamento
  if (isLoading || !authChecked) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  // Se houver erro
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription className="mb-4">
            {error}
          </AlertDescription>
          <Button 
            variant="outline" 
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Tentar novamente
          </Button>
        </Alert>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar para login
  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    // Armazenar a URL atual para redirecionar após o login
    const redirectTo = location.pathname !== '/login' 
      ? `${location.pathname}${location.search}${location.hash}` 
      : '/admin';
      
    return <Navigate to="/login" state={{ from: redirectTo }} replace />;
  }

  // Verifica se o usuário tem uma das funções permitidas
  const hasRequiredRole = user && allowedRoles.includes(user.role);
  
  if (!hasRequiredRole) {
    console.warn('Acesso negado. Função necessária:', allowedRoles, 'Função do usuário:', user?.role);
    
    // Se o usuário estiver tentando acessar uma rota sem permissão, mostrar mensagem
    if (location.pathname !== '/unauthorized') {
      return <Navigate to="/unauthorized" state={{ from: location, requiredRoles: allowedRoles }} replace />;
    }
    
    // Se já estiver na página de não autorizado, mostrar mensagem de erro
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Acesso Negado</AlertTitle>
          <AlertDescription className="mb-4">
            Você não tem permissão para acessar esta página. 
            {user?.role === 'admin' ? 'Como administrador, você tem acesso total ao sistema.' : 
             'Entre em contato com o administrador para solicitar acesso.'}
          </AlertDescription>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Voltar
            </Button>
            <Button 
              variant="default" 
              onClick={() => navigate('/')}
              className="flex-1"
            >
              Página Inicial
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
