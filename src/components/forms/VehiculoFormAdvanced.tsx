
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
import { Textarea } from '@/components/ui/textarea';
import { FormStepper } from './FormStepper';
import { ValidationIndicator } from './ValidationIndicator';
import { DocumentUpload } from './DocumentUpload';
import { useAdvancedValidation } from '@/hooks/useAdvancedValidation';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useDocumentosEntidades } from '@/hooks/useDocumentosEntidades';
import { toast } from 'sonner';
import { Truck, FileText, MapPin, Wrench } from 'lucide-react';

const vehiculoSchema = z.object({
  // Información básica
  placa: z.string().min(1, 'La placa es requerida').max(10, 'Máximo 10 caracteres'),
  marca: z.string().optional(),
  modelo: z.string().optional(),
  anio: z.number().optional(),
  num_serie: z.string().optional(),
  
  // Especificaciones técnicas
  config_vehicular: z.string().optional(),
  peso_vehicular: z.number().optional(),
  capacidad_carga: z.number().optional(),
  num_ejes: z.number().optional(),
  num_llantas: z.number().optional(),
  
  // Información del seguro
  poliza_seguro: z.string().optional(),
  vigencia_seguro: z.string().optional(),
  aseguradora: z.string().optional(),
  
  // Verificación vehicular
  verificacion_vigencia: z.string().optional(),
  num_certificado: z.string().optional(),
  
  // GPS y seguimiento
  id_equipo_gps: z.string().optional(),
  fecha_instalacion_gps: z.string().optional(),
  acta_instalacion_gps: z.string().optional(),
  proveedor_gps: z.string().optional(),
  
  // Mantenimiento
  km_actual: z.number().optional(),
  proximo_servicio: z.string().optional(),
  notas_mantenimiento: z.string().optional()
});

type VehiculoFormData = z.infer<typeof vehiculoSchema>;

interface VehiculoFormAdvancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: VehiculoFormData) => Promise<void>;
  vehiculo?: any;
  loading?: boolean;
}

const steps = [
  { id: 'basica', title: 'Información Básica', description: 'Datos del vehículo' },
  { id: 'tecnica', title: 'Especificaciones', description: 'Detalles técnicos' },
  { id: 'legal', title: 'Información Legal', description: 'Seguro y verificación' },
  { id: 'documentos', title: 'Documentos', description: 'Archivos adjuntos' }
];

const configuracionesVehiculares = [
  { value: 'C2', label: 'C2 - Camión Unitario (2 llantas delanteras y 4 traseras)' },
  { value: 'C3', label: 'C3 - Camión Unitario (2 llantas delanteras y 6 traseras)' },
  { value: 'T3S2', label: 'T3S2 - Tractocamión con Semirremolque' },
  { value: 'T3S3', label: 'T3S3 - Tractocamión con Semirremolque' },
  { value: 'T3S2R4', label: 'T3S2R4 - Tractocamión con Semirremolque y Remolque' },
  { value: 'B2', label: 'B2 - Autobús de 2 ejes' },
  { value: 'B3', label: 'B3 - Autobús de 3 ejes' }
];

export function VehiculoFormAdvanced({ 
  open, 
  onOpenChange, 
  onSubmit, 
  vehiculo, 
  loading 
}: VehiculoFormAdvancedProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [vehiculoId, setVehiculoId] = useState<string | null>(null);
  
  const { validatePlaca, validationStates } = useAdvancedValidation();
  const { documentos, cargarDocumentos } = useDocumentosEntidades();

  const form = useForm<VehiculoFormData>({
    resolver: zodResolver(vehiculoSchema),
    defaultValues: vehiculo ? {
      placa: vehiculo.placa || '',
      marca: vehiculo.marca || '',
      modelo: vehiculo.modelo || '',
      anio: vehiculo.anio || new Date().getFullYear(),
      num_serie: vehiculo.num_serie || '',
      config_vehicular: vehiculo.config_vehicular || '',
      peso_vehicular: vehiculo.peso_vehicular || undefined,
      capacidad_carga: vehiculo.capacidad_carga || undefined,
      num_ejes: vehiculo.num_ejes || undefined,
      num_llantas: vehiculo.num_llantas || undefined,
      poliza_seguro: vehiculo.poliza_seguro || '',
      vigencia_seguro: vehiculo.vigencia_seguro || '',
      aseguradora: vehiculo.aseguradora || '',
      verificacion_vigencia: vehiculo.verificacion_vigencia || '',
      num_certificado: vehiculo.num_certificado || '',
      id_equipo_gps: vehiculo.id_equipo_gps || '',
      fecha_instalacion_gps: vehiculo.fecha_instalacion_gps || '',
      acta_instalacion_gps: vehiculo.acta_instalacion_gps || '',
      proveedor_gps: vehiculo.proveedor_gps || '',
      km_actual: vehiculo.km_actual || undefined,
      proximo_servicio: vehiculo.proximo_servicio || '',
      notas_mantenimiento: vehiculo.notas_mantenimiento || ''
    } : {
      placa: '',
      marca: '',
      modelo: '',
      anio: new Date().getFullYear(),
      num_serie: '',
      config_vehicular: '',
      peso_vehicular: undefined,
      capacidad_carga: undefined,
      num_ejes: undefined,
      num_llantas: undefined,
      poliza_seguro: '',
      vigencia_seguro: '',
      aseguradora: '',
      verificacion_vigencia: '',
      num_certificado: '',
      id_equipo_gps: '',
      fecha_instalacion_gps: '',
      acta_instalacion_gps: '',
      proveedor_gps: '',
      km_actual: undefined,
      proximo_servicio: '',
      notas_mantenimiento: ''
    },
  });

  const formData = form.watch();
  
  useAutoSave({
    data: formData,
    key: `vehiculo_${vehiculo?.id || 'new'}`,
    enabled: open && currentStep < 3
  });

  useEffect(() => {
    if (vehiculo?.id) {
      setVehiculoId(vehiculo.id);
      cargarDocumentos('vehiculo', vehiculo.id);
    }
  }, [vehiculo, cargarDocumentos]);

  const handleNext = async () => {
    let isValid = true;

    // Validate current step
    if (currentStep === 0) {
      if (!formData.placa) {
        form.setError('placa', { message: 'La placa es requerida' });
        isValid = false;
      } else {
        const placaValidation = await validatePlaca(formData.placa);
        if (!placaValidation.isValid) {
          form.setError('placa', { message: placaValidation.message });
          isValid = false;
        }
      }
    }

    if (isValid) {
      if (currentStep === steps.length - 1) {
        handleSubmit(formData);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async (data: VehiculoFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setCurrentStep(0);
      toast.success('Vehículo guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar el vehículo');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  {...form.register('placa')}
                  placeholder="ABC-123"
                  className="uppercase"
                  onChange={async (e) => {
                    const value = e.target.value.toUpperCase();
                    form.setValue('placa', value);
                    if (value.length >= 6) {
                      await validatePlaca(value);
                    }
                  }}
                />
                <ValidationIndicator
                  status={validationStates.placa || 'idle'}
                  message={form.formState.errors.placa?.message}
                />
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
              <Label htmlFor="num_serie">Número de Serie (VIN)</Label>
              <Input
                id="num_serie"
                {...form.register('num_serie')}
                placeholder="Número de identificación vehicular"
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
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
                    <SelectItem key={config.value} value={config.value}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="peso_vehicular">Peso Vehicular (kg)</Label>
                <Input
                  id="peso_vehicular"
                  type="number"
                  {...form.register('peso_vehicular', { valueAsNumber: true })}
                  placeholder="Peso en kilogramos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="capacidad_carga">Capacidad de Carga (kg)</Label>
                <Input
                  id="capacidad_carga"
                  type="number"
                  {...form.register('capacidad_carga', { valueAsNumber: true })}
                  placeholder="Capacidad máxima de carga"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_ejes">Número de Ejes</Label>
                <Input
                  id="num_ejes"
                  type="number"
                  {...form.register('num_ejes', { valueAsNumber: true })}
                  min="2"
                  max="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="num_llantas">Número de Llantas</Label>
                <Input
                  id="num_llantas"
                  type="number"
                  {...form.register('num_llantas', { valueAsNumber: true })}
                  min="4"
                  max="22"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Información de Mantenimiento
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="km_actual">Kilometraje Actual</Label>
                  <Input
                    id="km_actual"
                    type="number"
                    {...form.register('km_actual', { valueAsNumber: true })}
                    placeholder="Km actuales"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proximo_servicio">Próximo Servicio</Label>
                  <Input
                    id="proximo_servicio"
                    type="date"
                    {...form.register('proximo_servicio')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notas_mantenimiento">Notas de Mantenimiento</Label>
                <Textarea
                  id="notas_mantenimiento"
                  {...form.register('notas_mantenimiento')}
                  placeholder="Notas sobre el mantenimiento del vehículo"
                  rows={3}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {/* Información del Seguro */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Información del Seguro</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="poliza_seguro">Número de Póliza</Label>
                  <Input
                    id="poliza_seguro"
                    {...form.register('poliza_seguro')}
                    placeholder="Número de póliza de seguro"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aseguradora">Aseguradora</Label>
                  <Input
                    id="aseguradora"
                    {...form.register('aseguradora')}
                    placeholder="Nombre de la aseguradora"
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
            </div>

            {/* Verificación Vehicular */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium">Verificación Vehicular</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="verificacion_vigencia">Vigencia de Verificación</Label>
                  <Input
                    id="verificacion_vigencia"
                    type="date"
                    {...form.register('verificacion_vigencia')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="num_certificado">Número de Certificado</Label>
                  <Input
                    id="num_certificado"
                    {...form.register('num_certificado')}
                    placeholder="Número del certificado de verificación"
                  />
                </div>
              </div>
            </div>

            {/* Información GPS */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Información GPS
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_equipo_gps">ID Equipo GPS</Label>
                  <Input
                    id="id_equipo_gps"
                    {...form.register('id_equipo_gps')}
                    placeholder="ID del dispositivo GPS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proveedor_gps">Proveedor GPS</Label>
                  <Input
                    id="proveedor_gps"
                    {...form.register('proveedor_gps')}
                    placeholder="Empresa proveedora del GPS"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fecha_instalacion_gps">Fecha de Instalación</Label>
                  <Input
                    id="fecha_instalacion_gps"
                    type="date"
                    {...form.register('fecha_instalacion_gps')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="acta_instalacion_gps">Acta de Instalación</Label>
                  <Input
                    id="acta_instalacion_gps"
                    {...form.register('acta_instalacion_gps')}
                    placeholder="Número de acta o referencia"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {vehiculoId ? (
              <DocumentUpload
                entidadTipo="vehiculo"
                entidadId={vehiculoId}
                documentos={documentos}
                onDocumentosChange={() => cargarDocumentos('vehiculo', vehiculoId)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Los documentos se podrán subir después de guardar el vehículo</p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {vehiculo ? 'Editar Vehículo' : 'Nuevo Vehículo'}
          </DialogTitle>
          <DialogDescription>
            {vehiculo ? 'Modifica los datos del vehículo' : 'Ingresa los datos del nuevo vehículo'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <FormStepper
            steps={steps}
            currentStep={currentStep}
            onStepChange={setCurrentStep}
            onNext={handleNext}
            onPrevious={handlePrevious}
            canGoNext={true}
            canGoPrevious={currentStep > 0}
            isLoading={loading}
          />

          <div className="min-h-[400px]">
            {renderStepContent()}
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
