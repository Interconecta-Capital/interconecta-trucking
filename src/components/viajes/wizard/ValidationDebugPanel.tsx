/**
 * FASE 5: Panel de depuración de validaciones
 * Muestra el estado detallado de validación del wizard
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { ViajeWizardData } from '../ViajeWizard';
import { toast } from 'sonner';

interface ValidationDebugPanelProps {
  wizardData: ViajeWizardData;
  cartaPorteData?: any;
}

export function ValidationDebugPanel({ wizardData, cartaPorteData }: ValidationDebugPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawData, setShowRawData] = useState(false);

  // Validaciones del estado actual
  const validaciones = {
    usoCFDI: {
      valido: !!wizardData.tipoServicio,
      mensaje: wizardData.tipoServicio ? `✅ Uso CFDI: ${wizardData.tipoServicio}` : '❌ Falta uso CFDI'
    },
    ubicaciones: {
      valido: !!wizardData.origen && !!wizardData.destino,
      mensaje: wizardData.origen && wizardData.destino ? '✅ Origen y destino configurados' : '❌ Faltan ubicaciones'
    },
    codigosPostales: {
      valido: (wizardData.origen?.domicilio?.codigo_postal || wizardData.origen?.domicilio?.codigoPostal) &&
              (wizardData.destino?.domicilio?.codigo_postal || wizardData.destino?.domicilio?.codigoPostal),
      mensaje: 'Códigos postales presentes'
    },
    coordenadas: {
      valido: !!wizardData.origen?.coordenadas && !!wizardData.destino?.coordenadas,
      mensaje: wizardData.origen?.coordenadas && wizardData.destino?.coordenadas 
        ? '✅ Ubicaciones geocodificadas' 
        : '⚠️ Faltan coordenadas GPS'
    },
    figuras: {
      valido: !!wizardData.conductor,
      mensaje: wizardData.conductor ? '✅ Conductor asignado' : '❌ Falta conductor (operador)'
    },
    distancia: {
      valido: !!wizardData.distanciaTotal && wizardData.distanciaTotal > 0,
      mensaje: wizardData.distanciaTotal 
        ? `✅ Distancia: ${wizardData.distanciaTotal.toFixed(2)} km` 
        : '⚠️ Distancia no calculada'
    },
    activos: {
      valido: !!wizardData.vehiculo && !!wizardData.conductor,
      mensaje: (wizardData.vehiculo && wizardData.conductor) 
        ? '✅ Vehículo y conductor asignados' 
        : '❌ Faltan activos'
    }
  };

  const validacionesArray = Object.entries(validaciones);
  const totalValidaciones = validacionesArray.length;
  const validacionesOk = validacionesArray.filter(([_, v]) => v.valido).length;
  const porcentaje = Math.round((validacionesOk / totalValidaciones) * 100);

  const handleCopyData = () => {
    const dataExport = {
      wizardData,
      cartaPorteData,
      validaciones,
      timestamp: new Date().toISOString()
    };
    
    navigator.clipboard.writeText(JSON.stringify(dataExport, null, 2));
    toast.success('Datos copiados al portapapeles');
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span>🔍 Estado de Validación</span>
            <Badge variant={porcentaje === 100 ? 'default' : porcentaje >= 70 ? 'secondary' : 'destructive'}>
              {validacionesOk}/{totalValidaciones} ({porcentaje}%)
            </Badge>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Lista de validaciones */}
          <div className="space-y-2">
            {validacionesArray.map(([key, validacion]) => (
              <div key={key} className="flex items-start gap-2 text-sm">
                {validacion.valido ? (
                  <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                ) : validacion.mensaje.includes('⚠️') ? (
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
                )}
                <span className={validacion.valido ? 'text-muted-foreground' : 'text-foreground'}>
                  {validacion.mensaje}
                </span>
              </div>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowRawData(!showRawData)}
            >
              {showRawData ? 'Ocultar' : 'Ver'} Datos Crudos
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleCopyData}
            >
              <Copy className="h-3 w-3 mr-2" />
              Copiar JSON
            </Button>
          </div>

          {/* Datos crudos */}
          {showRawData && (
            <div className="space-y-2">
              <div className="text-xs font-mono bg-muted p-3 rounded-md max-h-64 overflow-auto">
                <div className="font-semibold mb-2">Wizard Data:</div>
                <pre className="whitespace-pre-wrap">
                  {JSON.stringify(wizardData, null, 2)}
                </pre>
              </div>

              {cartaPorteData && (
                <div className="text-xs font-mono bg-muted p-3 rounded-md max-h-64 overflow-auto">
                  <div className="font-semibold mb-2">Carta Porte Data:</div>
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(cartaPorteData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
