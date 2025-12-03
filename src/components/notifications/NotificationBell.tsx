import { Bell, BellRing, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/use-notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead,
    isLoading 
  } = useNotifications();

  const hasUnread = unreadCount > 0;

  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Bell className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {hasUnread ? (
            <BellRing className="h-5 w-5 text-yellow-500" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {hasUnread && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-xs font-medium text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 max-h-[400px] overflow-y-auto" align="end">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {hasUnread && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                markAllAsRead();
              }}
              className="text-xs text-primary hover:underline"
            >
              Marcar todas como lidas
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma notificação
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-accent/50",
                  !notification.read && "bg-accent/30"
                )}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  // Aqui você pode adicionar navegação para a página relacionada
                }}
              >
                <div className="flex justify-between w-full items-start">
                  <h4 className="font-medium text-sm">{notification.title}</h4>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {notification.message}
                </p>
                <div className="flex justify-between w-full mt-1">
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                      locale: ptBR
                    })}
                  </span>
                  {notification.type === 'payment' && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      Pagamento
                    </span>
                  )}
                </div>
              </DropdownMenuItem>
            ))}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
