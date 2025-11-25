import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FlaskConical, AlertTriangle } from 'lucide-react';
import { useSuperuser } from '@/hooks/useSuperuser';

interface DatosFiscalesModoPruebasProps {
  modoPruebas: boolean;
  onModoPruebasChange: (enabled: boolean) => void;
  disabled?: boolean;
}

/**
 * Componente para control de Modo Pruebas (Sandbox)
 * Solo visible y funcional para SUPERUSUARIOS
 */
export function DatosFiscalesModoPruebas({ 
  modoPruebas, 
  onModoPruebasChange,
  disabled 
}: DatosFiscalesModoPruebasProps) {
  const { isSuperuser } = useSuperuser();

  // No renderizar nada si no es superusuario
  if (!isSuperuser) {
    return null;
  }

  return (
    <div className="space-y-4 border-t pt-6 mt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-amber-500" />
            <Label htmlFor="modo_pruebas" className="text-base font-semibold">
              Modo Pruebas (Sandbox)
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Usar endpoints de prueba del PAC para desarrollo
          </p>
        </div>
        <Switch
          id="modo_pruebas"
          checked={modoPruebas}
          onCheckedChange={onModoPruebasChange}
          disabled={disabled}
        />
      </div>

      {modoPruebas && (
        <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-900 dark:text-amber-100">
            <p className="font-semibold mb-2">⚠️ Modo Pruebas Activo</p>
            <ul className="list-disc list-inside text-sm space-y-1">
              <li>Los timbres NO son válidos fiscalmente</li>
              <li>Se usan endpoints sandbox del PAC</li>
              <li>Solo para testing y desarrollo</li>
              <li>Cambiar a producción para usar timbres reales</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
