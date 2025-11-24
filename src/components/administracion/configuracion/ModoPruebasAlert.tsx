import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface ModoPruebasAlertProps {
  modoPruebas: boolean;
}

export function ModoPruebasAlert({ modoPruebas }: ModoPruebasAlertProps) {
  if (!modoPruebas) return null;

  return (
    <Alert className="bg-amber-50 border-amber-200">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-900">Modo Pruebas Activo (Sandbox)</AlertTitle>
      <AlertDescription className="text-amber-800">
        <div className="space-y-2">
          <p>
            Se están usando los <strong>datos oficiales del SAT</strong> para pruebas automáticamente:
          </p>
          <div className="bg-amber-100 p-3 rounded-md space-y-1 font-mono text-sm">
            <div><strong>RFC:</strong> EKU9003173C9</div>
            <div><strong>Nombre:</strong> ESCUELA KEMPER URGATE</div>
            <div><strong>Régimen Fiscal:</strong> 601 - General de Ley Personas Morales</div>
          </div>
          <p className="text-xs">
            Estos datos se usan automáticamente para cumplir con los requisitos del SAT en ambiente de pruebas.
            Tu configuración real se usará cuando cambies a modo producción.
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
