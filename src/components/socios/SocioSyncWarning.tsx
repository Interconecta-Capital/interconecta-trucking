import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCcw } from 'lucide-react';

interface SocioSyncWarningProps {
  socioId?: string;
  cantidadDocumentosAfectados?: number;
  cambiosImportantes: string[];
}

export function SocioSyncWarning({ 
  socioId, 
  cantidadDocumentosAfectados = 0,
  cambiosImportantes 
}: SocioSyncWarningProps) {
  if (!socioId || cambiosImportantes.length === 0) return null;

  return (
    <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950/20">
      <RefreshCcw className="h-4 w-4 text-blue-600" />
      <AlertDescription>
        <div className="space-y-2">
          <p className="font-medium text-blue-900 dark:text-blue-100">
            Sincronización Automática Habilitada
          </p>
          {cantidadDocumentosAfectados > 0 ? (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Los siguientes cambios se aplicarán a <strong>{cantidadDocumentosAfectados}</strong> documentos en borrador:
            </p>
          ) : (
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Los siguientes cambios se detectaron:
            </p>
          )}
          <ul className="list-disc list-inside text-sm text-blue-700 dark:text-blue-300 space-y-1">
            {cambiosImportantes.map((cambio, i) => (
              <li key={i}>{cambio}</li>
            ))}
          </ul>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-center gap-1">
            <span>ℹ️</span>
            <span>Solo se actualizarán documentos NO timbrados (borradores y viajes activos)</span>
          </p>
        </div>
      </AlertDescription>
    </Alert>
  );
}
