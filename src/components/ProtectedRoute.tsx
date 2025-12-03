import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  // Log para depuração
  useEffect(() => {
    console.log('ProtectedRoute - Verificando acesso:', {
      isAuthenticated,
      userRole: user?.role,
      allowedRoles,
      currentPath: location.pathname
    });
  }, [isAuthenticated, user, allowedRoles, location.pathname]);

  if (!isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verifica se o usuário tem uma das funções permitidas
  const hasRequiredRole = user && allowedRoles.includes(user.role);
  
  if (!hasRequiredRole) {
    console.warn('Acesso negado. Função necessária:', allowedRoles, 'Função do usuário:', user?.role);
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
