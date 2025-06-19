
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Brain,
  Clock,
  Zap
} from 'lucide-react';
import { SmartValidationResult } from '@/services/ai/SmartValidationService';

interface RealTimeValidationIndicatorProps {
  validationResult: SmartValidationResult | null;
  isValidating: boolean;
  sectionName?: string;
  compact?: boolean;
}

export function RealTimeValidationIndicator({ 
  validationResult, 
  isValidating, 
  sectionName,
  compact = false 
}: RealTimeValidationIndicatorProps) {
  if (isValidating) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="animate-pulse border-blue-300">
              <Clock className="h-3 w-3 mr-1 text-blue-600" />
              {compact ? 'Validando...' : 'Validando con IA...'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ejecutando validación inteligente con IA</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!validationResult) {
    return (
      <Badge variant="secondary" className="text-gray-600">
        <Brain className="h-3 w-3 mr-1" />
        {compact ? 'Sin validar' : 'Validación pendiente'}
      </Badge>
    );
  }

  const getSectionValidation = () => {
    if (!sectionName || !validationResult.sectionsStatus[sectionName as keyof typeof validationResult.sectionsStatus]) {
      return {
        valid: validationResult.isValid,
        score: validationResult.overallScore,
        issues: validationResult.issues.filter(i => i.severity === 'critical').length
      };
    }
    
    const section = validationResult.sectionsStatus[sectionName as keyof typeof validationResult.sectionsStatus];
    return {
      valid: section.valid,
      score: section.score,
      issues: section.issues.filter(i => i.severity === 'critical').length
    };
  };

  const { valid, score, issues } = getSectionValidation();

  const getIndicatorConfig = () => {
    if (issues > 0) {
      return {
        icon: <XCircle className="h-3 w-3 mr-1" />,
        text: compact ? `${issues} críticos` : `${issues} problemas críticos`,
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800 border-red-300'
      };
    }
    
    if (!valid || score < 70) {
      const warningCount = validationResult.issues.filter(i => 
        (!sectionName || i.section === sectionName) && 
        ['warning', 'medium'].includes(i.severity)
      ).length;
      
      return {
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        text: compact ? `${score}%` : `${score}% (${warningCount} advertencias)`,
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    }
    
    return {
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      text: compact ? `${score}%` : `Válida (${score}%)`,
      variant: 'default' as const,
      color: 'bg-green-100 text-green-800 border-green-300'
    };
  };

  const config = getIndicatorConfig();

  const riskLevel = validationResult.aiInsights.riskLevel;
  const showAiIndicator = validationResult.aiInsights.compliancePrediction > 0;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2">
            <Badge variant={config.variant} className={config.color}>
              {config.icon}
              {config.text}
            </Badge>
            
            {showAiIndicator && (
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  riskLevel === 'low' ? 'border-green-300 text-green-700' :
                  riskLevel === 'medium' ? 'border-yellow-300 text-yellow-700' :
                  'border-red-300 text-red-700'
                }`}
              >
                <Brain className="h-2 w-2 mr-1" />
                IA
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div><strong>Score SAT:</strong> {validationResult.overallScore}%</div>
            <div><strong>Riesgo IA:</strong> {riskLevel.toUpperCase()}</div>
            <div><strong>Prob. Timbrado:</strong> {validationResult.aiInsights.timbradoProbability}%</div>
            {sectionName && (
              <div><strong>Sección:</strong> {sectionName}</div>
            )}
            <div><strong>Problemas:</strong> {validationResult.issues.length}</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
