
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Info, 
  Lightbulb,
  Star,
  ExternalLink
} from 'lucide-react';
import { ValidationSAT31Result } from '@/services/validation/SATValidation31Enhanced';

interface ValidationAlert31Props {
  validation: ValidationSAT31Result;
  compact?: boolean;
  showActions?: boolean;
  onFixIssue?: (issueType: string, issueText: string) => void;
}

export const ValidationAlert31: React.FC<ValidationAlert31Props> = ({
  validation,
  compact = false,
  showActions = true,
  onFixIssue
}) => {
  const getAlertVariant = () => {
    if (validation.criticalIssues.length > 0) return 'destructive';
    if (validation.errors.length > 0) return 'destructive';
    if (validation.warnings.length > 0) return 'default';
    return 'default';
  };

  const getMainIcon = () => {
    if (validation.criticalIssues.length > 0) return <XCircle className="h-4 w-4" />;
    if (validation.errors.length > 0) return <XCircle className="h-4 w-4" />;
    if (validation.warnings.length > 0) return <AlertTriangle className="h-4 w-4" />;
    return <CheckCircle2 className="h-4 w-4" />;
  };

  const getScoreDisplay = () => {
    const score = validation.complianceScore;
    const color = score >= 90 ? 'bg-green-100 text-green-800' : 
                  score >= 70 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800';
    
    return (
      <Badge className={color}>
        {score}% SAT
      </Badge>
    );
  };

  if (compact) {
    return (
      <Alert variant={getAlertVariant()} className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getMainIcon()}
            <span className="text-sm">
              {validation.isValid ? 'Validación exitosa' : 
               `${validation.errors.length + validation.criticalIssues.length} errores, ${validation.warnings.length} advertencias`}
            </span>
          </div>
          {getScoreDisplay()}
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resumen Principal */}
      <Alert variant={getAlertVariant()}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {getMainIcon()}
            <div>
              <AlertDescription className="font-medium">
                {validation.isValid ? 
                  'Carta Porte válida según SAT 3.1' : 
                  'Se encontraron problemas en la validación SAT 3.1'
                }
              </AlertDescription>
              {!validation.isValid && (
                <div className="mt-2 text-sm space-y-1">
                  {validation.criticalIssues.length > 0 && (
                    <div className="text-red-600">
                      • {validation.criticalIssues.length} problema(s) crítico(s)
                    </div>
                  )}
                  {validation.errors.length > 0 && (
                    <div className="text-red-600">
                      • {validation.errors.length} error(es)
                    </div>
                  )}
                  {validation.warnings.length > 0 && (
                    <div className="text-yellow-600">
                      • {validation.warnings.length} advertencia(s)
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getScoreDisplay()}
            {validation.version31Specific.length > 0 && (
              <Badge variant="outline" className="text-purple-600">
                <Star className="h-3 w-3 mr-1" />
                3.1 Enhanced
              </Badge>
            )}
          </div>
        </div>
      </Alert>

      {/* Errores Críticos */}
      {validation.criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-medium mb-2">Problemas Críticos:</div>
            <ul className="list-disc list-inside space-y-1">
              {validation.criticalIssues.map((issue, index) => (
                <li key={index} className="text-sm">
                  {issue}
                  {showActions && onFixIssue && (
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 ml-2 text-red-600"
                      onClick={() => onFixIssue('critical', issue)}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Mejoras Específicas SAT 3.1 */}
      {validation.version31Specific.length > 0 && (
        <Alert className="border-purple-200 bg-purple-50">
          <Star className="h-4 w-4 text-purple-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-purple-800">Funcionalidades SAT 3.1:</div>
            <ul className="list-disc list-inside space-y-1">
              {validation.version31Specific.slice(0, 3).map((item, index) => (
                <li key={index} className="text-sm text-purple-700">
                  {item}
                </li>
              ))}
              {validation.version31Specific.length > 3 && (
                <li className="text-sm text-purple-600">
                  +{validation.version31Specific.length - 3} más...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Recomendaciones Principales */}
      {validation.recommendations.length > 0 && (
        <Alert className="border-blue-200 bg-blue-50">
          <Lightbulb className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <div className="font-medium mb-2 text-blue-800">Recomendaciones:</div>
            <ul className="list-disc list-inside space-y-1">
              {validation.recommendations.slice(0, 2).map((recommendation, index) => (
                <li key={index} className="text-sm text-blue-700">
                  {recommendation}
                </li>
              ))}
              {validation.recommendations.length > 2 && (
                <li className="text-sm text-blue-600">
                  +{validation.recommendations.length - 2} recomendaciones más...
                </li>
              )}
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
