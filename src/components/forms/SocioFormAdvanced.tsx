import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { FileUpload } from './FileUpload';
import { toast } from 'sonner';
import { User, FileText, MapPin } from 'lucide-react';

interface SocioFormAdvancedProps {
  socio?: any;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function SocioFormAdvanced({ socio, onSubmit, onCancel }: SocioFormAdvancedProps) {
  const [loading, setLoading] = useState(false);
  const [constanciaFiles, setConstanciaFiles] = useState<File[]>([]);
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    defaultValues: {
      nombre_razon_social: socio?.nombre_razon_social || '',
      rfc: socio?.rfc || '',
      regimen_fiscal: socio?.regimen_fiscal || '',
      telefono: socio?.telefono || '',
      email: socio?.email || '',
      direccion: socio?.direccion || '',
      codigo_postal: socio?.codigo_postal || '',
      colonia: socio?.colonia || '', // Campo agregado
      ciudad: socio?.ciudad || '',
      estado: socio?.estado || '',
      tipo_socio: socio?.tipo_socio || 'proveedor',
      observaciones: socio?.observaciones || ''
    }
  });

  // Autocompletar datos de código postal (simplificado)
  const codigoPostal = watch('codigo_postal');
  
  useEffect(() => {
    if (codigoPostal && codigoPostal.length === 5) {
      // Aquí se podría integrar con el servicio de códigos postales
      // Por ahora es un placeholder
      console.log('Buscando datos para CP:', codigoPostal);
    }
  }, [codigoPostal]);

  const onSubmitForm = async (data: any) => {
    setLoading(true);
    try {
      const socioData = {
        ...data,
        constancia_fiscal_path: constanciaFiles.length > 0 ? 'pending_upload' : null
      };
      
      await onSubmit(socioData);
      
      // Si hay archivo, aquí se subiría
      if (constanciaFiles.length > 0) {
        console.log('Archivo a subir:', constanciaFiles[0]);
        // TODO: Implementar subida de archivo
      }
      
      toast.success(socio ? 'Socio actualizado exitosamente' : 'Socio creado exitosamente');
    } catch (error: any) {
      toast.error('Error al guardar socio: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      {/* Información Básica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Básica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre_razon_social">Nombre/Razón Social *</Label>
              <Input
                id="nombre_razon_social"
                {...register('nombre_razon_social', { required: 'Este campo es requerido' })}
                placeholder="Nombre completo o razón social"
              />
              {errors.nombre_razon_social && (
                <p className="text-sm text-red-500">{errors.nombre_razon_social.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rfc">RFC *</Label>
              <Input
                id="rfc"
                {...register('rfc', { 
                  required: 'Este campo es requerido',
                  pattern: {
                    value: /^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/,
                    message: 'Formato de RFC inválido'
                  }
                })}
                placeholder="RFC (12 o 13 caracteres)"
                className="uppercase"
              />
              {errors.rfc && (
                <p className="text-sm text-red-500">{errors.rfc.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="regimen_fiscal">Régimen Fiscal</Label>
              <Select onValueChange={(value) => setValue('regimen_fiscal', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar régimen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="601">General de Ley Personas Morales</SelectItem>
                  <SelectItem value="603">Personas Morales con Fines no Lucrativos</SelectItem>
                  <SelectItem value="605">Sueldos y Salarios e Ingresos Asimilados a Salarios</SelectItem>
                  <SelectItem value="606">Arrendamiento</SelectItem>
                  <SelectItem value="607">Régimen de Enajenación o Adquisición de Bienes</SelectItem>
                  <SelectItem value="608">Demás ingresos</SelectItem>
                  <SelectItem value="610">Residentes en el Extranjero sin Establecimiento Permanente en México</SelectItem>
                  <SelectItem value="611">Ingresos por Dividendos (socios y accionistas)</SelectItem>
                  <SelectItem value="612">Personas Físicas con Actividades Empresariales y Profesionales</SelectItem>
                  <SelectItem value="614">Ingresos por intereses</SelectItem>
                  <SelectItem value="616">Sin obligaciones fiscales</SelectItem>
                  <SelectItem value="620">Sociedades Cooperativas de Producción que optan por diferir sus ingresos</SelectItem>
                  <SelectItem value="621">Incorporación Fiscal</SelectItem>
                  <SelectItem value="622">Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras</SelectItem>
                  <SelectItem value="623">Opcional para Grupos de Sociedades</SelectItem>
                  <SelectItem value="624">Coordinados</SelectItem>
                  <SelectItem value="625">Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas</SelectItem>
                  <SelectItem value="626">Régimen Simplificado de Confianza</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_socio">Tipo de Socio</Label>
              <Select onValueChange={(value) => setValue('tipo_socio', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="proveedor">Proveedor</SelectItem>
                  <SelectItem value="ambos">Cliente y Proveedor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                {...register('telefono')}
                placeholder="Número de teléfono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dirección */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Dirección Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direccion">Calle y Número</Label>
            <Input
              id="direccion"
              {...register('direccion')}
              placeholder="Calle, número exterior e interior"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="codigo_postal">Código Postal</Label>
              <Input
                id="codigo_postal"
                {...register('codigo_postal', {
                  pattern: {
                    value: /^\d{5}$/,
                    message: 'Debe tener 5 dígitos'
                  }
                })}
                placeholder="00000"
                maxLength={5}
              />
              {errors.codigo_postal && (
                <p className="text-sm text-red-500">{errors.codigo_postal.message as string}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="colonia">Colonia</Label>
              <Input
                id="colonia"
                {...register('colonia')}
                placeholder="Nombre de la colonia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad">Ciudad/Municipio</Label>
              <Input
                id="ciudad"
                {...register('ciudad')}
                placeholder="Ciudad o municipio"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">Estado</Label>
            <Select onValueChange={(value) => setValue('estado', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aguascalientes">Aguascalientes</SelectItem>
                <SelectItem value="baja-california">Baja California</SelectItem>
                <SelectItem value="baja-california-sur">Baja California Sur</SelectItem>
                <SelectItem value="campeche">Campeche</SelectItem>
                <SelectItem value="chiapas">Chiapas</SelectItem>
                <SelectItem value="chihuahua">Chihuahua</SelectItem>
                <SelectItem value="ciudad-de-mexico">Ciudad de México</SelectItem>
                <SelectItem value="coahuila">Coahuila</SelectItem>
                <SelectItem value="colima">Colima</SelectItem>
                <SelectItem value="durango">Durango</SelectItem>
                <SelectItem value="estado-de-mexico">Estado de México</SelectItem>
                <SelectItem value="guanajuato">Guanajuato</SelectItem>
                <SelectItem value="guerrero">Guerrero</SelectItem>
                <SelectItem value="hidalgo">Hidalgo</SelectItem>
                <SelectItem value="jalisco">Jalisco</SelectItem>
                <SelectItem value="michoacan">Michoacán</SelectItem>
                <SelectItem value="morelos">Morelos</SelectItem>
                <SelectItem value="nayarit">Nayarit</SelectItem>
                <SelectItem value="nuevo-leon">Nuevo León</SelectItem>
                <SelectItem value="oaxaca">Oaxaca</SelectItem>
                <SelectItem value="puebla">Puebla</SelectItem>
                <SelectItem value="queretaro">Querétaro</SelectItem>
                <SelectItem value="quintana-roo">Quintana Roo</SelectItem>
                <SelectItem value="san-luis-potosi">San Luis Potosí</SelectItem>
                <SelectItem value="sinaloa">Sinaloa</SelectItem>
                <SelectItem value="sonora">Sonora</SelectItem>
                <SelectItem value="tabasco">Tabasco</SelectItem>
                <SelectItem value="tamaulipas">Tamaulipas</SelectItem>
                <SelectItem value="tlaxcala">Tlaxcala</SelectItem>
                <SelectItem value="veracruz">Veracruz</SelectItem>
                <SelectItem value="yucatan">Yucatán</SelectItem>
                <SelectItem value="zacatecas">Zacatecas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentos Fiscales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            label="Constancia de Situación Fiscal"
            accept=".pdf"
            multiple={false}
            onFilesChange={setConstanciaFiles}
            maxSize={5}
            description="Archivo PDF de máximo 5MB con la constancia actualizada del SAT"
          />
        </CardContent>
      </Card>

      {/* Observaciones */}
      <Card>
        <CardHeader>
          <CardTitle>Observaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="observaciones">Notas Adicionales</Label>
            <Textarea
              id="observaciones"
              {...register('observaciones')}
              placeholder="Información adicional sobre el socio..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : (socio ? 'Actualizar Socio' : 'Crear Socio')}
        </Button>
      </div>
    </form>
  );
}
