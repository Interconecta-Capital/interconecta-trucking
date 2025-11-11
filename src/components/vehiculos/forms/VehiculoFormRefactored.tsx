import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVehiculos } from '@/hooks/useVehiculos';
import { VehiculoBasicFields } from './VehiculoBasicFields';
import { VehiculoSegurosFields } from './VehiculoSegurosFields';
import { VehiculoPermisosSCTFields } from './VehiculoPermisosSCTFields';
import { VehiculoEspecificacionesFields } from './VehiculoEspecificacionesFields';
import { VehiculoDocumentosSection } from './VehiculoDocumentosSection';
import { Truck } from 'lucide-react';
import { toast } from 'sonner';

interface VehiculoFormRefactoredProps {
  vehiculoId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function VehiculoFormRefactored({ vehiculoId, onSuccess, onCancel }: VehiculoFormRefactoredProps) {
  const [formData, setFormData] = useState<{
    placa: string;
    marca: string;
    modelo: string;
    anio: string;
    numero_serie_vin: string;
    config_vehicular: string;
    perm_sct: string;
    num_permiso_sct: string;
    vigencia_permiso: string;
    asegura_resp_civil: string;
    poliza_resp_civil: string;
    asegura_med_ambiente: string;
    poliza_med_ambiente: string;
    vigencia_seguro: string;
    capacidad_carga: string;
    tipo_carroceria: string;
    peso_bruto_vehicular: string;
    verificacion_vigencia: string;
    estado: string;
    tipo_combustible: 'diesel' | 'gasolina' | '';
    rendimiento: string;
    // Nuevos campos de costos
    costo_mantenimiento_km: string;
    costo_llantas_km: string;
    valor_vehiculo: string;
    configuracion_ejes: 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3';
    factor_peajes: string;
  }>({
    placa: '',
    marca: '',
    modelo: '',
    anio: '',
    numero_serie_vin: '',
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    vigencia_permiso: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    vigencia_seguro: '',
    capacidad_carga: '',
    tipo_carroceria: '',
    peso_bruto_vehicular: '',
    verificacion_vigencia: '',
    estado: 'disponible',
    tipo_combustible: '',
    rendimiento: '',
    costo_mantenimiento_km: '2.07',
    costo_llantas_km: '1.08',
    valor_vehiculo: '',
    configuracion_ejes: 'T3S2',
    factor_peajes: '2.0'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { crearVehiculo, actualizarVehiculo, vehiculos, loading } = useVehiculos();

  const vehiculoActual = vehiculoId ? vehiculos.find(v => v.id === vehiculoId) : null;

  useEffect(() => {
    if (vehiculoActual) {
      setFormData({
        placa: vehiculoActual.placa || '',
        marca: vehiculoActual.marca || '',
        modelo: vehiculoActual.modelo || '',
        anio: vehiculoActual.anio?.toString() || '',
        numero_serie_vin: vehiculoActual.numero_serie_vin || '',
        config_vehicular: vehiculoActual.config_vehicular || '',
        perm_sct: vehiculoActual.perm_sct || '',
        num_permiso_sct: vehiculoActual.num_permiso_sct || '',
        vigencia_permiso: vehiculoActual.vigencia_permiso || '',
        asegura_resp_civil: vehiculoActual.asegura_resp_civil || '',
        poliza_resp_civil: vehiculoActual.poliza_resp_civil || '',
        asegura_med_ambiente: vehiculoActual.asegura_med_ambiente || '',
        poliza_med_ambiente: vehiculoActual.poliza_med_ambiente || '',
        vigencia_seguro: vehiculoActual.vigencia_seguro || '',
        capacidad_carga: vehiculoActual.capacidad_carga?.toString() || '',
        tipo_carroceria: vehiculoActual.tipo_carroceria || '',
        peso_bruto_vehicular: vehiculoActual.peso_bruto_vehicular?.toString() || '',
        verificacion_vigencia: vehiculoActual.verificacion_vigencia || '',
        estado: vehiculoActual.estado || 'disponible',
        tipo_combustible: (vehiculoActual.tipo_combustible as 'diesel' | 'gasolina') || '',
        rendimiento: vehiculoActual.rendimiento?.toString() || '',
        costo_mantenimiento_km: vehiculoActual.costo_mantenimiento_km?.toString() || '2.07',
        costo_llantas_km: vehiculoActual.costo_llantas_km?.toString() || '1.08',
        valor_vehiculo: vehiculoActual.valor_vehiculo?.toString() || '',
        configuracion_ejes: (vehiculoActual.configuracion_ejes || 'T3S2') as 'C2' | 'C3' | 'T2S1' | 'T3S2' | 'T3S3',
        factor_peajes: vehiculoActual.factor_peajes?.toString() || '2.0'
      });
    }
  }, [vehiculoActual]);

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.placa?.trim()) {
      newErrors.placa = 'La placa es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [savedVehiculoId, setSavedVehiculoId] = useState<string | undefined>(vehiculoId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      const vehiculoData = {
        ...formData,
        anio: formData.anio ? parseInt(formData.anio) : undefined,
        capacidad_carga: formData.capacidad_carga ? parseFloat(formData.capacidad_carga) : undefined,
        peso_bruto_vehicular: formData.peso_bruto_vehicular ? parseFloat(formData.peso_bruto_vehicular) : undefined,
        rendimiento: formData.rendimiento ? parseFloat(formData.rendimiento) : undefined,
        tipo_combustible: formData.tipo_combustible || undefined,
        costo_mantenimiento_km: parseFloat(formData.costo_mantenimiento_km) || 2.07,
        costo_llantas_km: parseFloat(formData.costo_llantas_km) || 1.08,
        valor_vehiculo: formData.valor_vehiculo ? parseFloat(formData.valor_vehiculo) : undefined,
        factor_peajes: parseFloat(formData.factor_peajes) || 2.0,
        estado: (formData.estado as 'disponible' | 'en_viaje' | 'mantenimiento' | 'revision' | 'fuera_servicio') || 'disponible',
        activo: true
      };

      if (vehiculoId) {
        await actualizarVehiculo({ id: vehiculoId, data: vehiculoData });
      } else {
        const nuevoVehiculo = await crearVehiculo(vehiculoData);
        // Guardar el ID del vehículo recién creado para documentos
        setSavedVehiculoId(nuevoVehiculo.id);
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error al guardar vehículo:', error);
      toast.error('Error al guardar el vehículo');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          {vehiculoId ? 'Editar Vehículo' : 'Nuevo Vehículo'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="datos" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="datos">Datos Básicos</TabsTrigger>
            <TabsTrigger value="permisos">Permisos SCT</TabsTrigger>
            <TabsTrigger value="seguros">Seguros</TabsTrigger>
            <TabsTrigger value="especificaciones">Especificaciones</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
          </TabsList>

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <TabsContent value="datos">
              <VehiculoBasicFields
                formData={formData}
                onFieldChange={handleFieldChange}
                errors={errors}
              />
            </TabsContent>

            <TabsContent value="permisos">
              <VehiculoPermisosSCTFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value="seguros">
              <VehiculoSegurosFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value="especificaciones">
              <VehiculoEspecificacionesFields
                formData={formData}
                onFieldChange={handleFieldChange}
              />
            </TabsContent>

            <TabsContent value="documentos">
              <VehiculoDocumentosSection
                vehiculoId={savedVehiculoId}
                onDocumentosChange={(docs) => console.log('Documentos actualizados:', docs)}
              />
            </TabsContent>

            <div className="flex gap-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : (vehiculoId ? 'Actualizar' : 'Crear')}
              </Button>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
