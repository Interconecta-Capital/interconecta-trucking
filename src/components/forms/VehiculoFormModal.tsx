
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Upload, User, FileText, CreditCard, Calendar } from 'lucide-react';
import { DocumentUpload } from '@/components/forms/DocumentUpload';
import { useConductores } from '@/hooks/useConductores';
import { useVehiculoConductores } from '@/hooks/useVehiculoConductores';
import { toast } from 'sonner';

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  vehiculo?: any;
}

export function VehiculoFormModal({ open, onOpenChange, onSubmit, vehiculo }: VehiculoFormModalProps) {
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

  const [selectedConductores, setSelectedConductores] = useState<string[]>([]);
  const { conductores } = useConductores();
  const { asignarConductor, desasignarConductor } = useVehiculoConductores();

  useEffect(() => {
    if (vehiculo) {
      setFormData({
        placa: vehiculo.placa || '',
        marca: vehiculo.marca || '',
        modelo: vehiculo.modelo || '',
        anio: vehiculo.anio?.toString() || '',
        num_serie: vehiculo.num_serie || '',
        config_vehicular: vehiculo.config_vehicular || '',
        poliza_seguro: vehiculo.poliza_seguro || '',
        vigencia_seguro: vehiculo.vigencia_seguro || '',
        verificacion_vigencia: vehiculo.verificacion_vigencia || '',
        id_equipo_gps: vehiculo.id_equipo_gps || '',
        fecha_instalacion_gps: vehiculo.fecha_instalacion_gps || '',
        acta_instalacion_gps: vehiculo.acta_instalacion_gps || '',
        estado: vehiculo.estado || 'disponible'
      });
    } else {
      setFormData({
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
      setSelectedConductores([]);
    }
  }, [vehiculo, open]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleConductorToggle = (conductorId: string) => {
    setSelectedConductores(prev => {
      if (prev.includes(conductorId)) {
        return prev.filter(id => id !== conductorId);
      } else {
        return [...prev, conductorId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convertir año a número si está presente
      const dataToSubmit = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : null
      };

      await onSubmit(dataToSubmit);
      
      // Si es un vehículo nuevo y se creó exitosamente, asignar conductores
      if (!vehiculo && selectedConductores.length > 0) {
        // Aquí necesitaríamos el ID del vehículo recién creado
        // Por ahora mostramos un mensaje de éxito
        toast.success('Vehículo creado exitosamente');
      }
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast.error('Error al guardar el vehículo');
    }
  };

  const configVehicularOptions = [
    { value: 'C2', label: 'C2 - Camión Unitario' },
    { value: 'C3', label: 'C3 - Camión Unitario' },
    { value: 'T3S2', label: 'T3S2 - Tractocamión Semirremolque' },
    { value: 'T3S3', label: 'T3S3 - Tractocamión Semirremolque' }
  ];

  const estadoOptions = [
    { value: 'disponible', label: 'Disponible' },
    { value: 'en_uso', label: 'En Uso' },
    { value: 'mantenimiento', label: 'Mantenimiento' },
    { value: 'fuera_servicio', label: 'Fuera de Servicio' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Información Básica
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  value={formData.placa}
                  onChange={(e) => handleInputChange('placa', e.target.value)}
                  placeholder="Ej: ABC-123"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  value={formData.marca}
                  onChange={(e) => handleInputChange('marca', e.target.value)}
                  placeholder="Ej: Freightliner"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  value={formData.modelo}
                  onChange={(e) => handleInputChange('modelo', e.target.value)}
                  placeholder="Ej: Cascadia"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="anio">Año</Label>
                <Input
                  id="anio"
                  type="number"
                  value={formData.anio}
                  onChange={(e) => handleInputChange('anio', e.target.value)}
                  placeholder="2020"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_serie">Número de Serie</Label>
                <Input
                  id="num_serie"
                  value={formData.num_serie}
                  onChange={(e) => handleInputChange('num_serie', e.target.value)}
                  placeholder="Número de serie del vehículo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
                <Select value={formData.config_vehicular} onValueChange={(value) => handleInputChange('config_vehicular', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar configuración" />
                  </SelectTrigger>
                  <SelectContent>
                    {configVehicularOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select value={formData.estado} onValueChange={(value) => handleInputChange('estado', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadoOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información de Seguro */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Información de Seguro
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
                <Input
                  id="poliza_seguro"
                  value={formData.poliza_seguro}
                  onChange={(e) => handleInputChange('poliza_seguro', e.target.value)}
                  placeholder="Número de póliza"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
                <Input
                  id="vigencia_seguro"
                  type="date"
                  value={formData.vigencia_seguro}
                  onChange={(e) => handleInputChange('vigencia_seguro', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificacion_vigencia">Vigencia de Verificación</Label>
                <Input
                  id="verificacion_vigencia"
                  type="date"
                  value={formData.verificacion_vigencia}
                  onChange={(e) => handleInputChange('verificacion_vigencia', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Información GPS */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Información GPS
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id_equipo_gps">ID Equipo GPS</Label>
                <Input
                  id="id_equipo_gps"
                  value={formData.id_equipo_gps}
                  onChange={(e) => handleInputChange('id_equipo_gps', e.target.value)}
                  placeholder="Identificador del GPS"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_instalacion_gps">Fecha Instalación GPS</Label>
                <Input
                  id="fecha_instalacion_gps"
                  type="date"
                  value={formData.fecha_instalacion_gps}
                  onChange={(e) => handleInputChange('fecha_instalacion_gps', e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="acta_instalacion_gps">Acta de Instalación GPS</Label>
                <Textarea
                  id="acta_instalacion_gps"
                  value={formData.acta_instalacion_gps}
                  onChange={(e) => handleInputChange('acta_instalacion_gps', e.target.value)}
                  placeholder="Detalles del acta de instalación"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Carga de Documentos */}
          {vehiculo && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Documentos del Vehículo
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tarjeta de Circulación</Label>
                  <DocumentUpload
                    tipoDocumento="tarjeta_circulacion"
                    entidadTipo="vehiculo"
                    entidadId={vehiculo?.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Póliza de Seguro</Label>
                  <DocumentUpload
                    tipoDocumento="poliza_seguro"
                    entidadTipo="vehiculo"
                    entidadId={vehiculo?.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Verificación Vehicular</Label>
                  <DocumentUpload
                    tipoDocumento="verificacion"
                    entidadTipo="vehiculo"
                    entidadId={vehiculo?.id}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Factura del Vehículo</Label>
                  <DocumentUpload
                    tipoDocumento="factura"
                    entidadTipo="vehiculo"
                    entidadId={vehiculo?.id}
                  />
                </div>
              </div>
            </div>
          )}

          <Separator />

          {/* Asignación de Conductores */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Asignar Conductores
            </h3>
            
            {conductores.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Selecciona los conductores que pueden manejar este vehículo:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {conductores.map((conductor) => (
                    <div
                      key={conductor.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedConductores.includes(conductor.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleConductorToggle(conductor.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{conductor.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            Lic: {conductor.num_licencia || 'N/A'}
                          </p>
                        </div>
                        {selectedConductores.includes(conductor.id) && (
                          <Badge variant="default">Seleccionado</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {selectedConductores.length > 0 && (
                  <p className="text-sm text-green-600">
                    {selectedConductores.length} conductor(es) seleccionado(s)
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay conductores registrados</p>
                <p className="text-sm">Registra conductores primero para poder asignarlos</p>
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {vehiculo ? 'Actualizar' : 'Crear'} Vehículo
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
