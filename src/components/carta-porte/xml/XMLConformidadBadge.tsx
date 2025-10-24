import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { XMLValidationResult } from '@/services/xml/xmlSchemaValidator';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface XMLConformidadBadgeProps {
  validationResult: XMLValidationResult;
  showDetails?: boolean;
}

export function XMLConformidadBadge({ validationResult, showDetails = true }: XMLConformidadBadgeProps) {
  const { puntajeConformidad, esValido, errores, advertencias, sugerencias } = validationResult;

  const getColorClass = () => {
    if (puntajeConformidad >= 90) return 'bg-green-500 hover:bg-green-600';
    if (puntajeConformidad >= 70) return 'bg-yellow-500 hover:bg-yellow-600';
    if (puntajeConformidad >= 50) return 'bg-orange-500 hover:bg-orange-600';
    return 'bg-red-500 hover:bg-red-600';
  };

  const getIcon = () => {
    if (puntajeConformidad >= 90) return <CheckCircle2 className="w-4 h-4" />;
    if (puntajeConformidad >= 70) return <Info className="w-4 h-4" />;
    if (puntajeConformidad >= 50) return <AlertTriangle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (esValido) return 'XML Válido';
    if (puntajeConformidad >= 70) return 'Casi Válido';
    if (puntajeConformidad >= 50) return 'Requiere Correcciones';
    return 'XML Inválido';
  };

  if (!showDetails) {
    return (
      <Badge className={`${getColorClass()} text-white`}>
        {getIcon()}
        <span className="ml-1">{puntajeConformidad}%</span>
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={`${getColorClass()} text-white cursor-help`}>
            {getIcon()}
            <span className="ml-2">{getLabel()}</span>
            <span className="ml-2 font-bold">{puntajeConformidad}%</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-md">
          <div className="space-y-2">
            <div className="font-semibold">Conformidad con esquema SAT</div>
            
            {errores.length > 0 && (
              <div>
                <div className="text-red-500 font-medium flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  Errores ({errores.length})
                </div>
                <ul className="text-xs list-disc list-inside ml-4 mt-1">
                  {errores.slice(0, 3).map((error, idx) => (
                    <li key={idx}>{error}</li>
                  ))}
                  {errores.length > 3 && <li>...y {errores.length - 3} más</li>}
                </ul>
              </div>
            )}

            {advertencias.length > 0 && (
              <div>
                <div className="text-yellow-500 font-medium flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Advertencias ({advertencias.length})
                </div>
                <ul className="text-xs list-disc list-inside ml-4 mt-1">
                  {advertencias.slice(0, 2).map((warning, idx) => (
                    <li key={idx}>{warning}</li>
                  ))}
                  {advertencias.length > 2 && <li>...y {advertencias.length - 2} más</li>}
                </ul>
              </div>
            )}

            {sugerencias.length > 0 && (
              <div>
                <div className="text-blue-500 font-medium flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Sugerencias
                </div>
                <ul className="text-xs list-disc list-inside ml-4 mt-1">
                  {sugerencias.map((sugerencia, idx) => (
                    <li key={idx}>{sugerencia}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.esquemaUsado && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                <strong>Esquema:</strong> {validationResult.esquemaUsado.tipoDocumento} - {validationResult.esquemaUsado.tipoTransporte}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
