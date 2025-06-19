
import React, { useState } from 'react';
import { Copy, Check, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UUIDService } from '@/services/uuid/UUIDService';

interface IdCCPDisplayProps {
  idCCP?: string;
  className?: string;
}

export function IdCCPDisplay({ idCCP, className = '' }: IdCCPDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!idCCP) return;
    
    try {
      await navigator.clipboard.writeText(idCCP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying IdCCP:', error);
    }
  };

  const validation = idCCP ? UUIDService.validateIdCCP(idCCP) : { isValid: false };
  const displayValue = UUIDService.formatIdCCPForDisplay(idCCP || '');

  return (
    <div className={`flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-blue-600" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Identificador único del Complemento Carta Porte</p>
              <p>Se genera automáticamente según RFC 4122</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span className="text-sm font-medium text-blue-900">ID Carta Porte (IdCCP):</span>
      </div>

      <div className="flex items-center gap-2 flex-1">
        <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
          {displayValue}
        </code>
        
        {validation.isValid ? (
          <Badge variant="secondary" className="text-green-700 bg-green-100">
            Válido
          </Badge>
        ) : (
          <Badge variant="destructive">
            {idCCP ? 'Inválido' : 'Pendiente'}
          </Badge>
        )}
      </div>

      {idCCP && validation.isValid && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" />
              Copiado
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copiar
            </>
          )}
        </Button>
      )}
    </div>
  );
}
