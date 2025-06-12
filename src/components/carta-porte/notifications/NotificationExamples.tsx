
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextualAlert } from '@/components/ui/contextual-alert';
import { useNotifications } from '@/hooks/useNotifications';
import { useFloatingNotifications } from '@/hooks/useFloatingNotifications';
import { Bell } from 'lucide-react';

export function NotificationExamples() {
  const notifications = useNotifications();
  const floatingNotifications = useFloatingNotifications();

  const handleTestToast = () => {
    notifications.cartaPorte.xmlGenerado();
  };

  const handleTestFloating = () => {
    floatingNotifications.addNotification({
      type: 'warning',
      title: 'Material Peligroso Detectado',
      message: 'Esta mercancía requiere documentación adicional según normativas SAT'
    });
  };

  const handleTestError = () => {
    notifications.cartaPorte.errorTimbrado('Error de conexión con el PAC');
  };

  const handleTestWarning = () => {
    floatingNotifications.addNotification({
      type: 'warning',
      title: 'Peso Excesivo',
      message: 'El peso de la carga excede los límites permitidos: 45000 kg'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bell className="h-5 w-5" />
          <span>Sistema de Notificaciones</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Alertas Contextuales */}
        <div className="space-y-4">
          <h3 className="font-medium">Alertas Contextuales</h3>
          
          <ContextualAlert
            type="warning"
            title="Material Peligroso Detectado"
            message="Esta mercancía requiere documentación adicional según normativas SAT"
            action={{
              label: "Ver Requisitos",
              onClick: () => console.log("Mostrando requisitos...")
            }}
            dismissible
            onDismiss={() => console.log("Alerta dismissada")}
          />

          <ContextualAlert
            type="success"
            message="Todos los datos han sido validados correctamente"
          />

          <ContextualAlert
            type="info"
            title="Ruta Optimizada"
            message="Se encontró una ruta más eficiente que ahorra 45 km"
            action={{
              label: "Aplicar",
              onClick: () => console.log("Aplicando ruta optimizada...")
            }}
          />
        </div>

        {/* Ejemplos de Notificaciones */}
        <div className="space-y-4">
          <h3 className="font-medium">Ejemplos de Notificaciones</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Button onClick={handleTestToast} variant="outline">
              Toast: XML Generado
            </Button>
            
            <Button onClick={handleTestFloating} variant="outline">
              Flotante: Material Peligroso
            </Button>
            
            <Button onClick={handleTestError} variant="destructive">
              Error: Timbrado
            </Button>
            
            <Button onClick={handleTestWarning} variant="outline">
              Advertencia: Peso Excesivo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
