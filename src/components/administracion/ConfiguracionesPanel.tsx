
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings, Bell, Database, Security } from 'lucide-react';

export function ConfiguracionesPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Configuración de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Notificaciones por Email</Label>
            <Switch id="email-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="push-notifications">Notificaciones Push</Label>
            <Switch id="push-notifications" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-alerts">Alertas de Mantenimiento</Label>
            <Switch id="maintenance-alerts" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="document-expiry">Vencimiento de Documentos</Label>
            <Switch id="document-expiry" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración del Sistema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-backup">Respaldo Automático</Label>
            <Switch id="auto-backup" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="maintenance-mode">Modo Mantenimiento</Label>
            <Switch id="maintenance-mode" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="debug-mode">Modo Debug</Label>
            <Switch id="debug-mode" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Security className="h-5 w-5" />
            Configuración de Seguridad
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="two-factor">Autenticación de Dos Factores</Label>
            <Switch id="two-factor" />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="session-timeout">Timeout de Sesión</Label>
            <Switch id="session-timeout" defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="audit-log">Log de Auditoría</Label>
            <Switch id="audit-log" defaultChecked />
          </div>
          
          <Button className="w-full mt-4">
            <Settings className="h-4 w-4 mr-2" />
            Guardar Configuraciones
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
