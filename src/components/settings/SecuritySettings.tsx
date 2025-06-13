
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useSecureAuth } from '@/hooks/auth/useSecureAuth';
import { useSecurePasswordReset } from '@/hooks/auth/useSecurePasswordReset';
import { Shield, AlertTriangle, Key, Clock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

export function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  
  const { secureLogout, isLoading } = useSecureAuth();
  const { updatePassword, validatePasswordStrength } = useSecurePasswordReset();

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
      toast.error(validation.message);
      return;
    }

    const success = await updatePassword(newPassword);
    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleLogoutAllDevices = async () => {
    await secureLogout();
    toast.success('Sesión cerrada en todos los dispositivos');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold font-sora text-interconecta-text-primary">
          Configuración de Seguridad
        </h2>
        <p className="text-interconecta-text-secondary font-inter">
          Gestiona la seguridad de tu cuenta y sesiones
        </p>
      </div>

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Cambiar Contraseña
          </CardTitle>
          <CardDescription>
            Actualiza tu contraseña para mantener tu cuenta segura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Contraseña Actual</Label>
            <div className="relative">
              <Input
                id="current-password"
                type={showPasswords ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">Nueva Contraseña</Label>
            <Input
              id="new-password"
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar Nueva Contraseña</Label>
            <Input
              id="confirm-password"
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <Button 
            onClick={handlePasswordChange} 
            disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full"
          >
            {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
          </Button>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Autenticación de Dos Factores
          </CardTitle>
          <CardDescription>
            Añade una capa extra de seguridad a tu cuenta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Habilitar 2FA</Label>
              <p className="text-sm text-interconecta-text-secondary">
                {twoFactorEnabled ? 'Protección adicional activada' : 'Recomendado para mayor seguridad'}
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled}
              onCheckedChange={setTwoFactorEnabled}
            />
          </div>
          {twoFactorEnabled && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                La autenticación de dos factores está habilitada. 
                Tu cuenta tiene protección adicional.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Gestión de Sesiones
          </CardTitle>
          <CardDescription>
            Controla el tiempo de vida de tus sesiones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Tiempo de Expiración (minutos)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              min="5"
              max="480"
            />
            <p className="text-sm text-interconecta-text-secondary">
              Tiempo de inactividad antes de cerrar sesión automáticamente
            </p>
          </div>

          <Button 
            onClick={handleLogoutAllDevices}
            variant="destructive"
            className="w-full"
          >
            Cerrar Sesión en Todos los Dispositivos
          </Button>
        </CardContent>
      </Card>

      {/* Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Seguridad
          </CardTitle>
          <CardDescription>
            Configuraciones de notificaciones de seguridad
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Alertas de Inicio de Sesión</Label>
              <p className="text-sm text-interconecta-text-secondary">
                Notificar sobre nuevos inicios de sesión
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Cambios de Seguridad</Label>
              <p className="text-sm text-interconecta-text-secondary">
                Notificar sobre cambios en configuración de seguridad
              </p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Actividad Sospechosa</Label>
              <p className="text-sm text-interconecta-text-secondary">
                Alertar sobre actividad inusual en la cuenta
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
