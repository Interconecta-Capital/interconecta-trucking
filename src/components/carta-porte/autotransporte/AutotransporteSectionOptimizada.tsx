
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AutotransporteFormOptimizado } from './AutotransporteFormOptimizado';
import { ArrowRight, ArrowLeft, AlertCircle, Truck, CheckCircle } from 'lucide-react';

interface AutotransporteCompleto {
  placa_vm: string;
  anio_modelo_vm: number;
  config_vehicular: string;
  perm_sct: string;
  num_permiso_sct: string;
  asegura_resp_civil: string;
  poliza_resp_civil: string;
  asegura_med_ambiente?: string;
  poliza_med_ambiente?: string;
  remolques?: any[];
}

interface AutotransporteSectionOptimizadaProps {
  data: AutotransporteCompleto;
  onChange: (data: AutotransporteCompleto) => void;
  onNext: () => void;
  onPrev: () => void;
}

export function AutotransporteSectionOptimizada({ data, onChange, onNext, onPrev }: AutotransporteSectionOptimizadaProps) {
  // Validar que los datos mínimos estén completos
  const isDataComplete = () => {
    return (
      data.placa_vm &&
      data.anio_modelo_vm &&
      data.config_vehicular &&
      data.perm_sct &&
      data.num_permiso_sct &&
      data.asegura_resp_civil &&
      data.poliza_resp_civil
    );
  };

  const getValidationErrors = () => {
    const errors: string[] = [];
    
    if (!data.placa_vm?.trim()) {
      errors.push('La placa del vehículo es requerida');
    }
    
    if (!data.anio_modelo_vm || data.anio_modelo_vm < 1990) {
      errors.push('El año del modelo es requerido y debe ser válido');
    }
    
    if (!data.config_vehicular?.trim()) {
      errors.push('La configuración vehicular es requerida');
    }
    
    if (!data.perm_sct?.trim()) {
      errors.push('El tipo de permiso SCT es requerido');
    }
    
    if (!data.num_permiso_sct?.trim()) {
      errors.push('El número de permiso SCT es requerido');
    }
    
    if (!data.asegura_resp_civil?.trim()) {
      errors.push('La aseguradora de responsabilidad civil es requerida');
    }
    
    if (!data.poliza_resp_civil?.trim()) {
      errors.push('El número de póliza de responsabilidad civil es requerido');
    }
    
    return errors;
  };

  const validationErrors = getValidationErrors();
  const isComplete = isDataComplete();

  const getCompletionPercentage = () => {
    const requiredFields = [
      'placa_vm',
      'anio_modelo_vm', 
      'config_vehicular',
      'perm_sct',
      'num_permiso_sct',
      'asegura_resp_civil',
      'poliza_resp_civil'
    ];
    
    const completedFields = requiredFields.filter(field => {
      const value = data[field as keyof AutotransporteCompleto];
      return value && String(value).trim() !== '';
    });
    
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="space-y-6">
      {/* Header con progreso */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Truck className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">Configuración de Autotransporte</h3>
                <p className="text-sm text-blue-700">
                  Configure los datos del vehículo, permisos y seguros requeridos por el SAT
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center gap-2 mb-1">
                {isComplete ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-blue-300"></div>
                )}
                <span className="font-medium text-blue-900">
                  {completionPercentage}% Completo
                </span>
              </div>
              <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario principal */}
      <AutotransporteFormOptimizado
        data={data}
        onChange={onChange}
      />

      {/* Validaciones y errores */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">Complete los siguientes campos requeridos:</p>
              <ul className="list-disc list-inside">
                {validationErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Información adicional */}
      {isComplete && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Configuración Completa</p>
                <p className="text-sm text-green-700">
                  Todos los datos del autotransporte están completos y son válidos según normativa SAT 3.1
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de configuración */}
      {data.placa_vm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de Configuración</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Vehículo:</span>
                <span className="ml-2 font-medium">{data.placa_vm} ({data.anio_modelo_vm})</span>
              </div>
              
              {data.config_vehicular && (
                <div>
                  <span className="text-muted-foreground">Configuración:</span>
                  <span className="ml-2 font-medium">{data.config_vehicular}</span>
                </div>
              )}
              
              {data.perm_sct && (
                <div>
                  <span className="text-muted-foreground">Permiso SCT:</span>
                  <span className="ml-2 font-medium">{data.perm_sct} - {data.num_permiso_sct}</span>
                </div>
              )}
              
              {data.asegura_resp_civil && (
                <div>
                  <span className="text-muted-foreground">Seguro:</span>
                  <span className="ml-2 font-medium">{data.asegura_resp_civil}</span>
                </div>
              )}
              
              {data.remolques && data.remolques.length > 0 && (
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Remolques:</span>
                  <span className="ml-2 font-medium">{data.remolques.length} configurado(s)</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev} className="flex items-center space-x-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Anterior</span>
        </Button>
        
        <Button 
          onClick={onNext} 
          disabled={!isComplete}
          className="flex items-center space-x-2"
        >
          <span>Continuar a Figuras</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
