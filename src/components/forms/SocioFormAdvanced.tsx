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
import { Building, FileText, MapPin, CreditCard, Upload } from 'lucide-react';

const socioSchema = z.object({
  // Información básica
  nombre_razon_social: z.string().min(1, 'El nombre o razón social es requerido'),
  rfc: z.string().min(1, 'El RFC es requerido').max(13, 'RFC inválido'),
  tipo_persona: z.enum(['fisica', 'moral'], {
    required_error: 'Selecciona el tipo de persona',
  }),
  
  // Contacto
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  telefono_alternativo: z.string().optional(),
  sitio_web: z.string().optional(),
  
  // Dirección fiscal
  direccion_fiscal: z.object({
    calle: z.string().optional(),
    numero_exterior: z.string().optional(),
    numero_interior: z.string().optional(),
    colonia: z.string().optional(),
    ciudad: z.string().optional(),
    estado: z.string().optional(),
    codigo_postal: z.string().optional(),
    pais: z.string().optional()
  }).optional(),
  
  // Información fiscal
  regimen_fiscal: z.string().optional(),
  uso_cfdi: z.string().optional(),
  actividad_economica: z.string().optional(),
  
  // Información bancaria
  cuenta_bancaria: z.string().optional(),
  banco: z.string().optional(),
  clabe: z.string().optional(),
  
  // Representante legal (solo para personas morales)
  representante_legal: z.object({
    nombre: z.string().optional(),
    rfc: z.string().optional(),
    cargo: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().optional()
  }).optional(),
  
  // Notas
  notas: z.string().optional()
});

type SocioFormData = z.infer<typeof socioSchema>;

interface SocioFormAdvancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SocioFormData) => Promise<void>;
  socio?: any;
  loading?: boolean;
}

const steps = [
  { id: 'basica', title: 'Información Básica', description: 'Datos generales' },
  { id: 'fiscal', title: 'Información Fiscal', description: 'Datos fiscales' },
  { id: 'bancaria', title: 'Información Bancaria', description: 'Datos bancarios' },
  { id: 'documentos', title: 'Documentos', description: 'Archivos adjuntos' }
];

const regimenesFiscales = [
  { value: '601', label: '601 - General de Ley Personas Morales' },
  { value: '603', label: '603 - Personas Morales con Fines no Lucrativos' },
  { value: '605', label: '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios' },
  { value: '606', label: '606 - Arrendamiento' },
  { value: '612', label: '612 - Personas Físicas con Actividades Empresariales y Profesionales' },
  { value: '614', label: '614 - Ingresos por intereses' },
  { value: '616', label: '616 - Sin obligaciones fiscales' }
];

const usosCFDI = [
  { value: 'G01', label: 'G01 - Adquisición de mercancías' },
  { value: 'G02', label: 'G02 - Devoluciones, descuentos o bonificaciones' },
  { value: 'G03', label: 'G03 - Gastos en general' },
  { value: 'I01', label: 'I01 - Construcciones' },
  { value: 'I02', label: 'I02 - Mobilario y equipo de oficina por inversiones' },
  { value: 'I03', label: 'I03 - Equipo de transporte' },
  { value: 'P01', label: 'P01 - Por definir' }
];

export function SocioFormAdvanced({ 
  open, 
  onOpenChange, 
  onSubmit, 
  socio, 
  loading 
}: SocioFormAdvancedProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [socioId, setSocioId] = useState<string | null>(null);
  const [constanciaFile, setConstanciaFile] = useState<File | null>(null);
  
  const { validateRFC, validationStates } = useAdvancedValidation();
  const { documentos, cargarDocumentos } = useDocumentosEntidades();

  const form = useForm<SocioFormData>({
    resolver: zodResolver(socioSchema),
    defaultValues: socio ? {
      nombre_razon_social: socio.nombre_razon_social || '',
      rfc: socio.rfc || '',
      tipo_persona: socio.tipo_persona || 'moral',
      telefono: socio.telefono || '',
      email: socio.email || '',
      telefono_alternativo: socio.telefono_alternativo || '',
      sitio_web: socio.sitio_web || '',
      direccion_fiscal: socio.direccion_fiscal || {},
      regimen_fiscal: socio.regimen_fiscal || '',
      uso_cfdi: socio.uso_cfdi || '',
      actividad_economica: socio.actividad_economica || '',
      cuenta_bancaria: socio.cuenta_bancaria || '',
      banco: socio.banco || '',
      clabe: socio.clabe || '',
      representante_legal: socio.representante_legal || {},
      notas: socio.notas || ''
    } : {
      nombre_razon_social: '',
      rfc: '',
      tipo_persona: 'moral',
      telefono: '',
      email: '',
      telefono_alternativo: '',
      sitio_web: '',
      direccion_fiscal: {},
      regimen_fiscal: '',
      uso_cfdi: '',
      actividad_economica: '',
      cuenta_bancaria: '',
      banco: '',
      clabe: '',
      representante_legal: {},
      notas: ''
    },
  });

  const formData = form.watch();
  const tipoPersona = form.watch('tipo_persona');
  
  useAutoSave({
    data: formData,
    key: `socio_${socio?.id || 'new'}`,
    enabled: open && currentStep < 3
  });

  useEffect(() => {
    if (socio?.id) {
      setSocioId(socio.id);
      cargarDocumentos('socio', socio.id);
    }
  }, [socio, cargarDocumentos]);

  const handleConstanciaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setConstanciaFile(file);
      toast.success('Constancia de situación fiscal cargada');
    }
  };

  const handleNext = async () => {
    let isValid = true;

    // Validate current step
    if (currentStep === 0) {
      if (!formData.nombre_razon_social) {
        form.setError('nombre_razon_social', { message: 'El nombre es requerido' });
        isValid = false;
      }
      
      if (!formData.rfc) {
        form.setError('rfc', { message: 'El RFC es requerido' });
        isValid = false;
      } else {
        const rfcValidation = await validateRFC(formData.rfc, formData.tipo_persona);
        if (!rfcValidation.isValid) {
          form.setError('rfc', { message: rfcValidation.message });
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

  const handleSubmit = async (data: SocioFormData) => {
    try {
      await onSubmit(data);
      form.reset();
      setCurrentStep(0);
      toast.success('Socio guardado exitosamente');
    } catch (error) {
      toast.error('Error al guardar el socio');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_razon_social">Nombre / Razón Social *</Label>
              <Input
                id="nombre_razon_social"
                {...form.register('nombre_razon_social')}
                placeholder="Nombre completo o razón social"
              />
              {form.formState.errors.nombre_razon_social && (
                <p className="text-sm text-red-500">{form.formState.errors.nombre_razon_social.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rfc">RFC *</Label>
                <Input
                  id="rfc"
                  {...form.register('rfc')}
                  placeholder="RFC del socio"
                  className="uppercase"
                  onChange={async (e) => {
                    const value = e.target.value.toUpperCase();
                    form.setValue('rfc', value);
                    if (value.length >= 12) {
                      await validateRFC(value, tipoPersona);
                    }
                  }}
                />
                <ValidationIndicator
                  status={validationStates.rfc || 'idle'}
                  message={form.formState.errors.rfc?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_persona">Tipo de Persona *</Label>
                <Select 
                  value={form.watch('tipo_persona')} 
                  onValueChange={(value: 'fisica' | 'moral') => form.setValue('tipo_persona', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fisica">Persona Física</SelectItem>
                    <SelectItem value="moral">Persona Moral</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.tipo_persona && (
                  <p className="text-sm text-red-500">{form.formState.errors.tipo_persona.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono Principal</Label>
                <Input
                  id="telefono"
                  {...form.register('telefono')}
                  placeholder="Número de teléfono"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefono_alternativo">Teléfono Alternativo</Label>
                <Input
                  id="telefono_alternativo"
                  {...form.register('telefono_alternativo')}
                  placeholder="Teléfono alternativo"
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

              <div className="space-y-2">
                <Label htmlFor="sitio_web">Sitio Web</Label>
                <Input
                  id="sitio_web"
                  {...form.register('sitio_web')}
                  placeholder="https://www.ejemplo.com"
                />
              </div>
            </div>

            {/* Dirección Fiscal con campo de colonia */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección Fiscal
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Calle</Label>
                  <Input
                    {...form.register('direccion_fiscal.calle')}
                    placeholder="Nombre de la calle"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número Exterior</Label>
                  <Input
                    {...form.register('direccion_fiscal.numero_exterior')}
                    placeholder="Número exterior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número Interior</Label>
                  <Input
                    {...form.register('direccion_fiscal.numero_interior')}
                    placeholder="Número interior"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Colonia</Label>
                  <Input
                    {...form.register('direccion_fiscal.colonia')}
                    placeholder="Colonia"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Código Postal</Label>
                  <Input
                    {...form.register('direccion_fiscal.codigo_postal')}
                    placeholder="C.P."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Ciudad</Label>
                  <Input
                    {...form.register('direccion_fiscal.ciudad')}
                    placeholder="Ciudad"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    {...form.register('direccion_fiscal.estado')}
                    placeholder="Estado"
                  />
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Input
                    {...form.register('direccion_fiscal.pais')}
                    placeholder="País"
                    defaultValue="México"
                  />
                </div>
              </div>
            </div>

            {/* Constancia de Situación Fiscal */}
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Constancia de Situación Fiscal
              </h4>
              
              <div className="space-y-2">
                <Label>Subir Constancia</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleConstanciaUpload}
                    className="hidden"
                    id="constancia-upload"
                  />
                  <label htmlFor="constancia-upload">
                    <Button type="button" variant="outline" className="cursor-pointer" asChild>
                      <span className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {constanciaFile ? 'Cambiar archivo' : 'Subir archivo'}
                      </span>
                    </Button>
                  </label>
                  {constanciaFile && (
                    <span className="text-sm text-green-600">
                      ✓ {constanciaFile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  PDF, JPG, PNG hasta 5MB
                </p>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
                <Select 
                  value={form.watch('regimen_fiscal')} 
                  onValueChange={(value) => form.setValue('regimen_fiscal', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar régimen" />
                  </SelectTrigger>
                  <SelectContent>
                    {regimenesFiscales.map((regimen) => (
                      <SelectItem key={regimen.value} value={regimen.value}>
                        {regimen.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uso_cfdi">Uso CFDI</Label>
                <Select 
                  value={form.watch('uso_cfdi')} 
                  onValueChange={(value) => form.setValue('uso_cfdi', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar uso" />
                  </SelectTrigger>
                  <SelectContent>
                    {usosCFDI.map((uso) => (
                      <SelectItem key={uso.value} value={uso.value}>
                        {uso.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="actividad_economica">Actividad Económica</Label>
              <Textarea
                id="actividad_economica"
                {...form.register('actividad_economica')}
                placeholder="Descripción de la actividad económica principal"
                rows={3}
              />
            </div>

            {/* Representante Legal (solo para personas morales) */}
            {tipoPersona === 'moral' && (
              <div className="space-y-4 p-4 border rounded-lg">
                <h4 className="font-medium">Representante Legal</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input
                      {...form.register('representante_legal.nombre')}
                      placeholder="Nombre del representante"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>RFC</Label>
                    <Input
                      {...form.register('representante_legal.rfc')}
                      placeholder="RFC del representante"
                      className="uppercase"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cargo</Label>
                    <Input
                      {...form.register('representante_legal.cargo')}
                      placeholder="Cargo en la empresa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teléfono</Label>
                    <Input
                      {...form.register('representante_legal.telefono')}
                      placeholder="Teléfono del representante"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Email</Label>
                    <Input
                      {...form.register('representante_legal.email')}
                      placeholder="Email del representante"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-4 p-4 border rounded-lg">
              <h4 className="font-medium flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Información Bancaria
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="banco">Banco</Label>
                  <Input
                    id="banco"
                    {...form.register('banco')}
                    placeholder="Nombre del banco"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cuenta_bancaria">Número de Cuenta</Label>
                  <Input
                    id="cuenta_bancaria"
                    {...form.register('cuenta_bancaria')}
                    placeholder="Número de cuenta bancaria"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="clabe">CLABE Interbancaria</Label>
                  <Input
                    id="clabe"
                    {...form.register('clabe')}
                    placeholder="Clave Bancaria Estandarizada (18 dígitos)"
                    maxLength={18}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notas">Notas Adicionales</Label>
              <Textarea
                id="notas"
                {...form.register('notas')}
                placeholder="Información adicional sobre el socio comercial"
                rows={4}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {socioId ? (
              <DocumentUpload
                entidadTipo="socio"
                entidadId={socioId}
                documentos={documentos}
                onDocumentosChange={() => cargarDocumentos('socio', socioId)}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4" />
                <p>Los documentos se podrán subir después de guardar el socio</p>
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
            <Building className="h-5 w-5" />
            {socio ? 'Editar Socio' : 'Nuevo Socio'}
          </DialogTitle>
          <DialogDescription>
            {socio ? 'Modifica los datos del socio' : 'Ingresa los datos del nuevo socio comercial'}
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
