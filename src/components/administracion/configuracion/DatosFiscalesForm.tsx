
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Save, Building2, MapPin } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { CodigoPostalSelector } from '@/components/catalogos/CodigoPostalSelector';

const datosFiscalesSchema = z.object({
  razon_social: z.string().min(1, 'La razón social es obligatoria').max(254),
  rfc_emisor: z.string().min(12, 'RFC debe tener al menos 12 caracteres').max(13),
  regimen_fiscal: z.string().min(3, 'Seleccione un régimen fiscal válido').max(3),
  calle: z.string().min(1, 'La calle es obligatoria').max(100),
  numero_exterior: z.string().max(55).optional(),
  numero_interior: z.string().max(55).optional(),
  colonia: z.string().min(1, 'La colonia es obligatoria').max(120),
  localidad: z.string().max(120).optional(),
  referencia: z.string().max(250).optional(),
  municipio: z.string().min(1, 'El municipio es obligatorio').max(120),
  estado: z.string().min(1, 'El estado es obligatorio').max(30),
  pais: z.string().default('MEX'),
  codigo_postal: z.string().min(5, 'Código postal inválido').max(5),
  serie_carta_porte: z.string().default('CP'),
  folio_inicial: z.number().min(1).default(1)
});

type DatosFiscalesForm = z.infer<typeof datosFiscalesSchema>;

export function DatosFiscalesForm() {
  const { configuracion, isSaving, guardarConfiguracion } = useConfiguracionEmpresarial();

  const form = useForm<DatosFiscalesForm>({
    resolver: zodResolver(datosFiscalesSchema),
    defaultValues: {
      razon_social: configuracion?.razon_social || '',
      rfc_emisor: configuracion?.rfc_emisor || '',
      regimen_fiscal: configuracion?.regimen_fiscal || '',
      calle: configuracion?.calle || '',
      numero_exterior: configuracion?.numero_exterior || '',
      numero_interior: configuracion?.numero_interior || '',
      colonia: configuracion?.colonia || '',
      localidad: configuracion?.localidad || '',
      referencia: configuracion?.referencia || '',
      municipio: configuracion?.municipio || '',
      estado: configuracion?.estado || '',
      pais: configuracion?.pais || 'MEX',
      codigo_postal: configuracion?.codigo_postal || '',
      serie_carta_porte: configuracion?.serie_carta_porte || 'CP',
      folio_inicial: configuracion?.folio_inicial || 1
    }
  });

  const onSubmit = async (data: DatosFiscalesForm) => {
    try {
      await guardarConfiguracion(data);
      form.reset(data);
    } catch (error) {
      console.error('Error al guardar:', error);
    }
  };

  const handleCodigoPostalSelect = (cp: any) => {
    if (cp) {
      form.setValue('codigo_postal', cp.codigo_postal);
      form.setValue('estado', cp.estado);
      form.setValue('municipio', cp.municipio);
      // Si hay colonias disponibles, tomar la primera como sugerencia
      if (cp.colonias && cp.colonias.length > 0) {
        form.setValue('colonia', cp.colonias[0].nombre);
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Datos de la Empresa */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="razon_social">Razón Social *</Label>
              <Input
                id="razon_social"
                {...form.register('razon_social')}
                placeholder="EMPRESA EJEMPLO S.A. DE C.V."
              />
              {form.formState.errors.razon_social && (
                <p className="text-sm text-red-600">{form.formState.errors.razon_social.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc_emisor">RFC *</Label>
              <Input
                id="rfc_emisor"
                {...form.register('rfc_emisor')}
                placeholder="EEM123456789"
                style={{ textTransform: 'uppercase' }}
              />
              {form.formState.errors.rfc_emisor && (
                <p className="text-sm text-red-600">{form.formState.errors.rfc_emisor.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regimen_fiscal">Régimen Fiscal *</Label>
            <Input
              id="regimen_fiscal"
              {...form.register('regimen_fiscal')}
              placeholder="601"
              maxLength={3}
            />
            {form.formState.errors.regimen_fiscal && (
              <p className="text-sm text-red-600">{form.formState.errors.regimen_fiscal.message}</p>
            )}
            <p className="text-xs text-gray-500">
              Ejemplo: 601 (General de Ley Personas Morales), 612 (Personas Físicas con Actividades Empresariales)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Domicilio Fiscal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Domicilio Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Código Postal con Autocompletado */}
          <div className="space-y-2">
            <Label>Código Postal *</Label>
            <CodigoPostalSelector
              value={form.watch('codigo_postal')}
              onSelect={handleCodigoPostalSelect}
              placeholder="Buscar código postal..."
            />
            {form.formState.errors.codigo_postal && (
              <p className="text-sm text-red-600">{form.formState.errors.codigo_postal.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Input
                id="estado"
                {...form.register('estado')}
                placeholder="Jalisco"
                readOnly
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipio">Municipio *</Label>
              <Input
                id="municipio"
                {...form.register('municipio')}
                placeholder="Guadalajara"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colonia">Colonia *</Label>
            <Input
              id="colonia"
              {...form.register('colonia')}
              placeholder="Centro"
            />
            {form.formState.errors.colonia && (
              <p className="text-sm text-red-600">{form.formState.errors.colonia.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="calle">Calle *</Label>
            <Input
              id="calle"
              {...form.register('calle')}
              placeholder="Av. Principal"
            />
            {form.formState.errors.calle && (
              <p className="text-sm text-red-600">{form.formState.errors.calle.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numero_exterior">Número Exterior</Label>
              <Input
                id="numero_exterior"
                {...form.register('numero_exterior')}
                placeholder="123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_interior">Número Interior</Label>
              <Input
                id="numero_interior"
                {...form.register('numero_interior')}
                placeholder="A"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input
                id="localidad"
                {...form.register('localidad')}
                placeholder="Guadalajara"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia">Referencias</Label>
            <Input
              id="referencia"
              {...form.register('referencia')}
              placeholder="Entre calle X y calle Y"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configuración de Documentos */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración de Documentos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serie_carta_porte">Serie para Carta Porte</Label>
              <Input
                id="serie_carta_porte"
                {...form.register('serie_carta_porte')}
                placeholder="CP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folio_inicial">Folio Inicial</Label>
              <Input
                id="folio_inicial"
                type="number"
                {...form.register('folio_inicial', { valueAsNumber: true })}
                placeholder="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botón de Guardar */}
      <div className="flex justify-end">
        <Button 
          type="submit" 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Guardando...' : 'Guardar Configuración'}
        </Button>
      </div>
    </form>
  );
}
