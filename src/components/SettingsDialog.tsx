
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSuscripcion } from '@/hooks/useSuscripcion';
import { usePermisosSubscripcion } from '@/hooks/usePermisosSubscripcion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  CreditCard,
  Calendar,
  Shield,
  FileText,
  Settings,
  Users,
  Phone
} from 'lucide-react';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { user } = useAuth();
  const { 
    suscripcion, 
    enPeriodoPrueba, 
    diasRestantesPrueba,
    suscripcionVencida,
    estaBloqueado,
    abrirPortalCliente,
    isOpeningPortal
  } = useSuscripcion();
  const { obtenerUsoActual } = usePermisosSubscripcion();
  const [activeTab, setActiveTab] = useState('account');

  const usoActual = obtenerUsoActual();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración de Cuenta
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="space-y-2">
            <Button
              variant={activeTab === 'account' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('account')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Estado de Cuenta
            </Button>
            <Button
              variant={activeTab === 'billing' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('billing')}
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Facturación
            </Button>
            <Button
              variant={activeTab === 'invoices' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('invoices')}
            >
              <FileText className="h-4 w-4 mr-2" />
              Facturas
            </Button>
            <Button
              variant={activeTab === 'support' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('support')}
            >
              <Phone className="h-4 w-4 mr-2" />
              Soporte
            </Button>
          </div>

          {/* Content */}
          <div className="md:col-span-2">
            {activeTab === 'account' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Estado de la Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Plan Actual:</span>
                      <Badge variant={enPeriodoPrueba() ? 'secondary' : 'default'}>
                        {enPeriodoPrueba() ? 'Prueba Gratuita' : (suscripcion?.plan?.nombre || 'Plan Premium')}
                      </Badge>
                    </div>
                    
                    {enPeriodoPrueba() && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Días Restantes:</span>
                        <span className="text-sm font-bold text-orange-600">
                          {diasRestantesPrueba()} días
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">RFC:</span>
                      <span className="text-sm font-mono">
                        {user?.profile?.rfc || 'No especificado'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Empresa:</span>
                      <span className="text-sm">
                        {user?.profile?.empresa || 'No especificada'}
                      </span>
                    </div>

                    <Separator />

                    <div className="text-xs text-gray-500">
                      <p>* El RFC no puede ser modificado una vez registrado.</p>
                      <p>Para cambios contacta al soporte técnico.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Límites de Cuenta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {usoActual.cartas_porte.usado}
                        </div>
                        <div className="text-xs text-gray-600">Cartas Porte</div>
                        <div className="text-xs text-gray-500">
                          de {usoActual.cartas_porte.limite || '∞'} permitidas
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {usoActual.vehiculos.usado}
                        </div>
                        <div className="text-xs text-gray-600">Vehículos</div>
                        <div className="text-xs text-gray-500">
                          de {usoActual.vehiculos.limite || '∞'} permitidos
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {usoActual.conductores.usado}
                        </div>
                        <div className="text-xs text-gray-600">Conductores</div>
                        <div className="text-xs text-gray-500">
                          de {usoActual.conductores.limite || '∞'} permitidos
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {usoActual.socios.usado}
                        </div>
                        <div className="text-xs text-gray-600">Socios</div>
                        <div className="text-xs text-gray-500">
                          de {usoActual.socios.limite || '∞'} permitidos
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'billing' && (
              <Card>
                <CardHeader>
                  <CardTitle>Información de Facturación</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Próxima Facturación:</span>
                    <span className="text-sm">
                      {suscripcion?.proximo_pago ? new Date(suscripcion.proximo_pago).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Método de Pago:</span>
                    <Badge variant="outline">
                      {suscripcion?.stripe_customer_id ? 'Configurado' : 'No configurado'}
                    </Badge>
                  </div>

                  <Separator />

                  {suscripcion?.status === 'active' ? (
                    <Button 
                      onClick={() => abrirPortalCliente()}
                      disabled={isOpeningPortal}
                      className="w-full"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {isOpeningPortal ? 'Abriendo...' : 'Gestionar Suscripción'}
                    </Button>
                  ) : (
                    <Button className="w-full">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Agregar Método de Pago
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'invoices' && (
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Facturas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay facturas disponibles</p>
                    <p className="text-sm">Las facturas aparecerán aquí una vez que actualices tu plan.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'support' && (
              <Card>
                <CardHeader>
                  <CardTitle>Contactar Soporte</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm">¿Necesitas ayuda o tienes preguntas?</p>
                    <p className="text-sm text-gray-600">
                      Nuestro equipo de soporte está disponible para ayudarte.
                    </p>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="flex items-center justify-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar Soporte
                    </Button>
                    <Button variant="outline" className="flex items-center justify-center">
                      <Users className="h-4 w-4 mr-2" />
                      Chat en Vivo
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>• Horario: Lunes a Viernes 9:00 AM - 6:00 PM</p>
                    <p>• Tiempo de respuesta: Menos de 2 horas</p>
                    <p>• Soporte en español disponible</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
