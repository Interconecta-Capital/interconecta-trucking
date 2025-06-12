import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, Truck, FileText, Users, X } from 'lucide-react';
import { DocumentUpload } from './DocumentUpload';
import { useConductores } from '@/hooks/useConductores';
import { useVehiculoConductores } from '@/hooks/useVehiculoConductores';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';

const vehiculoSchema = z.object({
  placa: z.string().min(1, 'La placa es requerida').max(10, 'Máximo 10 caracteres'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().optional(),
  num_serie: z.string().optional(),
  config_vehicular: z.string().optional(),
  poliza_seguro: z.string().optional(),
  vigencia_seguro: z.string().optional(),
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehiculoFormData) => Promise<void>;
  vehiculo?: any;
  loading?: boolean;
}

export function VehiculoFormModal({ open, onOpenChange, onSubmit, vehiculo, loading }: VehiculoFormModalProps) {
  const [selectedConductores, setSelectedConductores] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('datos');
  
  const { conductores } = useConductores();
  const { asignaciones, asignarConductor, desasignarConductor } = useVehiculoConductores(vehiculo?.id);
  const { documentos, loading: loadingDocumentos, refetch: refetchDocumentos } = useDocumentosEntidades(
    'vehiculo',
    vehiculo?.id || ''
  );
  
  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo ? {
      placa: vehiculo.placa || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      anio: vehiculo.anio || new Date().getFullYear(),
      num_serie: vehiculo.num_serie || '',
      config_vehicular: vehiculo.config_vehicular || '',
      poliza_seguro: vehiculo.poliza_seguro || '',
      vigencia_seguro: vehiculo.vigencia_seguro || '',
    } : {
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      num_serie: '',
      config_vehicular: '',
      poliza_seguro: '',
      vigencia_seguro: '',
    },
  });

  // Cargar conductores asignados cuando se edita un vehículo
  useEffect(() => {
    if (vehiculo?.id && asignaciones.length > 0) {
      const conductoresAsignados = asignaciones.map(a => a.conductor_id);
      setSelectedConductores(conductoresAsignados);
    }
  }, [vehiculo?.id, asignaciones]);

  const handleSubmit = async (data: VehiculoFormData) => {
    try {
      await onSubmit(data);
      
      // Si es un vehículo nuevo o se modificaron los conductores, actualizar asignaciones
      if (vehiculo?.id) {
        // Remover asignaciones que ya no están seleccionadas
        const conductoresActuales = asignaciones.map(a => a.conductor_id);
        const conductoresARemover = conductoresActuales.filter(id => !selectedConductores.includes(id));
        
        for (const conductorId of conductoresARemover) {
          const asignacion = asignaciones.find(a => a.conductor_id === conductorId);
          if (asignacion) {
            await desasignarConductor(asignacion.id);
          }
        }
        
        // Agregar nuevas asignaciones
        const conductoresAAsignar = selectedConductores.filter(id => !conductoresActuales.includes(id));
        
        for (const conductorId of conductoresAAsignar) {
          await asignarConductor({
            vehiculoId: vehiculo.id,
            conductorId
          });
        }
      }
      
      form.reset();
      setSelectedConductores([]);
    } catch (error) {
      toast.error('Error al guardar el vehículo');
    }
  };

  const configuracionesVehiculares = [
    'C2 - Camión Unitario (2 llantas en el eje delantero y 4 llantas en el eje trasero)',
    'C3 - Camión Unitario (2 llantas en el eje delantero y 6 llantas en el eje trasero)',
    'T3S2 - Tractocamión con Semirremolque',
    'T3S3 - Tractocamión con Semirremolque',
    'T3S2R4 - Tractocamión con Semirremolque y Remolque',
    'Otro'
  ];

  const toggleConductor = (conductorId: string) => {
    setSelectedConductores(prev => 
      prev.includes(conductorId) 
        ? prev.filter(id => id !== conductorId)
        : [...prev, conductorId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="datos" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Datos Básicos
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos
            </TabsTrigger>
            <TabsTrigger value="conductores" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Conductores
            </TabsTrigger>
          </TabsList>

          <TabsContent value="datos" className="space-y-4">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placa">Placa *</Label>
                  <Input
                    id="placa"
                    {...form.register('placa')}
                    placeholder="ABC-123"
                    className="uppercase"
                    onChange={(e) => {
                      form.setValue('placa', e.target.value.toUpperCase());
                    }}
                  />
                  {form.formState.errors.placa && (
                    <p className="text-sm text-red-500">{form.formState.errors.placa.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marca">Marca</Label>
                  <Input
                    id="marca"
                    {...form.register('marca')}
                    placeholder="Ej: Volvo, Mercedes, Kenworth"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo</Label>
                  <Input
                    id="modelo"
                    {...form.register('modelo')}
                    placeholder="Ej: FH16, Actros, T680"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anio">Año</Label>
                  <Input
                    id="anio"
                    type="number"
                    {...form.register('anio', { valueAsNumber: true })}
                    min="1900"
                    max={new Date().getFullYear() + 1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="config_vehicular">Configuración Vehicular</Label>
                <Select 
                  value={form.watch('config_vehicular')} 
                  onValueChange={(value) => form.setValue('config_vehicular', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona la configuración" />
                  </SelectTrigger>
                  <SelectContent>
                    {configuracionesVehiculares.map((config) => (
                      <SelectItem key={config} value={config}>
                        {config}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_serie">Número de Serie</Label>
                <Input
                  id="num_serie"
                  {...form.register('num_serie')}
                  placeholder="Número de serie del vehículo"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poliza_seguro">Póliza de Seguro</Label>
                  <Input
                    id="poliza_seguro"
                    {...form.register('poliza_seguro')}
                    placeholder="Número de póliza"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vigencia_seguro">Vigencia del Seguro</Label>
                  <Input
                    id="vigencia_seguro"
                    type="date"
                    {...form.register('vigencia_seguro')}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Guardando...' : (vehiculo ? 'Actualizar' : 'Crear Vehículo')}
                </Button>
              </div>
            </form>
          </TabsContent>

          <TabsContent value="documentos" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Documentos del Vehículo</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Sube los documentos importantes del vehículo como tarjeta de circulación, seguros, verificaciones, etc.
                </p>
              </div>

              {vehiculo?.id ? (
                <DocumentUpload
                  entidadTipo="vehiculo"
                  entidadId={vehiculo.id}
                  documentos={documentos}
                  onDocumentosChange={refetchDocumentos}
                />
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Primero guarda el vehículo para poder subir documentos.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="conductores" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-3">Asignar Conductores</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona los conductores que pueden operar este vehículo.
                </p>
              </div>

              {conductores.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-sm text-gray-500 mb-4">
                    No hay conductores registrados
                  </p>
                  <p className="text-xs text-gray-400">
                    Registra conductores primero para poder asignarlos a vehículos
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedConductores.length > 0 && (
                      <div className="w-full">
                        <Label className="text-sm font-medium">Conductores Seleccionados:</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedConductores.map(conductorId => {
                            const conductor = conductores.find(c => c.id === conductorId);
                            return conductor ? (
                              <Badge key={conductorId} variant="secondary" className="flex items-center gap-1">
                                {conductor.nombre}
                                <button
                                  type="button"
                                  onClick={() => toggleConductor(conductorId)}
                                  className="ml-1 hover:bg-gray-200 rounded-full"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ) : null;
                          })}
                        </div>
                        <Separator className="my-4" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                    {conductores.map((conductor) => (
                      <div
                        key={conductor.id}
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                          selectedConductores.includes(conductor.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleConductor(conductor.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm">{conductor.nombre}</h4>
                            <div className="text-xs text-gray-500 space-y-1">
                              {conductor.num_licencia && (
                                <p>Licencia: {conductor.num_licencia}</p>
                              )}
                              {conductor.telefono && (
                                <p>Teléfono: {conductor.telefono}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center">
                            <Badge variant={conductor.estado === 'disponible' ? 'default' : 'secondary'}>
                              {conductor.estado}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!vehiculo?.id && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Primero guarda el vehículo para poder asignar conductores.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
