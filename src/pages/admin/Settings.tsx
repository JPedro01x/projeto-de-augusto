import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Building, Bell, Shield, Palette, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { toast } = useToast();
  const [gymName, setGymName] = useState('GymTech Pro');
  const [gymEmail, setGymEmail] = useState('contato@gmail.com');
  const [gymPhone, setGymPhone] = useState('(11) 3456-7890');
  const [gymAddress, setGymAddress] = useState('Rua das Academias, 123');
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
  });

  const handleSaveGeneral = () => {
    toast({
      title: 'Configurações salvas!',
      description: 'As informações da academia foram atualizadas.',
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: 'Notificações atualizadas!',
      description: 'Suas preferências de notificação foram salvas.',
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gradient">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie as configurações do sistema</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" />
              Informações da Academia
            </CardTitle>
            <CardDescription>
              Configure os dados principais da sua academia
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="gym-name">Nome da Academia</Label>
              <Input
                id="gym-name"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gym-email">Email</Label>
              <Input
                id="gym-email"
                type="email"
                value={gymEmail}
                onChange={(e) => setGymEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gym-phone">Telefone</Label>
              <Input
                id="gym-phone"
                value={gymPhone}
                onChange={(e) => setGymPhone(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gym-address">Endereço</Label>
              <Textarea
                id="gym-address"
                value={gymAddress}
                onChange={(e) => setGymAddress(e.target.value)}
                rows={3}
              />
            </div>

            <Button variant="gradient" className="w-full" onClick={handleSaveGeneral}>
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Gerencie como você recebe notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Notificações por Email</Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas importantes por email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, email: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="sms-notifications">Notificações por SMS</Label>
                <p className="text-sm text-muted-foreground">
                  Receba mensagens de texto para eventos urgentes
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, sms: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">Notificações Push</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações no navegador
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) =>
                  setNotifications({ ...notifications, push: checked })
                }
              />
            </div>

            <Button variant="gradient" className="w-full" onClick={handleSaveNotifications}>
              Salvar Preferências
            </Button>
          </CardContent>
        </Card>

        {/* Plans Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Planos e Valores
            </CardTitle>
            <CardDescription>
              Configure os planos disponíveis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {[
                { name: 'Mensal', price: '99,90' },
                { name: 'Trimestral', price: '279,90' },
                { name: 'Semestral', price: '539,90' },
                { name: 'Anual', price: '999,90' },
              ].map((plan) => (
                <div key={plan.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <span className="font-medium">{plan.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">R$</span>
                    <Input
                      defaultValue={plan.price}
                      className="w-24"
                    />
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Novo Plano
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Segurança
            </CardTitle>
            <CardDescription>
              Gerencie a segurança da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input id="current-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input id="new-password" type="password" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input id="confirm-password" type="password" />
            </div>

            <Button variant="gradient" className="w-full">
              Alterar Senha
            </Button>

            <div className="pt-4 border-t border-border">
              <Button variant="outline" className="w-full">
                Ativar Autenticação em Dois Fatores
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
