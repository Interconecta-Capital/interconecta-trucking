
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVehiculos } from '@/hooks/useVehiculos';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';
import { DocumentUpload } from './DocumentUpload';
import { EstadoSelector } from './EstadoSelector';
import { ProgramarModal } from './ProgramarModal';
import { Truck, Calendar, MapPin, Wrench } from 'lucide-react';
import { toast } from 'sonner';

interface VehiculoFormCompleteProps {
  vehiculoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const VehiculoFormComplete = ({ vehiculoId, onSuccess, onCancel }: VehiculoFormCompleteProps) => {
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    num_serie: '',
    config_vehicular: '',
    poliza_seguro: '',
    vigencia_seguro: '',
    verificacion_vigencia: '',
    id_equipo_gps: '',
    fecha_instalacion_gps: '',
    acta_instalacion_gps: '',
    estado: 'disponible'
  });

  const [showProgramarModal, setShowProgramarModal] = useState(false);
  const { crearVehiculo, updateVehiculo, vehiculos, isLoading } = useVehiculos();
  const { documentos, cargarDocumentos } = useDocumentosEntidades();

  const vehiculoActual = vehiculoId ? vehiculos.find(v => v.id === vehiculoId) : null;

  useEffect(() => {
    if (vehiculoActual) {
      setFormData({
        placa: vehiculoActual.placa || '',
        marca: vehiculoActual.marca || '',
        modelo: vehiculoActual.modelo || '',
        anio: vehiculoActual.anio?.toString() || '',
        num_serie: vehiculoActual.num_serie || '',
        config_vehicular: vehiculoActual.config_vehicular || '',
        poliza_seguro: vehiculoActual.poliza_seguro || '',
        vigencia_seguro: vehiculoActual.vigencia_seguro || '',
        verificacion_vigencia: vehiculoActual.verificacion_vigencia || '',
        id_equipo_gps: vehiculoActual.id_equipo_gps || '',
        fecha_instalacion_gps: vehiculoActual.fecha_instalacion_gps || '',
        acta_instalacion_gps: vehiculoActual.acta_instalacion_gps || '',
        estado: vehiculoActual.estado || 'disponible'
      });
      
      cargarDocumentos('vehiculo', vehiculoId);
    }
  }, [vehiculoActual, vehiculoId, cargarDocumentos]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.placa) {
      toast.error('La placa es requerida');
      return;
    }

    const vehiculoData = {
      ...formData,
      anio: formData.anio ? parseInt(formData.anio) : undefined,
      activo: true
    };

    if (vehiculoId) {
      updateVehiculo({ id: vehiculoId, ...vehiculoData });
    } else {
      crearVehiculo(vehiculoData);
    }

    if (onSuccess) {
      onSuccess();
    }
  };

  const handleEstadoChange = () => {
    // Recargar datos del vehículo si es necesario
    if (onSuccess) onSuccess();
  };

  const handleDocumentosChange = () => {
    if (vehiculoId) {
      cargarDocumentos('vehiculo', vehiculoId);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculoId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => setFormData(prev => ({ ...prev, placa: e.target.value.toUpperCase() }))}
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div>
                <Label htmlFor="marca">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => setFormData(prev => ({ ...prev, marca: e.target.value }))}
                  placeholder="Toyota, Ford, etc."
                />
              </div>
              <div>
                <Label htmlFor="modelo">Modelo</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => setFormData(prev => ({ ...prev, modelo: e.target.value }))}
                  placeholder="Hilux, F-150, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                  value={formData.anio}
                  onChange={(e) => setFormData(prev => ({ ...prev, anio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="num_serie">Número de Serie</Label>
                <Input
                  id="num_serie"
                  value={formData.num_serie}
                  onChange={(e) => setFormData(prev => ({ ...prev, num_serie: e.target.value }))}
                  placeholder="VIN"
                />
              </div>
            </div>

            {/* Configuración Vehicular */}
            <div>
              <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
              <Select 
                value={formData.config_vehicular} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, config_vehicular: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar configuración..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C2">C2 - Camión Unitario</SelectItem>
                  <SelectItem value="C3">C3 - Camión con Remolque</SelectItem>
                  <SelectItem value="T3S2">T3S2 - Tractocamión Semirremolque</SelectItem>
                  <SelectItem value="T3S3">T3S3 - Tractocamión Semirremolque</SelectItem>
                  <SelectItem value="B2">B2 - Autobús</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Información del Seguro */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
                <Input
                  id="poliza_seguro"
                  value={formData.poliza_seguro}
                  onChange={(e) => setFormData(prev => ({ ...prev, poliza_seguro: e.target.value }))}
                  placeholder="Número de póliza"
                />
              </div>
              <div>
                <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
                <Input
                  id="vigencia_seguro"
                  type="date"
                  value={formData.vigencia_seguro}
                  onChange={(e) => setFormData(prev => ({ ...prev, vigencia_seguro: e.target.value }))}
                />
              </div>
            </div>

            {/* Verificación Vehicular */}
            <div>
              <Label htmlFor="verificacion_vigencia">Vigencia de Verificación</Label>
              <Input
                id="verificacion_vigencia"
                type="date"
                value={formData.verificacion_vigencia}
                onChange={(e) => setFormData(prev => ({ ...prev, verificacion_vigencia: e.target.value }))}
              />
            </div>

            {/* Información GPS */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Información GPS
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="id_equipo_gps">ID Equipo GPS</Label>
                  <Input
                    id="id_equipo_gps"
                    value={formData.id_equipo_gps}
                    onChange={(e) => setFormData(prev => ({ ...prev, id_equipo_gps: e.target.value }))}
                    placeholder="ID del dispositivo GPS"
                  />
                </div>
                <div>
                  <Label htmlFor="fecha_instalacion_gps">Fecha de Instalación</Label>
                  <Input
                    id="fecha_instalacion_gps"
                    type="date"
                    value={formData.fecha_instalacion_gps}
                    onChange={(e) => setFormData(prev => ({ ...prev, fecha_instalacion_gps: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="acta_instalacion_gps">Acta de Instalación</Label>
                <Input
                  id="acta_instalacion_gps"
                  value={formData.acta_instalacion_gps}
                  onChange={(e) => setFormData(prev => ({ ...prev, acta_instalacion_gps: e.target.value }))}
                  placeholder="Número de acta o referencia"
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Guardando...' : (vehiculoId ? 'Actualizar' : 'Crear')}
              </Button>
              
              {vehiculoId && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowProgramarModal(true)}
                  className="ml-auto"
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Programar
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Estado y Documentos (solo para edición) */}
      {vehiculoId && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EstadoSelector
            entidadTipo="vehiculo"
            entidadId={vehiculoId}
            estadoActual={formData.estado}
            onEstadoChange={handleEstadoChange}
          />
          
          <DocumentUpload
            entidadTipo="vehiculo"
            entidadId={vehiculoId}
            documentos={documentos}
            onDocumentosChange={handleDocumentosChange}
          />
        </div>
      )}

      {/* Modal Programar */}
      {vehiculoId && (
        <ProgramarModal
          open={showProgramarModal}
          onOpenChange={setShowProgramarModal}
          entidadTipo="vehiculo"
          entidadId={vehiculoId}
          onSuccess={() => {
            setShowProgramarModal(false);
            handleEstadoChange();
          }}
        />
      )}
    </div>
  );
};
