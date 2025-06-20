
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertasCumplimientoPanel } from '@/components/validation/AlertasCumplimientoPanel';
import { useValidation } from '@/contexts/ValidationProvider';
import { Shield, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';

interface ViajeWizardValidacionesProps {
  data: ViajeWizardData;
  onNext: () => void;
  onPrev: () => void;
}

export function ViajeWizardValidaciones({ data, onNext, onPrev }: ViajeWizardValidacionesProps) {
  const {
    validaciones,
    isValidating,
    isValid,
    validarCartaPorte,
    aplicarAutoFix,
    exportarChecklist
  } = useValidation();

  // Validar automáticamente cuando cambian los datos
  useEffect(() => {
    if (data.cliente && data.descripcionMercancia && data.origen && data.destino && data.vehiculo) {
      const cartaPorteData = {
        mercancias: [{
          descripcion: data.descripcionMercancia,
          material_peligroso: false,
          peso_kg: 1000 // Valor por defecto
        }],
        ubicaciones: [
          { ...data.origen, tipo_ubicacion: 'Origen' },
          { ...data.destino, tipo_ubicacion: 'Destino' }
        ],
        autotransporte: {
          config_vehicular: data.vehiculo?.config_vehicular || 'C2',
          peso_bruto_vehicular: data.vehiculo?.peso_bruto_vehicular || 8500
        }
      };
      
      validarCartaPorte(cartaPorteData);
    }
  }, [data, validarCartaPorte]);

  const statsValidacion = {
    bloqueantes: validaciones.filter(v => v.level === 'bloqueante').length,
    advertencias: validaciones.filter(v => v.level === 'advertencia').length,
    autoCorregibles: validaciones.filter(v => v.autoFix).length
  };

  const canProceed = isValid && !isValidating;

  return (
    <div className="space-y-6">
      {/* Header de Validaciones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Validaciones Avanzadas SAT 3.1
            {isValidating && <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isValid ? (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Listo para proceder</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {statsValidacion.bloqueantes} problema(s) crítico(s)
                  </span>
                </div>
              )}

              {statsValidacion.advertencias > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                  {statsValidacion.advertencias} advertencias
                </Badge>
              )}

              {statsValidacion.autoCorregibles > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {statsValidacion.autoCorregibles} auto-corregibles
                </Badge>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => validarCartaPorte({
                  mercancias: [{
                    descripcion: data.descripcionMercancia,
                    material_peligroso: false,
                    peso_kg: 1000
                  }],
                  ubicaciones: [
                    { ...data.origen, tipo_ubicacion: 'Origen' },
                    { ...data.destino, tipo_ubicacion: 'Destino' }
                  ],
                  autotransporte: {
                    config_vehicular: data.vehiculo?.config_vehicular || 'C2',
                    peso_bruto_vehicular: data.vehiculo?.peso_bruto_vehicular || 8500
                  }
                })}
                disabled={isValidating}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Re-validar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Panel de Alertas */}
      <AlertasCumplimientoPanel
        validaciones={validaciones}
        onAutoFix={aplicarAutoFix}
        onExportChecklist={exportarChecklist}
        showStats={true}
      />

      {/* Información del Viaje */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle className="text-base">Resumen del Viaje</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Cliente:</span> {data.cliente?.nombre_razon_social}
            </div>
            <div>
              <span className="font-medium">Servicio:</span> {data.tipoServicio}
            </div>
            <div>
              <span className="font-medium">Origen:</span> {data.origen?.nombre}
            </div>
            <div>
              <span className="font-medium">Destino:</span> {data.destino?.nombre}
            </div>
            <div>
              <span className="font-medium">Vehículo:</span> {data.vehiculo?.placa_vm}
            </div>
            <div>
              <span className="font-medium">Conductor:</span> {data.conductor?.nombre}
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <span className="font-medium">Mercancía:</span>
            <p className="text-sm text-gray-600 mt-1">{data.descripcionMercancia}</p>
          </div>
        </CardContent>
      </Card>

      {/* Navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          Anterior
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!canProceed}
          className={canProceed ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          {canProceed ? 'Proceder al Resumen' : 'Corregir Problemas Primero'}
        </Button>
      </div>
    </div>
  );
}
