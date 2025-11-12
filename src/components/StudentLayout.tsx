import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Calendar, DollarSign, Users, Dumbbell, LogOut, Menu, X, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from 'next-themes';

interface StudentLayoutProps { children: ReactNode }

const StudentLayout = ({ children }: StudentLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { icon: LayoutDashboard, label: 'Meu Perfil', path: '/student' },
    { icon: Calendar, label: 'Presença', path: '/student/attendance' },
    { icon: DollarSign, label: 'Financeiro', path: '/student/finance' },
    { icon: Users, label: 'Treinadores', path: '/student/trainers' },
    { icon: Dumbbell, label: 'Treinos', path: '/student/workouts' },
  ];

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <aside className={cn('fixed lg:sticky top-0 left-0 z-50 h-screen w-72 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0', sidebarOpen ? 'translate-x-0' : '-translate-x-full')}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-bold text-lg">Área do Aluno</h2>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button variant={isActive ? 'default' : 'ghost'} className={cn('w-full justify-start gap-3', isActive && 'glow-primary')} onClick={() => setSidebarOpen(false)}>
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" className="w-full justify-start gap-3" onClick={logout}>
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-screen w-full">
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 p-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (!mounted) return;
                  const current = resolvedTheme || theme;
                  setTheme(current === 'dark' ? 'light' : 'dark');
                }}
                aria-label="Toggle theme"
              >
                {mounted ? (resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : null}
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};

export default StudentLayout;
