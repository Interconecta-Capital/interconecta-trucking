
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

import { 
  Save, 
  MapPin, 
  Calendar, 
  AlertTriangle,
  Package,
  Edit
} from 'lucide-react';
import { Viaje, useViajesEstados } from '@/hooks/useViajesEstados';
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

  const { actualizarViaje, isUpdatingViaje } = useViajesEstados();

  useEffect(() => {
    setEditedViaje({
      fecha_inicio_programada: viaje.fecha_inicio_programada,
      fecha_fin_programada: viaje.fecha_fin_programada,
      observaciones: viaje.observaciones || '',
      estado: viaje.estado
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
      fecha_inicio_programada: viaje.fecha_inicio_programada,
      fecha_fin_programada: viaje.fecha_fin_programada,
      observaciones: viaje.observaciones || '',
      estado: viaje.estado
    });
    setHasChanges(false);
    setIsEditing(false);
  };

  const canEdit = () => {
    return viaje.estado === 'programado' || viaje.estado === 'en_transito';
  };

  const formatDateTimeLocal = (dateString: string | undefined | null): string => {
    // ✅ CORRECCIÓN: Validar que la fecha sea válida antes de formatear
    if (!dateString) {
      console.warn('⚠️ Fecha inválida recibida en formatDateTimeLocal:', dateString);
      return ''; // Retornar string vacío para inputs datetime-local
    }
    
    try {
      const date = new Date(dateString);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.warn('⚠️ Fecha inválida después de parsear:', dateString);
        return '';
      }
      
      return date.toISOString().slice(0, 16);
    } catch (error) {
      console.error('❌ Error formateando fecha:', dateString, error);
      return '';
    }
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
              Editar Viaje
              <Badge className={getEstadoBadgeColor()}>
                {viaje.estado.replace('_', ' ').toUpperCase()}
              </Badge>
            </CardTitle>
            <div className="flex gap-2">
              {!isEditing && canEdit() && (
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
        
        {!canEdit() && (
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

      {/* Información de Ruta - Solo Lectura */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información de Ruta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Origen</Label>
              <Input
                value={viaje.origen || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label>Destino</Label>
              <Input
                value={viaje.destino || ''}
                disabled
                className="bg-muted"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Programación - EDITABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {viaje.fecha_inicio_real && (
                  <div>
                    <Label>Fecha Real de Inicio</Label>
                    <Input
                      value={new Date(viaje.fecha_inicio_real).toLocaleString('es-MX')}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
                {viaje.fecha_fin_real && (
                  <div>
                    <Label>Fecha Real de Finalización</Label>
                    <Input
                      value={new Date(viaje.fecha_fin_real).toLocaleString('es-MX')}
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

      {/* Estado - EDITABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estado del Viaje
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={editedViaje.estado || viaje.estado}
                onValueChange={(value) => handleInputChange('estado', value)}
                disabled={!isEditing}
              >
                <SelectTrigger className={!isEditing ? 'bg-muted' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programado">Programado</SelectItem>
                  <SelectItem value="en_transito">En Tránsito</SelectItem>
                  <SelectItem value="retrasado">Retrasado</SelectItem>
                  <SelectItem value="completado">Completado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Observaciones - EDITABLE */}
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
