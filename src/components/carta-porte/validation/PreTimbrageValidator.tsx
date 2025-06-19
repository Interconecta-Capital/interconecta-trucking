
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  FileText,
  Clock,
  Zap
} from 'lucide-react';
import { CartaPorteData } from '@/types/cartaPorte';

interface PreTimbrageCheck {
  id: string;
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  message: string;
  critical: boolean;
}

interface PreTimbrageValidatorProps {
  data: CartaPorteData;
  onValidationComplete?: (canTimbrar: boolean, checks: PreTimbrageCheck[]) => void;
}

export function PreTimbrageValidator({ data, onValidationComplete }: PreTimbrageValidatorProps) {
  const [checks, setChecks] = useState<PreTimbrageCheck[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [validationComplete, setValidationComplete] = useState(false);

  const performPreTimbrageValidation = async (): Promise<PreTimbrageCheck[]> => {
    const validationChecks: PreTimbrageCheck[] = [
      {
        id: 'rfc_validation',
        name: 'Validación de RFCs',
        description: 'Verificar que los RFCs del emisor y receptor sean válidos',
        status: 'pending',
        message: '',
        critical: true
      },
      {
        id: 'ubicaciones_validation',
        name: 'Ubicaciones Completas',
        description: 'Verificar que origen y destino estén correctamente especificados',
        status: 'pending',
        message: '',
        critical: true
      },
      {
        id: 'mercancias_validation',
        name: 'Mercancías Válidas',
        description: 'Verificar que todas las mercancías tengan información completa',
        status: 'pending',
        message: '',
        critical: true
      },
      {
        id: 'autotransporte_validation',
        name: 'Autotransporte Completo',
        description: 'Verificar información completa del vehículo y seguros',
        status: 'pending',
        message: '',
        critical: true
      },
      {
        id: 'figuras_validation',
        name: 'Figuras de Transporte',
        description: 'Verificar que al menos haya un operador especificado',
        status: 'pending',
        message: '',
        critical: true
      },
      {
        id: 'peso_coherence',
        name: 'Coherencia de Pesos',
        description: 'Verificar que el peso total no exceda la capacidad del vehículo',
        status: 'pending',
        message: '',
        critical: false
      },
      {
        id: 'material_peligroso',
        name: 'Material Peligroso',
        description: 'Verificar documentación adicional para material peligroso',
        status: 'pending',
        message: '',
        critical: false
      },
      {
        id: 'distancias_calculation',
        name: 'Cálculo de Distancias',
        description: 'Verificar que las distancias estén calculadas correctamente',
        status: 'pending',
        message: '',
        critical: false
      }
    ];

    // Simular validaciones asíncronas
    for (let i = 0; i < validationChecks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const check = validationChecks[i];
      
      switch (check.id) {
        case 'rfc_validation':
          if (!data.rfcEmisor || !data.rfcReceptor) {
            check.status = 'failed';
            check.message = 'RFC del emisor o receptor faltante';
          } else if (data.rfcEmisor.length < 12 || data.rfcReceptor.length < 12) {
            check.status = 'failed';
            check.message = 'Formato de RFC inválido';
          } else {
            check.status = 'passed';
            check.message = 'RFCs válidos';
          }
          break;
          
        case 'ubicaciones_validation':
          if (!data.ubicaciones || data.ubicaciones.length < 2) {
            check.status = 'failed';
            check.message = 'Se requieren al menos 2 ubicaciones';
          } else {
            const hasOrigin = data.ubicaciones.some(u => u.tipo_ubicacion === 'Origen');
            const hasDestination = data.ubicaciones.some(u => u.tipo_ubicacion === 'Destino');
            
            if (!hasOrigin || !hasDestination) {
              check.status = 'failed';
              check.message = 'Falta ubicación de origen o destino';
            } else {
              check.status = 'passed';
              check.message = 'Ubicaciones completas';
            }
          }
          break;
          
        case 'mercancias_validation':
          if (!data.mercancias || data.mercancias.length === 0) {
            check.status = 'failed';
            check.message = 'No hay mercancías especificadas';
          } else {
            const invalidMercancias = data.mercancias.filter(m => 
              !m.bienes_transp || !m.descripcion || !m.cantidad || !m.peso_kg
            );
            
            if (invalidMercancias.length > 0) {
              check.status = 'failed';
              check.message = `${invalidMercancias.length} mercancías con información incompleta`;
            } else {
              check.status = 'passed';
              check.message = 'Todas las mercancías válidas';
            }
          }
          break;
          
        case 'autotransporte_validation':
          if (!data.autotransporte) {
            check.status = 'failed';
            check.message = 'Información de autotransporte faltante';
          } else if (!data.autotransporte.placa_vm || !data.autotransporte.asegura_resp_civil) {
            check.status = 'failed';
            check.message = 'Información crítica del vehículo faltante';
          } else {
            check.status = 'passed';
            check.message = 'Autotransporte completo';
          }
          break;
          
        case 'figuras_validation':
          if (!data.figuras || data.figuras.length === 0) {
            check.status = 'failed';
            check.message = 'No hay figuras de transporte especificadas';
          } else {
            check.status = 'passed';
            check.message = 'Figuras de transporte válidas';
          }
          break;
          
        case 'peso_coherence':
          if (data.mercancias && data.autotransporte) {
            const pesoTotal = data.mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
            const capacidad = data.autotransporte.capacidad_carga || 0;
            
            if (capacidad > 0 && pesoTotal > capacidad) {
              check.status = 'warning';
              check.message = 'Peso excede capacidad del vehículo';
            } else {
              check.status = 'passed';
              check.message = 'Pesos coherentes';
            }
          } else {
            check.status = 'warning';
            check.message = 'No se puede validar coherencia de pesos';
          }
          break;
          
        case 'material_peligroso':
          const hasMaterialPeligroso = data.mercancias?.some(m => m.material_peligroso);
          if (hasMaterialPeligroso) {
            const materialesConClave = data.mercancias?.filter(m => 
              m.material_peligroso && m.cve_material_peligroso
            );
            
            if (!materialesConClave || materialesConClave.length === 0) {
              check.status = 'warning';
              check.message = 'Material peligroso sin clave especificada';
            } else {
              check.status = 'passed';
              check.message = 'Material peligroso correctamente documentado';
            }
          } else {
            check.status = 'passed';
            check.message = 'No hay material peligroso';
          }
          break;
          
        case 'distancias_calculation':
          if (data.ubicaciones && data.ubicaciones.length >= 2) {
            const hasDistances = data.ubicaciones.some(u => u.distancia_recorrida && u.distancia_recorrida > 0);
            if (!hasDistances) {
              check.status = 'warning';
              check.message = 'Distancias no calculadas';
            } else {
              check.status = 'passed';
              check.message = 'Distancias calculadas';
            }
          } else {
            check.status = 'warning';
            check.message = 'Insuficientes ubicaciones para calcular distancias';
          }
          break;
      }
      
      // Actualizar estado para mostrar progreso
      setChecks([...validationChecks.slice(0, i + 1)]);
    }
    
    return validationChecks;
  };

  const handleValidate = async () => {
    setIsValidating(true);
    setValidationComplete(false);
    setChecks([]);
    
    try {
      const results = await performPreTimbrageValidation();
      setChecks(results);
      setValidationComplete(true);
      
      const criticalFailures = results.filter(r => r.critical && r.status === 'failed');
      const canTimbrar = criticalFailures.length === 0;
      
      onValidationComplete?.(canTimbrar, results);
    } catch (error) {
      console.error('Error en validación de pre-timbrado:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-400';
    }
  };

  const criticalFailures = checks.filter(c => c.critical && c.status === 'failed').length;
  const canTimbrar = validationComplete && criticalFailures === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ShieldCheck className="h-5 w-5" />
          <span>Validación Pre-Timbrado</span>
          {validationComplete && (
            <Badge variant={canTimbrar ? "default" : "destructive"}>
              {canTimbrar ? "Listo para Timbrar" : "Requiere Correcciones"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={handleValidate} 
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <>
                <Zap className="h-4 w-4 mr-2 animate-pulse" />
                Validando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Iniciar Validación
              </>
            )}
          </Button>
        </div>

        {checks.length > 0 && (
          <div className="space-y-3">
            <Separator />
            
            {checks.map((check, index) => (
              <div key={check.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                <div className="flex-shrink-0 mt-0.5">
                  {getStatusIcon(check.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-sm">{check.name}</h4>
                    {check.critical && (
                      <Badge variant="outline" className="text-xs">
                        Crítico
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{check.description}</p>
                  <p className={`text-xs mt-1 font-medium ${getStatusColor(check.status)}`}>
                    {check.message}
                  </p>
                </div>
              </div>
            ))}
            
            {validationComplete && (
              <Alert className={canTimbrar ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {canTimbrar ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={canTimbrar ? "text-green-800" : "text-red-800"}>
                  {canTimbrar ? (
                    "✅ La Carta Porte está lista para ser timbrada. Todas las validaciones críticas han pasado."
                  ) : (
                    `❌ Se encontraron ${criticalFailures} errores críticos que deben corregirse antes del timbrado.`
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
