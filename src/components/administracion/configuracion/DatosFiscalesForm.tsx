
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Building2, MapPin } from 'lucide-react';
import { useConfiguracionEmpresarial } from '@/hooks/useConfiguracionEmpresarial';
import { CodigoPostalSelector } from '@/components/catalogos/CodigoPostalSelector';
import { RegimesFiscalesSelector } from '@/components/shared/RegimesFiscalesSelector';
import { RFCValidator } from '@/utils/rfcValidation';
import { ValidationIndicator } from '@/components/forms/ValidationIndicator';
import { ModoPruebasAlert } from './ModoPruebasAlert';
import { DatosFiscalesValidacion } from './DatosFiscalesValidacion';
import { toast } from 'sonner';

const datosFiscalesSchema = z.object({
  razon_social: z.string().min(1, 'La razón social es obligatoria').max(254),
  rfc_emisor: z.string()
    .min(12, 'RFC debe tener al menos 12 caracteres')
    .max(13)
    .refine((rfc) => {
      const validation = RFCValidator.validarRFC(rfc);
      return validation.esValido;
    }, 'Formato de RFC inválido'),
  regimen_fiscal: z.string().min(3, 'Seleccione un régimen fiscal válido'),
  calle: z.string().min(1, 'La calle es obligatoria').max(100),
  numero_exterior: z.string().max(55).optional(),
  numero_interior: z.string().max(55).optional(),
  colonia: z.string().min(1, 'La colonia es obligatoria').max(120),
  localidad: z.string().max(120).optional(),
  referencia: z.string().max(250).optional(),
  municipio: z.string().min(1, 'El municipio es obligatorio').max(120),
  estado: z.string().min(1, 'El estado es obligatorio').max(30),
  pais: z.string().min(1, 'Seleccione un país').default('MEX'),
  codigo_postal: z.string().min(5, 'Código postal inválido').max(5),
  serie_carta_porte: z.string().default('CP'),
  folio_inicial: z.number().min(1).default(1),
  serie_factura: z.string().default('ZS'),
  folio_inicial_factura: z.number().min(1).default(1)
});

type DatosFiscalesForm = z.infer<typeof datosFiscalesSchema>;

export function DatosFiscalesForm() {
  const { configuracion, isSaving, guardarConfiguracion, recargar } = useConfiguracionEmpresarial();
  const [rfcValidationStatus, setRfcValidationStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [isEditing, setIsEditing] = useState(false);
  const [rfcValidadoSAT, setRfcValidadoSAT] = useState(false);

  const form = useForm<DatosFiscalesForm>({
    resolver: zodResolver(datosFiscalesSchema),
    defaultValues: {
      razon_social: '',
      rfc_emisor: '',
      regimen_fiscal: '',
      calle: '',
      numero_exterior: '',
      numero_interior: '',
      colonia: '',
      localidad: '',
      referencia: '',
      municipio: '',
      estado: '',
      pais: 'MEX',
      codigo_postal: '',
      serie_carta_porte: 'CP',
      folio_inicial: 1,
      serie_factura: 'ZS',
      folio_inicial_factura: 1
    }
  });

  // Cargar datos cuando la configuración esté disponible
  React.useEffect(() => {
    if (configuracion) {
      console.log('🔍 [DatosFiscalesForm] Cargando configuración existente:', {
        razon_social: configuracion.razon_social || '(vacío)',
        rfc_emisor: configuracion.rfc_emisor || '(vacío)',
        regimen_fiscal: configuracion.regimen_fiscal || '(vacío)',
        tiene_domicilio: !!(configuracion.codigo_postal && configuracion.calle)
      });
      
      form.reset({
        razon_social: configuracion.razon_social || '',
        rfc_emisor: configuracion.rfc_emisor || '',
        regimen_fiscal: configuracion.regimen_fiscal || '',
        calle: configuracion.calle || '',
        numero_exterior: configuracion.numero_exterior || '',
        numero_interior: configuracion.numero_interior || '',
        colonia: configuracion.colonia || '',
        localidad: configuracion.localidad || '',
        referencia: configuracion.referencia || '',
        municipio: configuracion.municipio || '',
        estado: configuracion.estado || '',
        pais: configuracion.pais || 'MEX',
        codigo_postal: configuracion.codigo_postal || '',
        serie_carta_porte: configuracion.serie_carta_porte || 'CP',
        folio_inicial: configuracion.folio_inicial || 1,
        serie_factura: configuracion.serie_factura || 'ZS',
        folio_inicial_factura: configuracion.folio_inicial_factura || 1
      });

      // Determinar si hay datos guardados para mostrar modo "solo lectura"
      const hasDatos = configuracion.razon_social && configuracion.rfc_emisor && configuracion.regimen_fiscal;
      console.log('🔍 [DatosFiscalesForm] ¿Tiene datos guardados?', hasDatos);
      console.log('🔍 [DatosFiscalesForm] Modo edición:', !hasDatos);
      setIsEditing(!hasDatos);
    }
  }, [configuracion]);

  const onSubmit = async (data: DatosFiscalesForm) => {
    console.log('📝 [DatosFiscalesForm] ===== INICIO GUARDADO =====');
    
    // Validar que el RFC esté validado en producción
    if (!configuracion?.modo_pruebas && !rfcValidadoSAT) {
      toast.error("Por favor valida el RFC contra el SAT antes de guardar");
      return;
    }
    
    console.log('📝 [DatosFiscalesForm] Datos del formulario:', {
      razon_social: data.razon_social,
      rfc_emisor: data.rfc_emisor,
      regimen_fiscal: data.regimen_fiscal,
      validado_sat: rfcValidadoSAT
    });
    
    try {
      console.log('🔄 [DatosFiscalesForm] Llamando a guardarConfiguracion...');
      
      // Guardar configuración
      await guardarConfiguracion(data as any);
      
      console.log('✅ [DatosFiscalesForm] Guardado exitoso');
      
      console.log('🔄 [DatosFiscalesForm] Recargando configuración desde BD...');
      await recargar();
      console.log('✅ [DatosFiscalesForm] Recarga completada');
      
      console.log('🔄 [DatosFiscalesForm] Deshabilitando modo edición...');
      setIsEditing(false);
      console.log('✅ [DatosFiscalesForm] ===== FIN GUARDADO EXITOSO =====');
    } catch (error) {
      console.error('❌ [DatosFiscalesForm] ===== ERROR EN GUARDADO =====');
      console.error('❌ [DatosFiscalesForm] Error completo:', error);
    }
  };

  const handleCodigoPostalSelect = (codigoPostal: string, data?: any) => {
    if (data) {
      form.setValue('codigo_postal', codigoPostal);
      form.setValue('estado', data.estado);
      form.setValue('municipio', data.municipio);
      // Si hay colonias disponibles, tomar la primera como sugerencia
      if (data.colonias && data.colonias.length > 0) {
        form.setValue('colonia', data.colonias[0].nombre);
      }
    }
  };

  const handleRfcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rfc = e.target.value.toUpperCase();
    form.setValue('rfc_emisor', rfc);
    
    if (rfc.length >= 12) {
      setRfcValidationStatus('validating');
      const validation = RFCValidator.validarRFC(rfc);
      setTimeout(() => {
        setRfcValidationStatus(validation.esValido ? 'valid' : 'invalid');
      }, 300);
    } else {
      setRfcValidationStatus('idle');
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Alerta de Modo Pruebas */}
      <ModoPruebasAlert modoPruebas={configuracion?.modo_pruebas || false} />
      
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
                disabled={!isEditing}
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
                onChange={handleRfcChange}
                placeholder="EEM123456789"
                className="uppercase"
                maxLength={13}
                disabled={!isEditing}
              />
              <ValidationIndicator 
                status={rfcValidationStatus} 
                message={form.formState.errors.rfc_emisor?.message}
              />
            </div>
          </div>

          <RegimesFiscalesSelector
            value={form.watch('regimen_fiscal')}
            onValueChange={(value) => form.setValue('regimen_fiscal', value)}
            required
            error={form.formState.errors.regimen_fiscal?.message}
            disabled={!isEditing}
          />
          
          {/* Validación RFC contra SAT */}
          {isEditing && form.watch('rfc_emisor') && form.watch('razon_social') && (
            <DatosFiscalesValidacion
              rfc={form.watch('rfc_emisor')}
              razonSocial={form.watch('razon_social')}
              modoPruebas={configuracion?.modo_pruebas || false}
              onValidacionExitosa={(rfcValidado, razonSocialNormalizada, regimenFiscal) => {
                form.setValue('rfc_emisor', rfcValidado);
                form.setValue('razon_social', razonSocialNormalizada);
                if (regimenFiscal) {
                  form.setValue('regimen_fiscal', regimenFiscal);
                }
                setRfcValidadoSAT(true);
              }}
            />
          )}
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
              onValueChange={handleCodigoPostalSelect}
              placeholder="Buscar código postal..."
              disabled={!isEditing}
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
                placeholder="Se autocompleta con el C.P."
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="municipio">Municipio *</Label>
              <Input
                id="municipio"
                {...form.register('municipio')}
                placeholder="Se autocompleta con el C.P."
                readOnly
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="colonia">Colonia *</Label>
            <Input
              id="colonia"
              {...form.register('colonia')}
              placeholder="Centro"
              disabled={!isEditing}
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
              disabled={!isEditing}
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
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numero_interior">Número Interior</Label>
              <Input
                id="numero_interior"
                {...form.register('numero_interior')}
                placeholder="A"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="localidad">Localidad</Label>
              <Input
                id="localidad"
                {...form.register('localidad')}
                placeholder="Guadalajara"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referencia">Referencias</Label>
            <Input
              id="referencia"
              {...form.register('referencia')}
              placeholder="Entre calle X y calle Y"
              disabled={!isEditing}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pais">País *</Label>
            <Select
              value={form.watch('pais')}
              onValueChange={(value) => form.setValue('pais', value)}
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar país" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MEX">México</SelectItem>
                <SelectItem value="USA">Estados Unidos</SelectItem>
                <SelectItem value="CAN">Canadá</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.pais && (
              <p className="text-sm text-red-600">{form.formState.errors.pais.message}</p>
            )}
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
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folio_inicial">Folio Inicial</Label>
              <Input
                id="folio_inicial"
                type="number"
                {...form.register('folio_inicial', { valueAsNumber: true })}
                placeholder="1"
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="serie_factura">Serie para Facturación</Label>
              <Input
                id="serie_factura"
                {...form.register('serie_factura')}
                placeholder="ZS"
                disabled={!isEditing}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="folio_inicial_factura">Folio Inicial Facturación</Label>
              <Input
                id="folio_inicial_factura"
                type="number"
                {...form.register('folio_inicial_factura', { valueAsNumber: true })}
                placeholder="1"
                disabled={!isEditing}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-3">
        {!isEditing && (
          <Button 
            type="button"
            variant="outline"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            Editar Información
          </Button>
        )}
        
        {isEditing && (
          <>
            {configuracion?.razon_social && (
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  form.reset();
                }}
              >
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </>
        )}
      </div>
    </form>
  );
}
