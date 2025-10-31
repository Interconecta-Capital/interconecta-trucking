/**
 * FASE 4: Toast consolidado de validación
 * Muestra resumen de validaciones en un solo toast
 */

import React from 'react';
import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface ValidationSummaryToastProps {
  validaciones: {
    usoCFDI?: boolean;
    codigosPostales?: boolean;
    coordenadas?: boolean;
    figuras?: boolean;
    distancia?: boolean;
    [key: string]: boolean | undefined;
  };
  detalles?: {
    [key: string]: string;
  };
}

export function ValidationSummaryToast({ validaciones, detalles }: ValidationSummaryToastProps) {
  const items = Object.entries(validaciones);
  const validos = items.filter(([_, v]) => v).length;
  const total = items.length;
  const porcentaje = Math.round((validos / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 font-semibold">
        {porcentaje === 100 ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : porcentaje >= 70 ? (
          <AlertCircle className="h-4 w-4 text-yellow-500" />
        ) : (
          <XCircle className="h-4 w-4 text-red-500" />
        )}
        <span>Estado de Validación: {porcentaje}%</span>
      </div>
      
      <div className="space-y-1 text-sm">
        {items.map(([key, valido]) => (
          <div key={key} className="flex items-center gap-2">
            <span className={valido ? 'text-green-600' : 'text-red-600'}>
              {valido ? '✅' : '❌'}
            </span>
            <span>
              {key.replace(/([A-Z])/g, ' $1').trim()}
              {detalles?.[key] && `: ${detalles[key]}`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function mostrarResumenValidacion(validaciones: ValidationSummaryToastProps['validaciones'], detalles?: ValidationSummaryToastProps['detalles']) {
  const items = Object.entries(validaciones);
  const validos = items.filter(([_, v]) => v).length;
  const total = items.length;
  const porcentaje = Math.round((validos / total) * 100);
  
  const tipo = porcentaje === 100 ? 'success' : porcentaje >= 70 ? 'warning' : 'error';
  
  const mensaje = items.map(([key, valido]) => 
    `${valido ? '✅' : '❌'} ${key.replace(/([A-Z])/g, ' $1').trim()}${detalles?.[key] ? `: ${detalles[key]}` : ''}`
  ).join('\n');
  
  // Importar dinámicamente toast
  import('sonner').then(({ toast }) => {
    if (tipo === 'success') {
      toast.success('✅ Datos validados', { description: mensaje, duration: 3000 });
    } else if (tipo === 'warning') {
      toast.warning(`⚠️ Validación ${porcentaje}% completa`, { description: mensaje, duration: 5000 });
    } else {
      toast.error(`❌ Errores de validación`, { description: mensaje, duration: 8000 });
    }
  });
}
