
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CartaPorteVersion, VERSION_INFO } from '@/types/cartaPorteVersions';

interface VersionSelectorProps {
  version: CartaPorteVersion;
  onVersionChange: (version: CartaPorteVersion) => void;
  isChanging?: boolean;
  disabled?: boolean;
  showDescription?: boolean;
}

export function VersionSelector({
  version,
  onVersionChange,
  isChanging = false,
  disabled = false,
  showDescription = true
}: VersionSelectorProps) {
  const currentVersionInfo = VERSION_INFO[version];
  const targetVersion = version === '3.1' ? '3.0' : '3.1';
  const targetVersionInfo = VERSION_INFO[targetVersion];

  const handleToggle = (checked: boolean) => {
    const newVersion = checked ? '3.1' : '3.0';
    onVersionChange(newVersion);
  };

  return (
    <div className="space-y-4">
      {/* Selector Principal */}
      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
        <div className="flex items-center space-x-3">
          <Label htmlFor="version-selector" className="text-sm font-medium">
            Versión del Complemento
          </Label>
          <Badge variant={version === '3.1' ? 'default' : 'secondary'}>
            {currentVersionInfo.label}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground">3.0</span>
          <Switch
            id="version-selector"
            checked={version === '3.1'}
            onCheckedChange={handleToggle}
            disabled={disabled || isChanging}
          />
          <span className="text-sm text-muted-foreground">3.1</span>
        </div>
      </div>

      {/* Descripción y alertas */}
      {showDescription && (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            {currentVersionInfo.description}
          </div>

          {version === '3.0' && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>Versión Legacy:</strong> Se recomienda usar la versión 3.1 para nuevas cartas porte.
                La versión 3.0 se mantiene para compatibilidad con documentos existentes.
              </AlertDescription>
            </Alert>
          )}

          {version === '3.1' && (
            <Alert className="border-green-200 bg-green-50">
              <Info className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Versión Actual:</strong> Incluye mejoras en validación, nuevos campos obligatorios
                y compatibilidad con las últimas especificaciones del SAT.
              </AlertDescription>
            </Alert>
          )}

          {/* Indicador de cambio en progreso */}
          {isChanging && (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Migrando datos a versión {targetVersionInfo.label}...
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Diferencias clave */}
      <details className="text-sm">
        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
          Ver diferencias principales entre versiones
        </summary>
        <div className="mt-2 space-y-2 text-xs text-muted-foreground">
          <div>
            <strong>Versión 3.1:</strong>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Régimen Aduanero como array (múltiples valores)</li>
              <li>Fracción Arancelaria obligatoria</li>
              <li>Nuevos campos de RemolquesCCP</li>
              <li>39 campos adicionales mejorados</li>
              <li>Validaciones más estrictas</li>
            </ul>
          </div>
          <div>
            <strong>Versión 3.0:</strong>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Régimen Aduanero como campo único</li>
              <li>Fracción Arancelaria opcional</li>
              <li>Estructura simplificada</li>
              <li>Compatible con sistemas legacy</li>
            </ul>
          </div>
        </div>
      </details>
    </div>
  );
}
