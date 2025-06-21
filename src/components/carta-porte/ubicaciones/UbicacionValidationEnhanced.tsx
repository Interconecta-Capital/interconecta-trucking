
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, MapPin, Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface UbicacionData {
  domicilio: {
    pais?: string;
    codigo_postal?: string;
    estado?: string;
    municipio?: string;
    colonia?: string;
    calle?: string;
    numero_exterior?: string;
    localidad?: string;
  };
  coordenadas?: {
    latitud: number;
    longitud: number;
  };
}

interface UbicacionValidationEnhancedProps {
  ubicacion: UbicacionData;
  tipo: 'Origen' | 'Destino' | 'Paso Intermedio';
  onValidationChange: (isValid: boolean, errors: string[]) => void;
  onAutoCorrect?: (correctedData: UbicacionData) => void;
}

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
  autoFixable: boolean;
}

export function UbicacionValidationEnhanced({
  ubicacion,
  tipo,
  onValidationChange,
  onAutoCorrect
}: UbicacionValidationEnhancedProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isAutoFixing, setIsAutoFixing] = useState(false);

  useEffect(() => {
    validateUbicacion();
  }, [ubicacion]);

  const validateUbicacion = async () => {
    setIsValidating(true);
    const errors: ValidationError[] = [];

    try {
      // Validaciones críticas obligatorias por SAT
      if (!ubicacion.domicilio.codigo_postal) {
        errors.push({
          field: 'codigo_postal',
          message: 'Código postal es OBLIGATORIO para cumplir con SAT',
          severity: 'error',
          autoFixable: false
        });
      } else if (!/^\d{5}$/.test(ubicacion.domicilio.codigo_postal)) {
        errors.push({
          field: 'codigo_postal',
          message: 'Código postal debe tener exactamente 5 dígitos',
          severity: 'error',
          autoFixable: false
        });
      }

      if (!ubicacion.domicilio.estado) {
        errors.push({
          field: 'estado',
          message: 'Estado es OBLIGATORIO para cumplir con SAT',
          severity: 'error',
          autoFixable: true
        });
      }

      if (!ubicacion.domicilio.municipio) {
        errors.push({
          field: 'municipio',
          message: 'Municipio es OBLIGATORIO para cumplir con SAT',
          severity: 'error',
          autoFixable: true
        });
      }

      if (!ubicacion.domicilio.localidad && !ubicacion.domicilio.colonia) {
        errors.push({
          field: 'localidad',
          message: 'Localidad o Colonia es OBLIGATORIA para cumplir con SAT',
          severity: 'error',
          autoFixable: true
        });
      }

      if (!ubicacion.domicilio.calle) {
        errors.push({
          field: 'calle',
          message: 'Calle es OBLIGATORIA para cumplir con SAT',
          severity: 'error',
          autoFixable: false
        });
      }

      // Validaciones adicionales
      if (!ubicacion.coordenadas) {
        errors.push({
          field: 'coordenadas',
          message: 'Coordenadas GPS recomendadas para seguimiento',
          severity: 'warning',
          autoFixable: true
        });
      }

      // Validar consistencia de código postal con estado/municipio
      if (ubicacion.domicilio.codigo_postal && ubicacion.domicilio.estado) {
        const cpValidation = await validateCodigoPostal(
          ubicacion.domicilio.codigo_postal,
          ubicacion.domicilio.estado,
          ubicacion.domicilio.municipio
        );
        
        if (!cpValidation.isValid) {
          errors.push({
            field: 'codigo_postal',
            message: cpValidation.message,
            severity: 'warning',
            autoFixable: true
          });
        }
      }

      setValidationErrors(errors);
      
      const hasErrors = errors.some(e => e.severity === 'error');
      const errorMessages = errors.filter(e => e.severity === 'error').map(e => e.message);
      
      onValidationChange(!hasErrors, errorMessages);
      
    } catch (error) {
      console.error('Error validating ubicacion:', error);
      toast.error('Error al validar la ubicación');
    } finally {
      setIsValidating(false);
    }
  };

  const validateCodigoPostal = async (cp: string, estado?: string, municipio?: string) => {
    try {
      // Esta sería una llamada a un servicio real de validación de códigos postales
      // Por ahora, implementamos validación básica
      const cpPattern = /^\d{5}$/;
      if (!cpPattern.test(cp)) {
        return {
          isValid: false,
          message: 'Formato de código postal inválido'
        };
      }

      // Validación básica de rangos por estado (ejemplos)
      const stateRanges: { [key: string]: { min: number; max: number } } = {
        'CDMX': { min: 1000, max: 16999 },
        'JALISCO': { min: 44000, max: 49999 },
        'NUEVO LEON': { min: 64000, max: 67999 },
        // Agregar más estados según necesidad
      };

      const cpNumber = parseInt(cp);
      const stateRange = stateRanges[estado?.toUpperCase() || ''];
      
      if (stateRange && (cpNumber < stateRange.min || cpNumber > stateRange.max)) {
        return {
          isValid: false,
          message: `Código postal no corresponde al estado ${estado}`
        };
      }

      return { isValid: true, message: 'Código postal válido' };
    } catch (error) {
      return { isValid: false, message: 'Error validando código postal' };
    }
  };

  const handleAutoFix = async () => {
    if (!onAutoCorrect) return;

    setIsAutoFixing(true);
    
    try {
      const fixableErrors = validationErrors.filter(e => e.autoFixable);
      
      if (fixableErrors.length === 0) {
        toast.warning('No hay errores que se puedan corregir automáticamente');
        return;
      }

      // Intentar auto-correcciones basadas en código postal
      if (ubicacion.domicilio.codigo_postal) {
        const correctedData = await autocorrectFromCodigoPostal(ubicacion.domicilio.codigo_postal);
        
        if (correctedData) {
          onAutoCorrect({
            ...ubicacion,
            domicilio: {
              ...ubicacion.domicilio,
              ...correctedData
            }
          });
          
          toast.success('Ubicación corregida automáticamente');
        }
      }
    } catch (error) {
      console.error('Error auto-fixing ubicacion:', error);
      toast.error('Error al auto-corregir la ubicación');
    } finally {
      setIsAutoFixing(false);
    }
  };

  const autocorrectFromCodigoPostal = async (codigoPostal: string) => {
    try {
      // Simulación de servicio de códigos postales
      // En producción, esto sería una llamada a la API de SEPOMEX o similar
      const cpData: { [key: string]: any } = {
        '01000': {
          estado: 'CIUDAD DE MEXICO',
          municipio: 'CUAUHTEMOC',
          colonia: 'CENTRO',
          localidad: 'CIUDAD DE MEXICO'
        },
        '44100': {
          estado: 'JALISCO',
          municipio: 'GUADALAJARA',
          colonia: 'CENTRO',
          localidad: 'GUADALAJARA'
        }
        // Agregar más códigos postales según necesidad
      };

      return cpData[codigoPostal] || null;
    } catch (error) {
      console.error('Error fetching CP data:', error);
      return null;
    }
  };

  const getValidationSummary = () => {
    const errors = validationErrors.filter(e => e.severity === 'error').length;
    const warnings = validationErrors.filter(e => e.severity === 'warning').length;
    
    if (errors === 0 && warnings === 0) {
      return { status: 'success', message: 'Ubicación completa y válida' };
    } else if (errors === 0) {
      return { status: 'warning', message: `${warnings} advertencia(s)` };
    } else {
      return { status: 'error', message: `${errors} error(es) crítico(s)` };
    }
  };

  const summary = getValidationSummary();
  const hasAutoFixableErrors = validationErrors.some(e => e.autoFixable);

  return (
    <Card className={`border-2 ${
      summary.status === 'success' ? 'border-green-200 bg-green-50' :
      summary.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
      'border-red-200 bg-red-50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Validación de {tipo}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Badge variant={
              summary.status === 'success' ? 'default' :
              summary.status === 'warning' ? 'secondary' : 'destructive'
            }>
              {summary.status === 'success' && <CheckCircle className="h-3 w-3 mr-1" />}
              {summary.status !== 'success' && <AlertTriangle className="h-3 w-3 mr-1" />}
              {summary.message}
            </Badge>
            
            {hasAutoFixableErrors && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleAutoFix}
                disabled={isAutoFixing}
              >
                {isAutoFixing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Auto-corregir
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {validationErrors.length > 0 && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {validationErrors.map((error, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 p-2 rounded text-sm ${
                  error.severity === 'error' 
                    ? 'bg-red-100 text-red-800 border border-red-200' 
                    : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                }`}
              >
                <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <span className="font-medium">{error.field}:</span> {error.message}
                  {error.autoFixable && (
                    <span className="text-xs ml-2">(Auto-corregible)</span>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {summary.status === 'error' && (
            <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ ATENCIÓN: Errores críticos detectados
              </p>
              <p className="text-xs text-red-700 mt-1">
                Direcciones incompletas causan rechazo del SAT y multas de hasta $50,000 MXN.
                Complete todos los campos obligatorios antes de continuar.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
