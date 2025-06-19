
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Zap,
  TrendingUp,
  Shield,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Settings
} from 'lucide-react';
import { SmartValidationResult, ValidationIssue } from '@/services/ai/SmartValidationService';
import { CartaPorteData } from '@/types/cartaPorte';
import { useSmartValidation } from '@/hooks/ai/useSmartValidation';

interface SmartValidationPanelProps {
  data: CartaPorteData;
  onAutoFixApplied?: (field: string, newValue: any) => void;
  compact?: boolean;
}

export function SmartValidationPanel({ 
  data, 
  onAutoFixApplied,
  compact = false 
}: SmartValidationPanelProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const {
    validationResult,
    isValidating,
    hasValidation,
    canTimbrar,
    realTimeAlerts,
    clearAlerts,
    validateData,
    getIssuesBySection,
    getSectionScore,
    isSectionValid,
    applyAutoFix,
    getCompletionProgress
  } = useSmartValidation({
    autoValidate: true,
    validationDelay: 3000,
    enableRealTimeAlerts: true
  });

  const handleValidate = () => {
    validateData(data);
  };

  const getIssueIcon = (issue: ValidationIssue) => {
    switch (issue.severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (compact && !hasValidation) {
    return (
      <Card className="border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">Validación IA</span>
            </div>
            <Button 
              onClick={handleValidate} 
              disabled={isValidating}
              size="sm"
              variant="outline"
            >
              {isValidating ? (
                <RefreshCw className="h-3 w-3 animate-spin" />
              ) : (
                'Validar'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alertas en Tiempo Real */}
      {realTimeAlerts.length > 0 && (
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Problemas Críticos Detectados:</strong>
                <ul className="mt-1 text-sm">
                  {realTimeAlerts.slice(0, 2).map((alert, idx) => (
                    <li key={idx}>• {alert.message}</li>
                  ))}
                  {realTimeAlerts.length > 2 && (
                    <li>• +{realTimeAlerts.length - 2} problemas más...</li>
                  )}
                </ul>
              </div>
              <Button 
                onClick={clearAlerts} 
                variant="outline" 
                size="sm"
                className="ml-4"
              >
                Revisar
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Panel Principal */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="text-purple-800">Validación Inteligente IA</span>
              {hasValidation && (
                <Badge className={getRiskBadgeColor(validationResult!.aiInsights.riskLevel)}>
                  Riesgo: {validationResult!.aiInsights.riskLevel.toUpperCase()}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {hasValidation && (
                <Badge 
                  variant={canTimbrar ? "default" : "destructive"}
                  className="text-xs"
                >
                  {canTimbrar ? '✅ Listo' : '❌ Pendiente'}
                </Badge>
              )}
              
              <Button 
                onClick={handleValidate} 
                disabled={isValidating}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700"
              >
                {isValidating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Validando...
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3 mr-1" />
                    Validar
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {!hasValidation ? (
            <div className="text-center py-6 text-gray-600">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Inicie la validación inteligente para obtener</p>
              <p className="text-sm">análisis avanzado con IA</p>
            </div>
          ) : (
            <>
              {/* Score Principal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Score SAT</span>
                  </div>
                  <div className={`text-2xl font-bold ${getScoreColor(validationResult.overallScore)}`}>
                    {validationResult.overallScore}%
                  </div>
                  <Progress 
                    value={validationResult.overallScore} 
                    className="mt-2 h-2"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Probabilidad Timbrado</span>
                  </div>
                  <div className="text-2xl font-bold text-green-700">
                    {validationResult.aiInsights.timbradoProbability}%
                  </div>
                  <Progress 
                    value={validationResult.aiInsights.timbradoProbability} 
                    className="mt-2 h-2"
                  />
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Completitud</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-700">
                    {getCompletionProgress()}%
                  </div>
                  <Progress 
                    value={getCompletionProgress()} 
                    className="mt-2 h-2"
                  />
                </div>
              </div>

              {/* Issues Críticos */}
              {validationResult.issues.filter(i => i.severity === 'critical').length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">
                      Problemas Críticos ({validationResult.issues.filter(i => i.severity === 'critical').length}):
                    </div>
                    <ul className="list-disc list-inside space-y-1">
                      {validationResult.issues
                        .filter(i => i.severity === 'critical')
                        .slice(0, 3)
                        .map((issue, idx) => (
                          <li key={idx} className="text-sm flex items-center justify-between">
                            <span>{issue.message}</span>
                            {issue.autoFix && (
                              <Button
                                onClick={() => applyAutoFix(issue.id)}
                                size="sm"
                                variant="outline"
                                className="ml-2 h-6 text-xs"
                              >
                                Auto-Fix
                              </Button>
                            )}
                          </li>
                        ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Recomendaciones IA */}
              {validationResult.recommendations.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Recomendaciones IA</span>
                  </div>
                  <ul className="space-y-1">
                    {validationResult.recommendations.slice(0, 3).map((rec, idx) => (
                      <li key={idx} className="text-sm text-blue-700">• {rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detalles Expandibles */}
              <Collapsible open={showDetails} onOpenChange={setShowDetails}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <span>Ver Detalles Completos</span>
                    {showDetails ? 
                      <ChevronUp className="h-4 w-4 ml-2" /> : 
                      <ChevronDown className="h-4 w-4 ml-2" />
                    }
                  </Button>
                </CollapsibleTrigger>
                
                <CollapsibleContent className="space-y-4 mt-4">
                  <Separator />
                  
                  {/* Status por Sección */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(validationResult.sectionsStatus).map(([section, status]) => (
                      <div key={section} className="bg-white p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium capitalize">{section}</span>
                          {status.valid ? 
                            <CheckCircle2 className="h-4 w-4 text-green-600" /> :
                            <XCircle className="h-4 w-4 text-red-600" />
                          }
                        </div>
                        <div className={`text-lg font-bold ${getScoreColor(status.score)}`}>
                          {status.score}%
                        </div>
                        <div className="text-xs text-gray-600">
                          {status.issues.length} problema(s)
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Todos los Issues */}
                  {validationResult.issues.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Todos los Problemas:</h4>
                      {validationResult.issues.map((issue, idx) => (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                          {getIssueIcon(issue)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{issue.message}</span>
                              <Badge variant="outline" className="text-xs">
                                {issue.section}
                              </Badge>
                            </div>
                            {issue.suggestion && (
                              <p className="text-sm text-gray-600 mt-1">
                                💡 {issue.suggestion}
                              </p>
                            )}
                            {issue.satRule && (
                              <p className="text-xs text-blue-600 mt-1">
                                📋 {issue.satRule}
                              </p>
                            )}
                          </div>
                          {issue.autoFix && (
                            <Button
                              onClick={() => applyAutoFix(issue.id)}
                              size="sm"
                              variant="outline"
                            >
                              <Zap className="h-3 w-3 mr-1" />
                              Fix
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CollapsibleContent>
              </Collapsible>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
