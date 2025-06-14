
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  AlertTriangle, 
  CheckCircle, 
  Lightbulb, 
  Zap,
  TrendingUp,
  X 
} from 'lucide-react';
import { AIValidationEnhanced } from '@/hooks/ai/useAIValidationEnhanced';
import { cn } from '@/lib/utils';

interface AIValidationAlertsProps {
  validation: AIValidationEnhanced;
  onDismiss?: () => void;
  onApplyFix?: (fix: any) => void;
  className?: string;
}

export function AIValidationAlerts({
  validation,
  onDismiss,
  onApplyFix,
  className
}: AIValidationAlertsProps) {
  if (!validation.aiEnhancements) {
    return null;
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'suggestion': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'optimization': return <TrendingUp className="h-4 w-4 text-green-500" />;
      default: return <Brain className="h-4 w-4 text-purple-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <Card className={cn('border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Validación Inteligente</span>
            <Badge className={cn('ml-2', getScoreColor(validation.validationScore))}>
              {validation.validationScore}/100
            </Badge>
          </CardTitle>
          
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score Visual */}
        <div className="flex items-center gap-4 p-3 bg-white rounded-lg border">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Estado de Validación:</span>
          </div>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-blue-500"
              style={{ width: `${validation.validationScore}%` }}
            />
          </div>
          <span className="text-sm font-medium">
            {validation.isValid ? '✅ Válido' : '⚠️ Revisar'}
          </span>
        </div>

        {/* Sugerencias IA */}
        {validation.aiSuggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-purple-800 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Sugerencias de IA ({validation.aiSuggestions.length})
            </h4>
            {validation.aiSuggestions.slice(0, 3).map((suggestion, index) => (
              <Alert key={index} className={cn(
                'border-l-4',
                suggestion.type === 'error' ? 'border-l-red-500 bg-red-50' :
                suggestion.type === 'warning' ? 'border-l-amber-500 bg-amber-50' :
                suggestion.type === 'optimization' ? 'border-l-green-500 bg-green-50' :
                'border-l-blue-500 bg-blue-50'
              )}>
                <div className="flex items-start gap-3">
                  {getTypeIcon(suggestion.type)}
                  <div className="flex-1">
                    <AlertDescription>
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-sm">{suggestion.title}</strong>
                          <p className="text-sm mt-1">{suggestion.message}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                          {suggestion.autoFix && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                suggestion.autoFix?.();
                                onApplyFix?.(suggestion);
                              }}
                              className="text-xs h-6"
                            >
                              Aplicar
                            </Button>
                          )}
                        </div>
                      </div>
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
            
            {validation.aiSuggestions.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{validation.aiSuggestions.length - 3} sugerencias más...
              </p>
            )}
          </div>
        )}

        {/* Alertas Predictivas */}
        {validation.predictiveAlerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-blue-800 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Predicciones ({validation.predictiveAlerts.length})
            </h4>
            {validation.predictiveAlerts.slice(0, 2).map((alert, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium text-blue-800">
                      {alert.field.toUpperCase()}
                    </span>
                    <p className="text-sm text-blue-700 mt-1">{alert.prediction}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(alert.confidence * 100)}%
                    </Badge>
                    {alert.action && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={alert.action}
                        className="text-xs h-6"
                      >
                        Ver
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Estado General */}
        {validation.isValid && validation.aiSuggestions.length === 0 && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">
              ¡Excelente! Tu Carta Porte está optimizada con IA
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
