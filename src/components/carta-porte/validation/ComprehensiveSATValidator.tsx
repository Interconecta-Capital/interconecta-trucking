
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Shield, 
  FileCheck,
  RefreshCw,
  Info
} from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  satRule?: string;
}

interface SATValidationResult {
  isValid: boolean;
  completeness: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  recommendations: ValidationError[];
  missingFields: string[];
}

interface ComprehensiveSATValidatorProps {
  data: CartaPorteData;
  onValidationComplete?: (result: SATValidationResult) => void;
  autoValidate?: boolean;
}

export function ComprehensiveSATValidator({ 
  data, 
  onValidationComplete, 
  autoValidate = true 
}: ComprehensiveSATValidatorProps) {
  const [validationResult, setValidationResult] = useState<SATValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateSATCompliance = async (): Promise<SATValidationResult> => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const recommendations: ValidationError[] = [];
    const missingFields: string[] = [];

    // Validaciones obligatorias v3.1
    if (!data.rfcEmisor) {
      errors.push({
        field: 'rfcEmisor',
        message: 'RFC del emisor es obligatorio',
        severity: 'error',
        satRule: 'Art. 29-A CFF'
      });
      missingFields.push('RFC Emisor');
    }

    if (!data.rfcReceptor) {
      errors.push({
        field: 'rfcReceptor',
        message: 'RFC del receptor es obligatorio',
        severity: 'error',
        satRule: 'Art. 29-A CFF'
      });
      missingFields.push('RFC Receptor');
    }

    if (!data.nombreEmisor) {
      errors.push({
        field: 'nombreEmisor',
        message: 'Nombre del emisor es obligatorio',
        severity: 'error'
      });
      missingFields.push('Nombre Emisor');
    }

    if (!data.nombreReceptor) {
      errors.push({
        field: 'nombreReceptor',
        message: 'Nombre del receptor es obligatorio',
        severity: 'error'
      });
      missingFields.push('Nombre Receptor');
    }

    // Validar ubicaciones (mínimo origen y destino)
    if (!data.ubicaciones || data.ubicaciones.length < 2) {
      errors.push({
        field: 'ubicaciones',
        message: 'Se requieren al menos 2 ubicaciones (origen y destino)',
        severity: 'error',
        satRule: 'Anexo 20 v3.1'
      });
      missingFields.push('Ubicaciones');
    } else {
      const tieneOrigen = data.ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
      const tieneDestino = data.ubicaciones.some(u => u.tipo_ubicacion === 'Destino');
      
      if (!tieneOrigen) {
        errors.push({
          field: 'ubicaciones.origen',
          message: 'Debe especificar al menos una ubicación de origen',
          severity: 'error'
        });
      }
      
      if (!tieneDestino) {
        errors.push({
          field: 'ubicaciones.destino',
          message: 'Debe especificar al menos una ubicación de destino',
          severity: 'error'
        });
      }

      // Validar domicilios completos
      data.ubicaciones.forEach((ubicacion, index) => {
        if (!ubicacion.domicilio) {
          errors.push({
            field: `ubicaciones[${index}].domicilio`,
            message: `Domicilio de ubicación ${index + 1} es obligatorio`,
            severity: 'error'
          });
        } else {
          if (!ubicacion.domicilio.codigo_postal) {
            errors.push({
              field: `ubicaciones[${index}].domicilio.codigo_postal`,
              message: `Código postal de ubicación ${index + 1} es obligatorio`,
              severity: 'error'
            });
          }
          
          if (!ubicacion.domicilio.estado) {
            errors.push({
              field: `ubicaciones[${index}].domicilio.estado`,
              message: `Estado de ubicación ${index + 1} es obligatorio`,
              severity: 'error'
            });
          }
        }
      });
    }

    // Validar mercancías
    if (!data.mercancias || data.mercancias.length === 0) {
      errors.push({
        field: 'mercancias',
        message: 'Debe especificar al menos una mercancía',
        severity: 'error',
        satRule: 'Anexo 20 v3.1'
      });
      missingFields.push('Mercancías');
    } else {
      data.mercancias.forEach((mercancia, index) => {
        if (!mercancia.bienes_transp) {
          errors.push({
            field: `mercancias[${index}].bienes_transp`,
            message: `Clave SAT de mercancía ${index + 1} es obligatoria`,
            severity: 'error'
          });
        }

        if (!mercancia.descripcion) {
          errors.push({
            field: `mercancias[${index}].descripcion`,
            message: `Descripción de mercancía ${index + 1} es obligatoria`,
            severity: 'error'
          });
        }

        if (!mercancia.cantidad || mercancia.cantidad <= 0) {
          errors.push({
            field: `mercancias[${index}].cantidad`,
            message: `Cantidad de mercancía ${index + 1} debe ser mayor a 0`,
            severity: 'error'
          });
        }

        if (!mercancia.peso_kg || mercancia.peso_kg <= 0) {
          errors.push({
            field: `mercancias[${index}].peso_kg`,
            message: `Peso de mercancía ${index + 1} debe ser mayor a 0`,
            severity: 'error'
          });
        }

        if (!mercancia.clave_unidad) {
          errors.push({
            field: `mercancias[${index}].clave_unidad`,
            message: `Unidad de medida de mercancía ${index + 1} es obligatoria`,
            severity: 'error'
          });
        }

        // Validaciones específicas v3.1
        if (data.cartaPorteVersion === '3.1' && !mercancia.fraccion_arancelaria) {
          warnings.push({
            field: `mercancias[${index}].fraccion_arancelaria`,
            message: `Fracción arancelaria recomendada para v3.1 en mercancía ${index + 1}`,
            severity: 'warning'
          });
        }
      });
    }

    // Validar autotransporte
    if (!data.autotransporte) {
      errors.push({
        field: 'autotransporte',
        message: 'Información de autotransporte es obligatoria',
        severity: 'error',
        satRule: 'Anexo 20 v3.1'
      });
      missingFields.push('Autotransporte');
    } else {
      if (!data.autotransporte.placa_vm) {
        errors.push({
          field: 'autotransporte.placa_vm',
          message: 'Placa del vehículo motor es obligatoria',
          severity: 'error'
        });
      }

      if (!data.autotransporte.config_vehicular) {
        errors.push({
          field: 'autotransporte.config_vehicular',
          message: 'Configuración vehicular es obligatoria',
          severity: 'error'
        });
      }

      if (!data.autotransporte.asegura_resp_civil) {
        errors.push({
          field: 'autotransporte.asegura_resp_civil',
          message: 'Aseguradora de responsabilidad civil es obligatoria',
          severity: 'error'
        });
      }

      if (!data.autotransporte.poliza_resp_civil) {
        errors.push({
          field: 'autotransporte.poliza_resp_civil',
          message: 'Póliza de responsabilidad civil es obligatoria',
          severity: 'error'
        });
      }

      // Validaciones específicas v3.1
      if (data.cartaPorteVersion === '3.1') {
        if (!data.autotransporte.peso_bruto_vehicular || data.autotransporte.peso_bruto_vehicular <= 0) {
          errors.push({
            field: 'autotransporte.peso_bruto_vehicular',
            message: 'Peso bruto vehicular es obligatorio en v3.1',
            severity: 'error',
            satRule: 'Anexo 20 v3.1'
          });
        }
      }
    }

    // Validar figuras de transporte
    if (!data.figuras || data.figuras.length === 0) {
      errors.push({
        field: 'figuras',
        message: 'Debe especificar al menos una figura de transporte',
        severity: 'error',
        satRule: 'Anexo 20 v3.1'
      });
      missingFields.push('Figuras de Transporte');
    } else {
      data.figuras.forEach((figura, index) => {
        if (!figura.tipo_figura) {
          errors.push({
            field: `figuras[${index}].tipo_figura`,
            message: `Tipo de figura ${index + 1} es obligatorio`,
            severity: 'error'
          });
        }

        if (!figura.rfc_figura) {
          errors.push({
            field: `figuras[${index}].rfc_figura`,
            message: `RFC de figura ${index + 1} es obligatorio`,
            severity: 'error'
          });
        }

        if (!figura.nombre_figura) {
          errors.push({
            field: `figuras[${index}].nombre_figura`,
            message: `Nombre de figura ${index + 1} es obligatorio`,
            severity: 'error'
          });
        }
      });
    }

    // Validaciones de coherencia
    if (data.mercancias && data.autotransporte) {
      const pesoTotalMercancias = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
      const capacidadVehiculo = data.autotransporte.capacidad_carga || 0;
      
      if (capacidadVehiculo > 0 && pesoTotalMercancias > capacidadVehiculo) {
        warnings.push({
          field: 'coherencia.peso',
          message: 'Peso total de mercancías excede la capacidad del vehículo',
          severity: 'warning'
        });
      }
    }

    // Recomendaciones de optimización
    if (data.cartaPorteVersion === '3.0') {
      recommendations.push({
        field: 'version',
        message: 'Considere actualizar a Carta Porte v3.1 para mejor cumplimiento',
        severity: 'info'
      });
    }

    if (!data.uso_cfdi) {
      recommendations.push({
        field: 'uso_cfdi',
        message: 'Especificar uso del CFDI mejora el cumplimiento fiscal',
        severity: 'info'
      });
    }

    // Calcular completitud
    const totalFields = 20; // Campos críticos para carta porte
    const completedFields = totalFields - missingFields.length;
    const completeness = Math.round((completedFields / totalFields) * 100);

    return {
      isValid: errors.length === 0,
      completeness,
      errors,
      warnings,
      recommendations,
      missingFields
    };
  };

  const handleValidate = async () => {
    setIsValidating(true);
    try {
      const result = await validateSATCompliance();
      setValidationResult(result);
      onValidationComplete?.(result);
    } catch (error) {
      console.error('Error en validación SAT:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (autoValidate && data) {
      const timer = setTimeout(handleValidate, 500);
      return () => clearTimeout(timer);
    }
  }, [data, autoValidate]);

  const getStatusColor = () => {
    if (!validationResult) return 'text-gray-500';
    if (validationResult.isValid) return 'text-green-600';
    if (validationResult.errors.length > 0) return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusBg = () => {
    if (!validationResult) return 'bg-gray-100';
    if (validationResult.isValid) return 'bg-green-100';
    if (validationResult.errors.length > 0) return 'bg-red-100';
    return 'bg-yellow-100';
  };

  return (
    <Card className={`${getStatusBg()} transition-colors`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Validación SAT Completa</span>
            {validationResult?.isValid && (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Válida
              </Badge>
            )}
          </div>
          {validationResult && (
            <div className="text-right">
              <div className={`text-2xl font-bold ${getStatusColor()}`}>
                {validationResult.completeness}%
              </div>
              <div className="text-xs text-muted-foreground">
                Completitud
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {validationResult && (
          <>
            <Progress value={validationResult.completeness} className="h-3" />
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.errors.length}
                </div>
                <div className="text-xs text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResult.warnings.length}
                </div>
                <div className="text-xs text-muted-foreground">Advertencias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.recommendations.length}
                </div>
                <div className="text-xs text-muted-foreground">Sugerencias</div>
              </div>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handleValidate} 
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              <>
                <FileCheck className="h-4 w-4 mr-2" />
                Validar SAT
              </>
            )}
          </Button>
        </div>

        {validationResult && (
          <Tabs defaultValue="errores" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="errores">
                Errores ({validationResult.errors.length})
              </TabsTrigger>
              <TabsTrigger value="advertencias">
                Advertencias ({validationResult.warnings.length})
              </TabsTrigger>
              <TabsTrigger value="sugerencias">
                Sugerencias ({validationResult.recommendations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errores" className="space-y-2">
              {validationResult.errors.length > 0 ? (
                validationResult.errors.map((error, index) => (
                  <Alert key={index} variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{error.message}</div>
                      {error.satRule && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Fundamento: {error.satRule}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No se encontraron errores</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advertencias" className="space-y-2">
              {validationResult.warnings.length > 0 ? (
                validationResult.warnings.map((warning, index) => (
                  <Alert key={index}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{warning.message}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No hay advertencias</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="sugerencias" className="space-y-2">
              {validationResult.recommendations.length > 0 ? (
                validationResult.recommendations.map((rec, index) => (
                  <Alert key={index} className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      {rec.message}
                    </AlertDescription>
                  </Alert>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Info className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p>No hay sugerencias adicionales</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}
