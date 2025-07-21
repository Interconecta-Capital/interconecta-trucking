
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Truck, 
  User, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Package,
  Edit,
  Calculator
} from 'lucide-react';
import { Viaje, useViajesEstados } from '@/hooks/useViajesEstados';
import { CostosViajeSmart } from '../costos/CostosViajeSmart';
import { toast } from 'sonner';

interface ViajeEditorProps {
  viaje: Viaje;
  onViajeUpdate: () => void;
  onClose: () => void;
}

export const ViajeEditor: React.FC<ViajeEditorProps> = ({
  viaje,
  onViajeUpdate,
  onClose
}) => {
  const [editedViaje, setEditedViaje] = useState<Partial<Viaje>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const { actualizarViaje, isUpdatingViaje } = useViajesEstados();

  useEffect(() => {
    setEditedViaje({
      origen: viaje.origen,
      destino: viaje.destino,
      fecha_inicio_programada: viaje.fecha_inicio_programada,
      fecha_fin_programada: viaje.fecha_fin_programada,
      observaciones: viaje.observaciones || '',
      conductor_id: viaje.conductor_id,
      vehiculo_id: viaje.vehiculo_id
    });
  }, [viaje]);

  const handleInputChange = (field: keyof Viaje, value: any) => {
    setEditedViaje(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!hasChanges) {
      toast.info('No hay cambios para guardar');
      return;
    }

    try {
      await actualizarViaje({
        id: viaje.id,
        updates: editedViaje
      });

      toast.success('Viaje actualizado correctamente');
      setHasChanges(false);
      setIsEditing(false);
      onViajeUpdate();
    } catch (error) {
      console.error('Error actualizando viaje:', error);
      toast.error('Error al actualizar el viaje');
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      const confirmDiscard = confirm('¿Descartar los cambios realizados?');
      if (!confirmDiscard) return;
    }
    
    setEditedViaje({
      origen: viaje.origen,
      destino: viaje.destino,
      fecha_inicio_programada: viaje.fecha_inicio_programada,
      fecha_fin_programada: viaje.fecha_fin_programada,
      observaciones: viaje.observaciones || '',
      conductor_id: viaje.conductor_id,
      vehiculo_id: viaje.vehiculo_id
    });
    setHasChanges(false);
    setIsEditing(false);
  };

  const canEdit = () => {
    return viaje.estado === 'programado' || viaje.estado === 'en_transito';
  };

  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const getEstadoBadgeColor = () => {
    switch (viaje.estado) {
      case 'programado': return 'bg-blue-500 text-white';
      case 'en_transito': return 'bg-green-500 text-white';
      case 'completado': return 'bg-green-600 text-white';
      case 'cancelado': return 'bg-red-500 text-white';
      case 'retrasado': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6 viaje-editor-form">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Edit className="h-6 w-6" />
              Editar Viaje - {viaje.carta_porte_id}
              <Badge className={getEstadoBadgeColor()}>
                {viaje.estado.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing && canEdit() && activeTab === 'general' && (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {isEditing && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={isUpdatingViaje}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!hasChanges || isUpdatingViaje}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdatingViaje ? 'Guardando...' : 'Guardar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        
        {!canEdit() && activeTab === 'general' && (
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este viaje no puede ser editado debido a su estado actual: {viaje.estado}
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Tabs para organizar secciones */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="costos" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Costos
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          {/* Información de Ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Información de Ruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 viaje-editor-grid">
                <div>
                  <Label htmlFor="origen">Origen</Label>
                  <Input
                    id="origen"
                    value={editedViaje.origen || ''}
                    onChange={(e) => handleInputChange('origen', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="destino">Destino</Label>
                  <Input
                    id="destino"
                    value={editedViaje.destino || ''}
                    onChange={(e) => handleInputChange('destino', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Programación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 viaje-editor-grid">
                <div>
                  <Label htmlFor="fecha-inicio">Fecha y Hora de Inicio</Label>
                  <Input
                    id="fecha-inicio"
                    type="datetime-local"
                    value={formatDateTimeLocal(editedViaje.fecha_inicio_programada || viaje.fecha_inicio_programada)}
                    onChange={(e) => handleInputChange('fecha_inicio_programada', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="fecha-fin">Fecha y Hora de Llegada</Label>
                  <Input
                    id="fecha-fin"
                    type="datetime-local"
                    value={formatDateTimeLocal(editedViaje.fecha_fin_programada || viaje.fecha_fin_programada)}
                    onChange={(e) => handleInputChange('fecha_fin_programada', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                  />
                </div>
              </div>

              {/* Mostrar fechas reales si existen */}
              {(viaje.fecha_inicio_real || viaje.fecha_fin_real) && (
                <>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 viaje-editor-grid">
                    {viaje.fecha_inicio_real && (
                      <div>
                        <Label>Fecha Real de Inicio</Label>
                        <Input
                          value={new Date(viaje.fecha_inicio_real).toLocaleString()}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                    {viaje.fecha_fin_real && (
                      <div>
                        <Label>Fecha Real de Finalización</Label>
                        <Input
                          value={new Date(viaje.fecha_fin_real).toLocaleString()}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Recursos Asignados */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Recursos Asignados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 viaje-editor-grid">
                <div>
                  <Label htmlFor="vehiculo">Vehículo</Label>
                  <Input
                    id="vehiculo"
                    value={editedViaje.vehiculo_id || 'No asignado'}
                    onChange={(e) => handleInputChange('vehiculo_id', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    placeholder="ID del vehículo"
                  />
                </div>
                <div>
                  <Label htmlFor="conductor">Conductor</Label>
                  <Input
                    id="conductor"
                    value={editedViaje.conductor_id || 'No asignado'}
                    onChange={(e) => handleInputChange('conductor_id', e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? 'bg-muted' : ''}
                    placeholder="ID del conductor"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Observaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="observaciones">Observaciones del Viaje</Label>
                <Textarea
                  id="observaciones"
                  value={editedViaje.observaciones || ''}
                  onChange={(e) => handleInputChange('observaciones', e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? 'bg-muted' : ''}
                  rows={4}
                  placeholder="Detalles adicionales del viaje..."
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costos" className="space-y-6">
          <CostosViajeSmart viaje={viaje} onCostosUpdate={onViajeUpdate} />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          {/* Información del tracking data si existe */}
          {viaje.tracking_data && (
            <Card>
              <CardHeader>
                <CardTitle>Datos del Wizard Original</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted rounded-lg">
                  <pre className="text-xs text-muted-foreground overflow-auto max-h-32">
                    {JSON.stringify(viaje.tracking_data, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Cambios pendientes */}
      {hasChanges && isEditing && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tienes cambios sin guardar. Asegúrate de guardar antes de salir.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
