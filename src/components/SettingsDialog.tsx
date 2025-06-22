
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, User, Shield, CreditCard, Bell } from 'lucide-react';
import { PlanBadge } from '@/components/common/PlanBadge';
import { useUnifiedPermissionsV2 } from '@/hooks/useUnifiedPermissionsV2';

interface SettingsDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const permissions = useUnifiedPermissionsV2();

  const isOpen = open !== undefined ? open : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="account">
              <User className="h-4 w-4 mr-2" />
              Cuenta
            </TabsTrigger>
            <TabsTrigger value="plan">
              <CreditCard className="h-4 w-4 mr-2" />
              Plan
            </TabsTrigger>
            <TabsTrigger value="permissions">
              <Shield className="h-4 w-4 mr-2" />
              Permisos
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notificaciones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de la Cuenta</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Estado de la Cuenta</label>
                  <p className="text-sm text-gray-600">{permissions.accessReason}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Plan Actual</label>
                  <div className="mt-1">
                    <PlanBadge size="md" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plan" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información del Plan</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Plan Activo</label>
                  <p className="text-sm text-gray-600">{permissions.planInfo.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Tipo de Acceso</label>
                  <p className="text-sm text-gray-600">
                    {permissions.accessLevel === 'superuser' && 'Superusuario - Acceso Total'}
                    {permissions.accessLevel === 'trial' && `Período de Prueba - ${permissions.planInfo.daysRemaining || 0} días restantes`}
                    {permissions.accessLevel === 'paid' && 'Plan Pagado Activo'}
                    {permissions.accessLevel === 'blocked' && 'Cuenta Bloqueada'}
                    {permissions.accessLevel === 'expired' && 'Plan Expirado'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium">Límites de Uso</label>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Conductores: {permissions.usage.conductores.limit === null ? 'Ilimitado' : `${permissions.usage.conductores.used}/${permissions.usage.conductores.limit}`}</p>
                    <p>Vehículos: {permissions.usage.vehiculos.limit === null ? 'Ilimitado' : `${permissions.usage.vehiculos.used}/${permissions.usage.vehiculos.limit}`}</p>
                    <p>Socios: {permissions.usage.socios.limit === null ? 'Ilimitado' : `${permissions.usage.socios.used}/${permissions.usage.socios.limit}`}</p>
                    <p>Cartas Porte: {permissions.usage.cartas_porte.limit === null ? 'Ilimitado' : `${permissions.usage.cartas_porte.used}/${permissions.usage.cartas_porte.limit}`}</p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Estado de Permisos</h3>
              <div className="grid gap-4">
                <div>
                  <label className="text-sm font-medium">Permisos de Creación</label>
                  <div className="space-y-2 text-sm">
                    <p className={permissions.canCreateConductor.allowed ? 'text-green-600' : 'text-red-600'}>
                      Conductores: {permissions.canCreateConductor.allowed ? '✓ Permitido' : '✗ Bloqueado'} - {permissions.canCreateConductor.reason}
                    </p>
                    <p className={permissions.canCreateVehiculo.allowed ? 'text-green-600' : 'text-red-600'}>
                      Vehículos: {permissions.canCreateVehiculo.allowed ? '✓ Permitido' : '✗ Bloqueado'} - {permissions.canCreateVehiculo.reason}
                    </p>
                    <p className={permissions.canCreateSocio.allowed ? 'text-green-600' : 'text-red-600'}>
                      Socios: {permissions.canCreateSocio.allowed ? '✓ Permitido' : '✗ Bloqueado'} - {permissions.canCreateSocio.reason}
                    </p>
                    <p className={permissions.canCreateCartaPorte.allowed ? 'text-green-600' : 'text-red-600'}>
                      Cartas Porte: {permissions.canCreateCartaPorte.allowed ? '✓ Permitido' : '✗ Bloqueado'} - {permissions.canCreateCartaPorte.reason}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configuración de Notificaciones</h3>
              <p className="text-sm text-gray-600">
                Las notificaciones se gestionan automáticamente según tu plan actual.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
