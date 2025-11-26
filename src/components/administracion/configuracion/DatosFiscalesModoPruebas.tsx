import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FlaskConical, AlertTriangle, Info, CheckCircle2, XCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useOptimizedSuperuser } from '@/hooks/useOptimizedSuperuser';

interface DatosFiscalesModoPruebasProps {
  modoPruebas: boolean;
  onModoPruebasChange: (enabled: boolean) => void;
  disabled?: boolean;
  rfcActual?: string;
}

/**
 * Componente para control de Modo Pruebas (Sandbox)
 * RESTRINGIDO: Solo superusers pueden cambiar entre modo pruebas y producción
 * Usuarios normales solo ven el estado actual
 */
export function DatosFiscalesModoPruebas({ 
  modoPruebas, 
  onModoPruebasChange,
  disabled,
  rfcActual 
}: DatosFiscalesModoPruebasProps) {
  const { isSuperuser, isLoading } = useOptimizedSuperuser();
  const [showInfoDialog, setShowInfoDialog] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);

  // RFC de prueba oficial del SAT
  const RFC_PRUEBA_SAT = 'EKU9003173C9';
  const esRfcPrueba = rfcActual === RFC_PRUEBA_SAT;

  // Solo superusers pueden cambiar el toggle
  const canToggle = isSuperuser && !disabled;

  const handleToggle = (enabled: boolean) => {
    // Solo permitir si es superuser
    if (!isSuperuser) return;
    
    // Si intenta activar producción con RFC de prueba, mostrar advertencia
    if (!enabled && esRfcPrueba) {
      setShowWarningDialog(true);
      return;
    }
    onModoPruebasChange(enabled);
  };

  // Si está cargando, mostrar skeleton
  if (isLoading) {
    return (
      <div className="space-y-4 border-t pt-6 mt-6 animate-pulse">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="h-20 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 border-t pt-6 mt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-amber-500" />
              <Label htmlFor="modo_pruebas" className="text-base font-semibold">
                Modo Pruebas (Sandbox)
              </Label>
              {isSuperuser && (
                <Badge variant="outline" className="text-xs border-purple-500 text-purple-600">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    type="button"
                    onClick={() => setShowInfoDialog(true)}
                  >
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>¿Qué es el modo pruebas?</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-sm text-muted-foreground">
              {isSuperuser 
                ? 'Prueba el sistema sin consumir timbres reales ni generar CFDIs válidos'
                : 'Estado actual del ambiente de timbrado (solo administradores pueden cambiar)'}
            </p>
          </div>
          
          {/* Toggle solo visible y funcional para superusers */}
          {isSuperuser ? (
            <Switch
              id="modo_pruebas"
              checked={modoPruebas}
              onCheckedChange={handleToggle}
              disabled={!canToggle}
            />
          ) : (
            // Para usuarios normales, solo mostrar el estado como badge
            <Badge 
              variant={modoPruebas ? 'secondary' : 'default'}
              className={modoPruebas ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}
            >
              {modoPruebas ? '🧪 Pruebas' : '✅ Producción'}
            </Badge>
          )}
        </div>

        {/* Alerta activa - Modo Pruebas */}
        {modoPruebas && (
          <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
              🧪 Modo Pruebas Activo
            </AlertTitle>
            <AlertDescription className="text-amber-900 dark:text-amber-100">
              <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                <li>Los timbres <strong>NO son válidos fiscalmente</strong></li>
                <li>Se usan endpoints sandbox del PAC (services.test.sw.com.mx)</li>
                <li>Ideal para aprender y probar sin riesgo</li>
                {isSuperuser && (
                  <li>Puedes usar el RFC de prueba: <code className="bg-amber-200 dark:bg-amber-900 px-1 rounded">EKU9003173C9</code></li>
                )}
              </ul>
              {isSuperuser && (
                <div className="mt-3 pt-3 border-t border-amber-300 dark:border-amber-800">
                  <p className="text-sm font-medium">
                    💡 Para generar timbres reales, cambia a <strong>Modo Producción</strong>
                  </p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Alerta activa - Modo Producción (SOLO para superusers) */}
        {!modoPruebas && isSuperuser && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100 font-semibold">
              ✅ Modo Producción Activo
            </AlertTitle>
            <AlertDescription className="text-green-900 dark:text-green-100">
              <p className="text-sm">
                Los timbres generados son <strong>válidos fiscalmente</strong> ante el SAT.
                Se utiliza el endpoint de producción (services.sw.com.mx).
              </p>
              <p className="text-sm mt-2 font-medium">
                ⚠️ Asegúrate de usar RFC y certificados reales
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Para usuarios normales en producción, no mostrar nada adicional */}

        {/* Dialog informativo */}
        <Dialog open={showInfoDialog} onOpenChange={setShowInfoDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-amber-500" />
                ¿Qué es el Modo Pruebas?
              </DialogTitle>
              <DialogDescription className="space-y-4 text-left pt-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">🧪 Modo Pruebas (Sandbox)</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Endpoint: <code className="bg-muted px-1 rounded">services.test.sw.com.mx</code></li>
                    <li>Timbres generados <strong>NO son válidos</strong> ante el SAT</li>
                    <li>No consume créditos de timbres reales</li>
                    <li>Perfecto para aprender y hacer pruebas</li>
                    {isSuperuser && (
                      <li>Puedes usar RFC de prueba: <code className="bg-muted px-1 rounded">EKU9003173C9</code></li>
                    )}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground">✅ Modo Producción</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Endpoint: <code className="bg-muted px-1 rounded">services.sw.com.mx</code></li>
                    <li>Timbres <strong>SÍ son válidos</strong> ante el SAT</li>
                    <li>Consume timbres reales</li>
                    <li>Requiere RFC real y certificados vigentes</li>
                    <li>Los CFDIs generados tienen validez fiscal completa</li>
                  </ul>
                </div>

                {!isSuperuser && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Nota
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                      Solo los administradores del sistema pueden cambiar entre modo pruebas y producción.
                      Si necesitas cambiar el modo, contacta a un administrador.
                    </p>
                  </div>
                )}

                {isSuperuser && (
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Recomendación
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-2">
                      Empieza en <strong>Modo Pruebas</strong> para familiarizarte con el sistema. 
                      Cuando estés listo para generar timbres reales, cambia a <strong>Modo Producción</strong> 
                      y asegúrate de tener configurados tus datos fiscales reales y certificados vigentes.
                    </p>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/* Dialog de advertencia - RFC de prueba en producción (solo superusers) */}
        {isSuperuser && (
          <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  No puedes activar Modo Producción
                </DialogTitle>
                <DialogDescription className="space-y-4 text-left pt-4">
                  <p className="text-sm">
                    Estás usando el RFC de prueba <code className="bg-muted px-1 rounded">{RFC_PRUEBA_SAT}</code>, 
                    que solo es válido en Modo Pruebas.
                  </p>
                  <div className="bg-amber-50 dark:bg-amber-950 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                      Para activar Modo Producción:
                    </p>
                    <ol className="list-decimal list-inside space-y-1 text-sm text-amber-800 dark:text-amber-200 mt-2">
                      <li>Actualiza tu RFC a uno real</li>
                      <li>Configura tu razón social correcta</li>
                      <li>Valida los datos contra el SAT</li>
                      <li>Sube certificados digitales vigentes</li>
                      <li>Luego podrás cambiar a producción</li>
                    </ol>
                  </div>
                  <Button 
                    onClick={() => setShowWarningDialog(false)}
                    className="w-full"
                  >
                    Entendido
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  );
}
