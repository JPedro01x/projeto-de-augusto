import { ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Dumbbell,
  Calendar,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  UserCircle,
  Plus,
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // next-themes sets theme on the client; avoid reading it during SSR
  useEffect(() => {
    setMounted(true);
  }, []);

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Alunos', path: '/admin/students' },
    { icon: UserCircle, label: 'Instrutores', path: '/admin/instructors' },
    { icon: Dumbbell, label: 'Treinos', path: '/admin/workouts' },
    { icon: Calendar, label: 'Presença', path: '/admin/attendance' },
    { icon: DollarSign, label: 'Financeiro', path: '/admin/financial' },
    { icon: Settings, label: 'Configurações', path: '/admin/settings' },
  ];

  const instructorNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor' },
    { icon: Users, label: 'Meus Alunos', path: '/instructor/students' },
    { icon: Dumbbell, label: 'Treinos', path: '/instructor/workouts' },
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : instructorNavItems;

  return (
    <div className="min-h-screen flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-50 h-screen w-72 border-r border-border bg-card transition-transform duration-300 lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center transform rotate-12">
                <Dumbbell className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-bold text-lg">GymTech Pro</h2>
                <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3',
                      isActive && 'glow-primary'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-border space-y-2">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={logout}
            >
              <LogOut className="h-5 w-5" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (!mounted) return; // no-op during SSR/hydration
                  const current = resolvedTheme || theme;
                  setTheme(current === 'dark' ? 'light' : 'dark');
                }}
                aria-label="Toggle theme"
              >
                {/* show nothing until mounted to avoid hydration mismatch */}
                {mounted ? (resolvedTheme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : null}
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
