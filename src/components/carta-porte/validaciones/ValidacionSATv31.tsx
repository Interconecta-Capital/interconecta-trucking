import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  FileCheck,
  Lightbulb,
  Shield,
  Star
} from 'lucide-react';
import { CartaPorteData, ValidacionSATv31 } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';

interface ValidacionSATv31Props {
  cartaPorteData: CartaPorteData;
  onValidationComplete?: (result: ValidacionSATv31) => void;
  autoValidate?: boolean;
}

export const ValidacionSATv31Component: React.FC<ValidacionSATv31Props> = ({
  cartaPorteData,
  onValidationComplete,
  autoValidate = true
}) => {
  const [validationResult, setValidationResult] = useState<ValidacionSATv31 | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const validateCartaPorte = async () => {
    setIsValidating(true);
    try {
      // Llamar a la función de validación en la base de datos
      const { data, error } = await supabase.rpc('validate_carta_porte_v31_compliance', {
        carta_porte_data: cartaPorteData as any
      });

      if (error) {
        console.error('Error validating carta porte:', error);
        throw error;
      }

      // Realizar validaciones adicionales del frontend
      const frontendValidations = await performFrontendValidations(cartaPorteData);
      
      // Type-safe handling of database response
      const dbResult = data as unknown as {
        valido: boolean;
        errores: string[];
        warnings: string[];
        score: number;
      };
      
      // Combinar resultados
      const combinedResult: ValidacionSATv31 = {
        esValido: dbResult.valido && frontendValidations.esValido,
        errores: [...(dbResult.errores || []), ...frontendValidations.errores],
        advertencias: [...(dbResult.warnings || []), ...frontendValidations.advertencias],
        scoreComplitud: Math.min(dbResult.score || 0, frontendValidations.scoreComplitud),
        warnings: [...(dbResult.warnings || []), ...frontendValidations.advertencias],
        score: Math.min(dbResult.score || 0, frontendValidations.scoreComplitud),
        campos_faltantes: frontendValidations.campos_faltantes,
        recomendaciones: frontendValidations.recomendaciones,
        valido: dbResult.valido && frontendValidations.esValido
      };

      setValidationResult(combinedResult);
      setLastValidation(new Date());
      onValidationComplete?.(combinedResult);
    } catch (error) {
      console.error('Error en validación SAT v3.1:', error);
      const errorResult: ValidacionSATv31 = {
        esValido: false,
        errores: ['Error interno de validación'],
        advertencias: [],
        scoreComplitud: 0,
        warnings: [],
        score: 0,
        campos_faltantes: [],
        recomendaciones: [],
        valido: false
      };
      setValidationResult(errorResult);
    } finally {
      setIsValidating(false);
    }
  };

  const performFrontendValidations = async (data: CartaPorteData): Promise<ValidacionSATv31> => {
    const errores: string[] = [];
    const advertencias: string[] = [];
    const campos_faltantes: string[] = [];
    const recomendaciones: string[] = [];

    // Validaciones específicas v3.1
    
    // 1. Validar versión obligatoria
    if (!data.cartaPorteVersion || data.cartaPorteVersion !== '3.1') {
      errores.push('Versión de Carta Porte debe ser 3.1');
    }

    // 2. Validar IdCCP formato v3.1 (36 caracteres)
    if (!data.idCCP || data.idCCP.length !== 36) {
      errores.push('IdCCP debe tener exactamente 36 caracteres (formato RFC 4122)');
    }

    // 3. Validar campos fiscales obligatorios
    if (!data.uso_cfdi) {
      campos_faltantes.push('uso_cfdi');
      errores.push('Uso de CFDI es obligatorio para el receptor');
    }

    if (!data.regimen_fiscal_emisor) {
      campos_faltantes.push('regimen_fiscal_emisor');
      errores.push('Régimen fiscal del emisor es obligatorio');
    }

    if (!data.domicilio_fiscal_emisor || Object.keys(data.domicilio_fiscal_emisor).length === 0) {
      campos_faltantes.push('domicilio_fiscal_emisor');
      errores.push('Domicilio fiscal completo del emisor es obligatorio');
    }

    // 4. Validar ubicaciones formato v3.1
    if (data.ubicaciones && data.ubicaciones.length > 0) {
      data.ubicaciones.forEach((ubicacion, idx) => {
        if (ubicacion.tipo_ubicacion === 'Origen' && !ubicacion.id_ubicacion?.match(/^OR\d{6}$/)) {
          errores.push(`Ubicación origen #${idx + 1}: ID debe tener formato OR000001`);
        }
        if (ubicacion.tipo_ubicacion === 'Destino' && !ubicacion.id_ubicacion?.match(/^DE\d{6}$/)) {
          errores.push(`Ubicación destino #${idx + 1}: ID debe tener formato DE000001`);
        }
        if (ubicacion.tipo_ubicacion === 'Destino' && (!ubicacion.distancia_recorrida || ubicacion.distancia_recorrida <= 0)) {
          errores.push(`Ubicación destino #${idx + 1}: Distancia recorrida es obligatoria`);
        }
        if (!ubicacion.fecha_hora_salida_llegada) {
          errores.push(`Ubicación #${idx + 1}: Fecha y hora de salida/llegada es obligatoria`);
        }
      });
    }

    // 5. Validar mercancías v3.1
    if (data.mercancias && data.mercancias.length > 0) {
      let pesoTotalCalculado = 0;
      
      data.mercancias.forEach((mercancia, idx) => {
        // Peso bruto total obligatorio
        if (!mercancia.peso_bruto_total || mercancia.peso_bruto_total <= 0) {
          errores.push(`Mercancía #${idx + 1}: Peso bruto total es obligatorio en v3.1`);
        } else {
          pesoTotalCalculado += mercancia.peso_bruto_total;
        }

        // Validaciones fauna silvestre
        if (mercancia.especie_protegida) {
          if (!mercancia.descripcion_detallada || mercancia.descripcion_detallada.length < 50) {
            errores.push(`Mercancía #${idx + 1}: Especies protegidas requieren descripción detallada (mín. 50 chars)`);
          }
          
          if (!mercancia.permisos_semarnat || mercancia.permisos_semarnat.length === 0) {
            errores.push(`Mercancía #${idx + 1}: Especies protegidas requieren permisos SEMARNAT`);
          } else {
            // Validar vigencia de permisos
            const now = new Date();
            const permisosVencidos = mercancia.permisos_semarnat.filter(p => 
              new Date(p.fecha_vencimiento) < now
            );
            if (permisosVencidos.length > 0) {
              errores.push(`Mercancía #${idx + 1}: Tiene ${permisosVencidos.length} permiso(s) SEMARNAT vencido(s)`);
            }
          }
        }
      });

      // Validar peso total vs capacidad vehicular
      if (data.autotransporte?.peso_bruto_vehicular && pesoTotalCalculado > data.autotransporte.peso_bruto_vehicular) {
        advertencias.push(`Peso total mercancías (${pesoTotalCalculado.toFixed(2)} kg) excede capacidad vehículo (${data.autotransporte.peso_bruto_vehicular} kg)`);
      }
    }

    // 6. Validar autotransporte v3.1
    if (data.autotransporte) {
      if (!data.autotransporte.peso_bruto_vehicular || data.autotransporte.peso_bruto_vehicular <= 0) {
        errores.push('Peso bruto vehicular es obligatorio en v3.1');
      }

      if (!data.autotransporte.vigencia_resp_civil) {
        advertencias.push('Se recomienda especificar vigencia del seguro de responsabilidad civil');
      }

      if (!data.autotransporte.numero_serie_vin) {
        recomendaciones.push('Agregar número de serie VIN para mejor identificación del vehículo');
      }
    }

    // 7. Validar figuras de transporte v3.1
    if (data.figuras && data.figuras.length > 0) {
      data.figuras.forEach((figura, idx) => {
        if (figura.tipo_figura === '01') { // Operador
          if (!figura.operador_sct) {
            advertencias.push(`Figura #${idx + 1}: Especificar si es operador SCT`);
          }
          
          if (!figura.tipo_licencia) {
            errores.push(`Figura #${idx + 1}: Tipo de licencia es obligatorio para operadores`);
          }
          
          if (!figura.vigencia_licencia) {
            errores.push(`Figura #${idx + 1}: Vigencia de licencia es obligatoria`);
          }
          
          if (!figura.curp) {
            errores.push(`Figura #${idx + 1}: CURP es obligatorio para personas físicas`);
          }
        }
      });
    }

    // 8. Validaciones regímenes aduaneros v3.1
    if (data.regimenesAduaneros && data.regimenesAduaneros.length > 10) {
      errores.push('Máximo 10 regímenes aduaneros permitidos en v3.1');
    }

    // Calcular score
    const totalChecks = 20; // Total de validaciones críticas
    const errorWeight = 10; // Errores tienen mayor peso
    const warningWeight = 2;
    
    const penalizacion = (errores.length * errorWeight) + (advertencias.length * warningWeight);
    const score = Math.max(0, Math.round(((totalChecks * 10) - penalizacion) / totalChecks * 10));

    return {
      esValido: errores.length === 0,
      errores,
      advertencias,
      scoreComplitud: score,
      warnings: advertencias,
      score,
      campos_faltantes,
      recomendaciones,
      valido: errores.length === 0
    };
  };

  useEffect(() => {
    if (autoValidate && cartaPorteData) {
      const timer = setTimeout(validateCartaPorte, 500);
      return () => clearTimeout(timer);
    }
  }, [cartaPorteData, autoValidate]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  if (!validationResult) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Validación SAT v3.1</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Button onClick={validateCartaPorte} disabled={isValidating}>
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Iniciar Validación v3.1
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de Validación */}
      <Card className={getScoreBgColor(validationResult.scoreComplitud)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Validación SAT Carta Porte v3.1</span>
              {validationResult.esValido && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Cumple SAT v3.1
                </Badge>
              )}
              {!validationResult.esValido && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  No Cumple
                </Badge>
              )}
            </CardTitle>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(validationResult.scoreComplitud)}`}>
                {validationResult.scoreComplitud}%
              </div>
              <div className="text-xs text-muted-foreground">
                Cumplimiento SAT
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={validationResult.scoreComplitud} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {validationResult.errores.length}
                </div>
                <div className="text-xs text-muted-foreground">Errores</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {validationResult.advertencias.length}
                </div>
                <div className="text-xs text-muted-foreground">Advertencias</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {validationResult.recomendaciones?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Recomendaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {validationResult.campos_faltantes?.length || 0}
                </div>
                <div className="text-xs text-muted-foreground">Campos Faltantes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {cartaPorteData.cartaPorteVersion === '3.1' ? '✓' : '✗'}
                </div>
                <div className="text-xs text-muted-foreground">Versión 3.1</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {lastValidation && `Última validación: ${lastValidation.toLocaleTimeString()}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={validateCartaPorte}
                disabled={isValidating}
              >
                {isValidating ? (
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Revalidar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detalles de Validación */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="errores" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="errores" className="flex items-center space-x-1">
                <XCircle className="h-3 w-3" />
                <span>Errores ({validationResult.errores.length})</span>
              </TabsTrigger>
              <TabsTrigger value="advertencias" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Advertencias ({validationResult.advertencias.length})</span>
              </TabsTrigger>
              <TabsTrigger value="recomendaciones" className="flex items-center space-x-1">
                <Lightbulb className="h-3 w-3" />
                <span>Recomendaciones ({validationResult.recomendaciones?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="campos" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>Campos Faltantes ({validationResult.campos_faltantes?.length || 0})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errores" className="p-4">
              {validationResult.errores.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.errores.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No se encontraron errores críticos</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advertencias" className="p-4">
              {validationResult.advertencias.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.advertencias.map((warning, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{warning}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No hay advertencias</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="recomendaciones" className="p-4">
              {validationResult.recomendaciones && validationResult.recomendaciones.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.recomendaciones.map((recomendacion, index) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {recomendacion}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p>No hay recomendaciones adicionales</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="campos" className="p-4">
              {validationResult.campos_faltantes && validationResult.campos_faltantes.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.campos_faltantes.map((campo, index) => (
                    <Alert key={index} className="border-purple-200 bg-purple-50">
                      <Star className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        Campo faltante: <code className="bg-purple-200 px-1 rounded">{campo}</code>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Todos los campos obligatorios están presentes</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ValidacionSATv31Component;
