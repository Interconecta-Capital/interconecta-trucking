
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { useCartaPorteValidation } from '@/hooks/useCartaPorteValidation';

interface ValidationPanelProps {
  cartaPorteData: any;
  onValidationComplete?: (isValid: boolean) => void;
}

export function ValidationPanel({ cartaPorteData, onValidationComplete }: ValidationPanelProps) {
  const { 
    validationResults, 
    isValidating, 
    validateCartaPorte, 
    clearValidation 
  } = useCartaPorteValidation();

  const handleValidate = async () => {
    const result = await validateCartaPorte(cartaPorteData);
    onValidationComplete?.(result.isValid);
  };

  const getStatusIcon = () => {
    if (!validationResults) return <RefreshCw className="h-5 w-5" />;
    if (validationResults.isValid) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <XCircle className="h-5 w-5 text-red-600" />;
  };

  const getStatusBadge = () => {
    if (!validationResults) return <Badge variant="secondary">Sin validar</Badge>;
    if (validationResults.isValid) return <Badge variant="default" className="bg-green-600">Válido</Badge>;
    return <Badge variant="destructive">Inválido</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Validación SAT
          </div>
          {getStatusBadge()}
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
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              'Validar Carta Porte'
            )}
          </Button>
          
          {validationResults && (
            <Button variant="outline" onClick={clearValidation}>
              Limpiar
            </Button>
          )}
        </div>

        {validationResults && (
          <div className="space-y-3">
            {validationResults.errors.length > 0 && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Errores encontrados:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.errors.map((error, index) => (
                      <li key={index} className="text-sm">{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResults.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-medium mb-2">Advertencias:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResults.warnings.map((warning, index) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {validationResults.isValid && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  La Carta Porte cumple con todas las validaciones requeridas por el SAT.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
