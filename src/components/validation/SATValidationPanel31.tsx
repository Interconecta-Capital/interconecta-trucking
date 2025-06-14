
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
  Info,
  RefreshCw,
  FileCheck,
  Lightbulb,
  Shield,
  Star,
  Zap
} from 'lucide-react';
import { SATValidation31Enhanced, ValidationSAT31Result, CartaPorte31Data } from '@/services/validation/SATValidation31Enhanced';

interface SATValidationPanel31Props {
  cartaPorteData: CartaPorte31Data;
  onValidationComplete?: (result: ValidationSAT31Result) => void;
  autoValidate?: boolean;
}

export const SATValidationPanel31: React.FC<SATValidationPanel31Props> = ({
  cartaPorteData,
  onValidationComplete,
  autoValidate = true
}) => {
  const [validationResult, setValidationResult] = useState<ValidationSAT31Result | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [lastValidation, setLastValidation] = useState<Date | null>(null);

  const validateData = async () => {
    setIsValidating(true);
    try {
      const result = await SATValidation31Enhanced.validateCompleteCartaPorte31(cartaPorteData);
      setValidationResult(result);
      setLastValidation(new Date());
      onValidationComplete?.(result);
    } catch (error) {
      console.error('Error en validación SAT 3.1:', error);
      setValidationResult({
        isValid: false,
        message: 'Error en validación',
        errors: ['Error interno de validación'],
        warnings: [],
        recommendations: [],
        complianceScore: 0,
        criticalIssues: [],
        version31Specific: []
      });
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (autoValidate && cartaPorteData) {
      const timer = setTimeout(validateData, 500);
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
            <span>Validación SAT 3.1</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Button onClick={validateData} disabled={isValidating}>
              {isValidating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Iniciar Validación
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
      <Card className={getScoreBgColor(validationResult.complianceScore)}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Validación SAT Carta Porte 3.1</span>
              {validationResult.isValid && (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Válida
                </Badge>
              )}
            </CardTitle>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScoreColor(validationResult.complianceScore)}`}>
                {validationResult.complianceScore}%
              </div>
              <div className="text-xs text-muted-foreground">
                Cumplimiento SAT
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={validationResult.complianceScore} className="h-3" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                <div className="text-xs text-muted-foreground">Recomendaciones</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {validationResult.version31Specific.length}
                </div>
                <div className="text-xs text-muted-foreground">SAT 3.1</div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                {lastValidation && `Última validación: ${lastValidation.toLocaleTimeString()}`}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={validateData}
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
                <span>Errores ({validationResult.errors.length})</span>
              </TabsTrigger>
              <TabsTrigger value="advertencias" className="flex items-center space-x-1">
                <AlertTriangle className="h-3 w-3" />
                <span>Advertencias ({validationResult.warnings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="recomendaciones" className="flex items-center space-x-1">
                <Lightbulb className="h-3 w-3" />
                <span>Recomendaciones ({validationResult.recommendations.length})</span>
              </TabsTrigger>
              <TabsTrigger value="sat31" className="flex items-center space-x-1">
                <Star className="h-3 w-3" />
                <span>SAT 3.1 ({validationResult.version31Specific.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="errores" className="p-4">
              {validationResult.errors.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>No se encontraron errores</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="advertencias" className="p-4">
              {validationResult.warnings.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.warnings.map((warning, index) => (
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
              {validationResult.recommendations.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.recommendations.map((recommendation, index) => (
                    <Alert key={index} className="border-blue-200 bg-blue-50">
                      <Lightbulb className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        {recommendation}
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

            <TabsContent value="sat31" className="p-4">
              {validationResult.version31Specific.length > 0 ? (
                <div className="space-y-2">
                  {validationResult.version31Specific.map((item, index) => (
                    <Alert key={index} className="border-purple-200 bg-purple-50">
                      <Star className="h-4 w-4 text-purple-600" />
                      <AlertDescription className="text-purple-800">
                        {item}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p>Utilice funcionalidades específicas de SAT 3.1 para mejorar el cumplimiento</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
