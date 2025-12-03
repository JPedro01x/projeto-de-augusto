import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleBack = () => {
    const isAdmin = user?.role === 'admin';
    const isInstructor = user?.role === 'instructor';

    if (isAdmin) {
      navigate('/admin');
    } else if (isInstructor) {
      navigate('/instructor');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <Shield className="w-10 h-10 text-destructive" />
        </div>
        
        <h1 className="text-4xl font-bold text-gradient">Acesso Negado</h1>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            Você não tem permissão para acessar esta página.
            {user && (
              <> Seu perfil atual é: <span className="font-semibold">{user.role}</span>.</>
            )}
          </p>

          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4 justify-center">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Voltar para área segura
            </Button>
            
            <Button
              variant="destructive"
              onClick={logout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;