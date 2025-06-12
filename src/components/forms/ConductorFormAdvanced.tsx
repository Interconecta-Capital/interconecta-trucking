
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
import { User, FileText, MapPin, Phone } from 'lucide-react';

const conductorSchema = z.object({
  // Información básica
  nombre: z.string().min(1, 'El nombre es requerido'),
  rfc: z.string().optional(),
  curp: z.string().optional(),
  fecha_nacimiento: z.string().optional(),
  
  // Información de licencia
  num_licencia: z.string().optional(),
  tipo_licencia: z.string().optional(),
  vigencia_licencia: z.string().optional(),
  
  // Contacto
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_emergencia: z.string().optional(),
  contacto_emergencia: z.string().optional(),
  
  // Dirección
  direccion: z.object({
    calle: z.string().optional(),
    numero: z.string().optional(),
    colonia: z.string().optional(),
    ciudad: z.string().optional(),
    estado: z.string().optional(),
    codigo_postal: z.string().optional()
  }).optional(),
  
  // Información médica
  tipo_sangre: z.string().optional(),
  alergias: z.string().optional(),
  medicamentos: z.string().optional(),
  condiciones_medicas: z.string().optional()
});

type ConductorFormData = z.infer<typeof conductorSchema>;

interface ConductorFormAdvancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ConductorFormData) => Promise<void>;
  conductor?: any;
  loading?: boolean;
}

const steps = [
  { id: 'basica', title: 'Información Básica', description: 'Datos personales' },
  { id: 'licencia', title: 'Licencia', description: 'Información de conducir' },
  { id: 'contacto', title: 'Contacto', description: 'Información de contacto' },
  { id: 'documentos', title: 'Documentos', description: 'Archivos adjuntos' }
];

export function ConductorFormAdvanced({ 
  open, 
  onOpenChange, 
  onSubmit, 
  conductor, 
  loading 
}: ConductorFormAdvancedProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [conductorId, setConductorId] = useState<string | null>(null);
  
  const { validateRFC, validateCURP, validateLicencia, validationStates } = useAdvancedValidation();
  const { documentos, cargarDocumentos } = useDocumentosEntidades();

  const form = useForm<ConductorFormData>({
    resolver: zodResolver(conductorSchema),
    defaultValues: conductor ? {
      nombre: conductor.nombre || '',
      rfc: conductor.rfc || '',
      curp: conductor.curp || '',
      fecha_nacimiento: conductor.fecha_nacimiento || '',
      num_licencia: conductor.num_licencia || '',
      tipo_licencia: conductor.tipo_licencia || '',
      vigencia_licencia: conductor.vigencia_licencia || '',
      telefono: conductor.telefono || '',
      email: conductor.email || '',
      telefono_emergencia: conductor.telefono_emergencia || '',
      contacto_emergencia: conductor.contacto_emergencia || '',
      direccion: conductor.direccion || {},
      tipo_sangre: conductor.tipo_sangre || '',
      alergias: conductor.alergias || '',
      medicamentos: conductor.medicamentos || '',
      condiciones_medicas: conductor.condiciones_medicas || '',
    } : {
      nombre: '',
      rfc: '',
      curp: '',
      fecha_nacimiento: '',
      num_licencia: '',
      tipo_licencia: '',
      vigencia_licencia: '',
      telefono: '',
      email: '',
      telefono_emergencia: '',
      contacto_emergencia: '',
      direccion: {},
      tipo_sangre: '',
      alergias: '',
      medicamentos: '',
      condiciones_medicas: '',
    },
  });

  const formData = form.watch();
  
  useAutoSave({
    data: formData,
    key: `conductor_${conductor?.id || 'new'}`,
    enabled: open && currentStep < 3
  });

  useEffect(() => {
    if (conductor?.id) {
      setConductorId(conductor.id);
      cargarDocumentos('conductor', conductor.id);
    }
  }, [conductor, cargarDocumentos]);

  const handleNext = async () => {
    let isValid = true;

    // Validate current step
    if (currentStep === 0) {
      if (!formData.nombre) {
        form.setError('nombre', { message: 'El nombre es requerido' });
        isValid = false;
      }
      
      if (formData.rfc) {
        const rfcValidation = await validateRFC(formData.rfc);
        if (!rfcValidation.isValid) {
          form.setError('rfc', { message: rfcValidation.message });
          isValid = false;
        }
      }

      if (formData.curp) {
        const curpValidation = await validateCURP(formData.curp);
        if (!curpValidation.isValid) {
          form.setError('curp', { message: curpValidation.message });
          isValid = false;
        }
      }
    }

    if (currentStep === 1 && formData.num_licencia) {
      const licenciaValidation = await validateLicencia(formData.num_licencia, formData.vigencia_licencia);
      if (!licenciaValidation.isValid) {
        form.setError('num_licencia', { message: licenciaValidation.message });
        isValid = false;
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

  const handleSubmit = async (data: ConductorFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setCurrentStep(0);
      toast.success('Conductor guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar el conductor');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre completo *</Label>
              <Input
                id="nombre"
                {...form.register('nombre')}
                placeholder="Nombre completo del conductor"
              />
              {form.formState.errors.nombre && (
                <p className="text-sm text-red-500">{form.formState.errors.nombre.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC</Label>
                <Input
                  id="rfc"
                  {...form.register('rfc')}
                  placeholder="RFC del conductor"
                  className="uppercase"
                  onChange={async (e) => {
                    const value = e.target.value.toUpperCase();
                    form.setValue('rfc', value);
                    if (value.length >= 12) {
                      await validateRFC(value);
                    }
                  }}
                />
                <ValidationIndicator
                  status={validationStates.rfc || 'idle'}
                  message={form.formState.errors.rfc?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="curp">CURP</Label>
                <Input
                  id="curp"
                  {...form.register('curp')}
                  placeholder="CURP del conductor"
                  className="uppercase"
                  onChange={async (e) => {
                    const value = e.target.value.toUpperCase();
                    form.setValue('curp', value);
                    if (value.length === 18) {
                      await validateCURP(value);
                    }
                  }}
                />
                <ValidationIndicator
                  status={validationStates.curp || 'idle'}
                  message={form.formState.errors.curp?.message}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_nacimiento">Fecha de Nacimiento</Label>
              <Input
                id="fecha_nacimiento"
                type="date"
                {...form.register('fecha_nacimiento')}
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="num_licencia">Número de Licencia</Label>
                <Input
                  id="num_licencia"
                  {...form.register('num_licencia')}
                  placeholder="Número de licencia"
                  onChange={async (e) => {
                    const value = e.target.value;
                    form.setValue('num_licencia', value);
                    if (value.length >= 8) {
                      await validateLicencia(value, formData.vigencia_licencia);
                    }
                  }}
                />
                <ValidationIndicator
                  status={validationStates.licencia || 'idle'}
                  message={form.formState.errors.num_licencia?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_licencia">Tipo de Licencia</Label>
                <Select 
                  value={form.watch('tipo_licencia')} 
                  onValueChange={(value) => form.setValue('tipo_licencia', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A">Tipo A - Motocicletas</SelectItem>
                    <SelectItem value="B">Tipo B - Automóviles</SelectItem>
                    <SelectItem value="C">Tipo C - Camiones</SelectItem>
                    <SelectItem value="D">Tipo D - Autobuses</SelectItem>
                    <SelectItem value="E">Tipo E - Remolques</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_licencia">Vigencia de Licencia</Label>
              <Input
                id="vigencia_licencia"
                type="date"
                {...form.register('vigencia_licencia')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo_sangre">Tipo de Sangre</Label>
                <Select 
                  value={form.watch('tipo_sangre')} 
                  onValueChange={(value) => form.setValue('tipo_sangre', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alergias">Alergias</Label>
              <Textarea
                id="alergias"
                {...form.register('alergias')}
                placeholder="Alergias conocidas"
                rows={2}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  {...form.register('telefono')}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="correo@ejemplo.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contacto_emergencia">Contacto de Emergencia</Label>
                <Input
                  id="contacto_emergencia"
                  {...form.register('contacto_emergencia')}
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_emergencia">Teléfono de Emergencia</Label>
                <Input
                  id="telefono_emergencia"
                  {...form.register('telefono_emergencia')}
                  placeholder="Teléfono de emergencia"
                />
              </div>
            </div>

            {/* Dirección */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calle</Label>
                  <Input
                    {...form.register('direccion.calle')}
                    placeholder="Nombre de la calle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    {...form.register('direccion.numero')}
                    placeholder="Número exterior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colonia</Label>
                  <Input
                    {...form.register('direccion.colonia')}
                    placeholder="Colonia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input
                    {...form.register('direccion.codigo_postal')}
                    placeholder="C.P."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    {...form.register('direccion.ciudad')}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    {...form.register('direccion.estado')}
                    placeholder="Estado"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {conductorId ? (
              <DocumentUpload
                entidadTipo="conductor"
                entidadId={conductorId}
                documentos={documentos}
                onDocumentosChange={() => cargarDocumentos('conductor', conductorId)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Los documentos se podrán subir después de guardar el conductor</p>
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {conductor ? 'Editar Conductor' : 'Nuevo Conductor'}
          </DialogTitle>
          <DialogDescription>
            {conductor ? 'Modifica los datos del conductor' : 'Ingresa los datos del nuevo conductor'}
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
