
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2,
  Shield,
  Star
} from 'lucide-react';
import { ValidationSAT31Result } from '@/services/validation/SATValidation31Enhanced';

interface RealtimeValidationIndicatorProps {
  validation: ValidationSAT31Result | null;
  isValidating: boolean;
  compact?: boolean;
  showScore?: boolean;
}

export const RealtimeValidationIndicator: React.FC<RealtimeValidationIndicatorProps> = ({
  validation,
  isValidating,
  compact = false,
  showScore = true
}) => {
  if (isValidating) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className="animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              {compact ? 'Validando...' : 'Validando SAT 3.1...'}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ejecutando validaciones SAT Carta Porte 3.1</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!validation) {
    return (
      <Badge variant="secondary">
        <Shield className="h-3 w-3 mr-1" />
        Sin validar
      </Badge>
    );
  }

  const getIndicatorConfig = () => {
    if (validation.criticalIssues.length > 0) {
      return {
        icon: <XCircle className="h-3 w-3 mr-1" />,
        text: compact ? 'Crítico' : 'Errores críticos',
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800'
      };
    }
    
    if (validation.errors.length > 0) {
      return {
        icon: <XCircle className="h-3 w-3 mr-1" />,
        text: compact ? 'Errores' : `${validation.errors.length} errores`,
        variant: 'destructive' as const,
        color: 'bg-red-100 text-red-800'
      };
    }
    
    if (validation.warnings.length > 0) {
      return {
        icon: <AlertTriangle className="h-3 w-3 mr-1" />,
        text: compact ? 'Advertencias' : `${validation.warnings.length} advertencias`,
        variant: 'secondary' as const,
        color: 'bg-yellow-100 text-yellow-800'
      };
    }
    
    return {
      icon: <CheckCircle2 className="h-3 w-3 mr-1" />,
      text: compact ? 'Válida' : 'Carta Porte válida',
      variant: 'default' as const,
      color: 'bg-green-100 text-green-800'
    };
  };

  const config = getIndicatorConfig();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center space-x-2">
            <Badge variant={config.variant} className={config.color}>
              {config.icon}
              {config.text}
            </Badge>
            
            {showScore && (
              <Badge variant="outline" className="text-xs">
                {validation.complianceScore}%
              </Badge>
            )}
            
            {validation.version31Specific.length > 0 && (
              <Badge variant="outline" className="text-purple-600 text-xs">
                <Star className="h-2 w-2 mr-1" />
                3.1
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <div>Score SAT: {validation.complianceScore}%</div>
            <div>Errores: {validation.errors.length}</div>
            <div>Advertencias: {validation.warnings.length}</div>
            <div>Recomendaciones: {validation.recommendations.length}</div>
            {validation.version31Specific.length > 0 && (
              <div>Funciones 3.1: {validation.version31Specific.length}</div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
