import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Truck, Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { AutotransporteCompleto, RemolqueCCP } from '@/types/cartaPorte';
import { useCatalogosReal } from '@/hooks/useCatalogosReal';
import { AutotransporteMVPFields } from './form/AutotransporteMVPFields';

interface AutotransporteSectionProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext?: () => void;
  onPrev?: () => void;
  pesoTotalMercancias?: number;
}

export function AutotransporteSection({ 
  data, 
  onChange, 
  onNext, 
  onPrev,
  pesoTotalMercancias = 0 
}: AutotransporteSectionProps) {
  const { catalogos } = useCatalogosReal();

  const handleChange = (field: keyof AutotransporteCompleto, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const handleRemolqueChange = (index: number, field: keyof RemolqueCCP, value: any) => {
    const nuevosRemolques = [...(data.remolques || [])];
    nuevosRemolques[index] = {
      ...nuevosRemolques[index],
      [field]: value
    };
    handleChange('remolques', nuevosRemolques);
  };

  const agregarRemolque = () => {
    const nuevosRemolques = [...(data.remolques || [])];
    nuevosRemolques.push({
      id: `remolque-${Date.now()}`,
      placa: '',
      subtipo_rem: ''
    });
    handleChange('remolques', nuevosRemolques);
  };

  const eliminarRemolque = (index: number) => {
    const nuevosRemolques = [...(data.remolques || [])];
    nuevosRemolques.splice(index, 1);
    handleChange('remolques', nuevosRemolques);
  };

  const validarFormulario = () => {
    return data.placa_vm && 
           data.config_vehicular && 
           data.peso_bruto_vehicular && 
           data.peso_bruto_vehicular > 0 &&
           data.perm_sct && 
           data.num_permiso_sct &&
           data.asegura_resp_civil && 
           data.poliza_resp_civil &&
           data.vigencia_resp_civil;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Datos del Autotransporte</h2>
        <p className="text-gray-600 mt-2">
          Información técnica y legal del vehículo de transporte
        </p>
      </div>

      {/* Campos MVP Obligatorios */}
      <AutotransporteMVPFields 
        data={data}
        onChange={onChange}
        pesoTotalMercancias={pesoTotalMercancias}
      />

      {/* Datos básicos del vehículo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Datos del Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa del Vehículo Motor *</Label>
              <Input
                value={data.placa_vm || ''}
                onChange={(e) => handleChange('placa_vm', e.target.value.toUpperCase())}
                placeholder="ABC-123-D"
                className="uppercase"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Año Modelo *</Label>
              <Input
                type="number"
                value={data.anio_modelo_vm || ''}
                onChange={(e) => handleChange('anio_modelo_vm', parseInt(e.target.value))}
                placeholder="2023"
                min="1990"
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Configuración Vehicular *</Label>
              <Select 
                value={data.config_vehicular || ''} 
                onValueChange={(value) => handleChange('config_vehicular', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar configuración" />
                </SelectTrigger>
                <SelectContent>
                  {catalogos.configuracionVehicular?.map((item) => (
                    <SelectItem key={item.clave} value={item.clave}>
                      {item.clave} - {item.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Carrocería</Label>
              <Input
                value={data.tipo_carroceria || ''}
                onChange={(e) => handleChange('tipo_carroceria', e.target.value)}
                placeholder="Ej: 01 - Caja seca"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Permisos y documentación */}
      <Card>
        <CardHeader>
          <CardTitle>Permisos y Documentación</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Permiso SCT *</Label>
              <Select 
                value={data.perm_sct || ''} 
                onValueChange={(value) => handleChange('perm_sct', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar permiso" />
                </SelectTrigger>
                <SelectContent>
                  {catalogos.tipoPermiso?.map((item) => (
                    <SelectItem key={item.clave} value={item.clave}>
                      {item.clave} - {item.descripcion}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Número de Permiso SCT *</Label>
              <Input
                value={data.num_permiso_sct || ''}
                onChange={(e) => handleChange('num_permiso_sct', e.target.value)}
                placeholder="Número del permiso"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tarjeta de Circulación</Label>
              <Input
                value={data.tarjeta_circulacion || ''}
                onChange={(e) => handleChange('tarjeta_circulacion', e.target.value)}
                placeholder="Número de tarjeta"
              />
            </div>

            <div className="space-y-2">
              <Label>Vigencia Tarjeta de Circulación</Label>
              <Input
                type="date"
                value={data.vigencia_tarjeta_circulacion || ''}
                onChange={(e) => handleChange('vigencia_tarjeta_circulacion', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seguros */}
      <Card>
        <CardHeader>
          <CardTitle>Seguros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aseguradora Responsabilidad Civil *</Label>
              <Input
                value={data.asegura_resp_civil || ''}
                onChange={(e) => handleChange('asegura_resp_civil', e.target.value)}
                placeholder="Nombre de la aseguradora"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Póliza Responsabilidad Civil *</Label>
              <Input
                value={data.poliza_resp_civil || ''}
                onChange={(e) => handleChange('poliza_resp_civil', e.target.value)}
                placeholder="Número de póliza"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Aseguradora Medio Ambiente</Label>
              <Input
                value={data.asegura_med_ambiente || ''}
                onChange={(e) => handleChange('asegura_med_ambiente', e.target.value)}
                placeholder="Nombre de la aseguradora"
              />
            </div>

            <div className="space-y-2">
              <Label>Póliza Medio Ambiente</Label>
              <Input
                value={data.poliza_med_ambiente || ''}
                onChange={(e) => handleChange('poliza_med_ambiente', e.target.value)}
                placeholder="Número de póliza"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Remolques */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Remolques/Semirremolques</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={agregarRemolque}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Agregar Remolque
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.remolques && data.remolques.length > 0 ? (
            data.remolques.map((remolque, index) => (
              <div key={remolque.id} className="border rounded-lg p-4 relative">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => eliminarRemolque(index)}
                  className="absolute top-2 right-2 text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                  <div className="space-y-2">
                    <Label>Placa del Remolque</Label>
                    <Input
                      value={remolque.placa}
                      onChange={(e) => handleRemolqueChange(index, 'placa', e.target.value)}
                      placeholder="XYZ-123-R"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Subtipo de Remolque</Label>
                    <Select 
                      value={remolque.subtipo_rem} 
                      onValueChange={(value) => handleRemolqueChange(index, 'subtipo_rem', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar subtipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {catalogos.subtipoRemolque?.map((item) => (
                          <SelectItem key={item.clave} value={item.clave}>
                            {item.clave} - {item.descripcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No hay remolques agregados
            </p>
          )}
        </CardContent>
      </Card>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onPrev}
          className="flex items-center gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>

        <div className="flex items-center gap-2">
          {!validarFormulario() && (
            <Badge variant="destructive">
              Completa los campos obligatorios
            </Badge>
          )}
          <Button
            type="button"
            onClick={onNext}
            disabled={!validarFormulario()}
            className="flex items-center gap-2"
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
