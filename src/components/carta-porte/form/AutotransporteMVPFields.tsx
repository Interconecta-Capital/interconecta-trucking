
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Truck, AlertTriangle } from 'lucide-react';
import { AutotransporteCompleto } from '@/types/cartaPorte';

interface AutotransporteMVPFieldsProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  pesoTotalMercancias?: number;
}

export function AutotransporteMVPFields({ 
  data, 
  onChange, 
  pesoTotalMercancias = 0 
}: AutotransporteMVPFieldsProps) {
  
  const handleChange = (field: keyof AutotransporteCompleto, value: any) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const validarPesoBrutoVehicular = () => {
    if (!data.peso_bruto_vehicular || pesoTotalMercancias === 0) return null;
    
    const capacidadDisponible = data.peso_bruto_vehicular - pesoTotalMercancias;
    
    if (capacidadDisponible < 0) {
      return {
        type: 'error',
        message: `Sobrepeso: ${Math.abs(capacidadDisponible)} kg excedidos`
      };
    } else if (capacidadDisponible < data.peso_bruto_vehicular * 0.1) {
      return {
        type: 'warning',
        message: `Capacidad casi al límite: ${capacidadDisponible} kg disponibles`
      };
    }
    
    return {
      type: 'success',
      message: `Capacidad disponible: ${capacidadDisponible} kg`
    };
  };

  const validacionPeso = validarPesoBrutoVehicular();

  return (
    <Card className="border-orange-200 bg-orange-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Truck className="h-5 w-5" />
          <span>Campos Obligatorios MVP Legal</span>
          <Badge variant="destructive" className="text-xs">
            REQUERIDO SAT
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Peso Bruto Vehicular - OBLIGATORIO */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Peso Bruto Vehicular (kg) *
            <Badge variant="destructive" className="text-xs">OBLIGATORIO</Badge>
          </Label>
          <Input
            type="number"
            value={data.peso_bruto_vehicular || ''}
            onChange={(e) => handleChange('peso_bruto_vehicular', parseFloat(e.target.value) || 0)}
            placeholder="Ej: 40000"
            min="1"
            step="1"
            required
          />
          {validacionPeso && (
            <div className={`flex items-center gap-2 text-xs p-2 rounded ${
              validacionPeso.type === 'error' ? 'bg-red-100 text-red-800' :
              validacionPeso.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
              {validacionPeso.type === 'error' && <AlertTriangle className="h-3 w-3" />}
              {validacionPeso.message}
            </div>
          )}
          <p className="text-xs text-gray-600">
            Peso máximo que puede transportar el vehículo incluyendo mercancías
          </p>
        </div>

        {/* Número de Serie VIN - REQUERIDO para identificación */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            Número de Serie (VIN)
            <Badge variant="outline" className="text-xs">RECOMENDADO</Badge>
          </Label>
          <Input
            value={data.numero_serie_vin || ''}
            onChange={(e) => handleChange('numero_serie_vin', e.target.value)}
            placeholder="Ej: 1HGBH41JXMN109186"
            maxLength={17}
            className="uppercase"
          />
          <p className="text-xs text-gray-600">
            Número de identificación vehicular de 17 caracteres
          </p>
        </div>

        {/* Vigencias de Seguros - OBLIGATORIAS v3.1 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium flex items-center gap-2">
              Vigencia Seguro Responsabilidad Civil *
              <Badge variant="destructive" className="text-xs">OBLIGATORIO</Badge>
            </Label>
            <Input
              type="date"
              value={data.vigencia_resp_civil || ''}
              onChange={(e) => handleChange('vigencia_resp_civil', e.target.value)}
              required
            />
          </div>

          {data.asegura_med_ambiente && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Vigencia Seguro Medio Ambiente
              </Label>
              <Input
                type="date"
                value={data.vigencia_med_ambiente || ''}
                onChange={(e) => handleChange('vigencia_med_ambiente', e.target.value)}
              />
              <p className="text-xs text-gray-600">
                Obligatorio si transporta materiales peligrosos
              </p>
            </div>
          )}
        </div>

        {/* Seguros Opcionales Recomendados */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Aseguradora de Carga</Label>
            <Input
              value={data.asegura_carga || ''}
              onChange={(e) => handleChange('asegura_carga', e.target.value)}
              placeholder="Nombre de la aseguradora"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Póliza de Carga</Label>
            <Input
              value={data.poliza_carga || ''}
              onChange={(e) => handleChange('poliza_carga', e.target.value)}
              placeholder="Número de póliza"
            />
          </div>
        </div>

        {/* Dimensiones del vehículo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Dimensiones del Vehículo (metros)</Label>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Largo</Label>
              <Input
                type="number"
                value={data.dimensiones?.largo || ''}
                onChange={(e) => handleChange('dimensiones', {
                  ...data.dimensiones,
                  largo: parseFloat(e.target.value) || 0
                })}
                placeholder="12.0"
                step="0.1"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Ancho</Label>
              <Input
                type="number"
                value={data.dimensiones?.ancho || ''}
                onChange={(e) => handleChange('dimensiones', {
                  ...data.dimensiones,
                  ancho: parseFloat(e.target.value) || 0
                })}
                placeholder="2.5"
                step="0.1"
                min="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Alto</Label>
              <Input
                type="number"
                value={data.dimensiones?.alto || ''}
                onChange={(e) => handleChange('dimensiones', {
                  ...data.dimensiones,
                  alto: parseFloat(e.target.value) || 0
                })}
                placeholder="4.0"
                step="0.1"
                min="0"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
