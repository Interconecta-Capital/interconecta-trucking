import React from 'react';
import { useAmbienteTimbrado } from '@/hooks/useAmbienteTimbrado';
import { useSuperuser } from '@/hooks/useSuperuser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Server, 
  TestTube, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

export function ConfiguracionPAC() {
  const { isSuperuser } = useSuperuser();
  const { 
    ambiente, 
    urlPAC, 
    isLoading, 
    isSandbox, 
    isProduction,
    cambiarAmbiente,
    isCambiandoAmbiente,
    validarConexion,
    isValidando,
    estadoConexion
  } = useAmbienteTimbrado();

  if (!isSuperuser) {
    return (
      <Alert variant="destructive">
        <Shield className="h-4 w-4" />
        <AlertTitle>Acceso Denegado</AlertTitle>
        <AlertDescription>
          Solo superusuarios pueden configurar el PAC.
        </AlertDescription>
      </Alert>
    );
  }

  const handleCambiarAmbiente = async (produccion: boolean) => {
    const nuevoAmbiente = produccion ? 'production' : 'sandbox';
    
    if (produccion) {
      const confirmar = window.confirm(
        '⚠️ ADVERTENCIA: Cambiar a PRODUCCIÓN consumirá timbres REALES.\n\n' +
        '¿Estás seguro de que deseas activar el modo de producción?'
      );
      if (!confirmar) return;
    }

    try {
      await cambiarAmbiente(nuevoAmbiente);
      toast.success(`Ambiente cambiado a ${nuevoAmbiente === 'production' ? 'PRODUCCIÓN' : 'SANDBOX'}`);
    } catch (error) {
      toast.error('Error al cambiar ambiente');
    }
  };

  const handleValidarConexion = async () => {
    try {
      const resultado = await validarConexion();
      if (resultado.success) {
        toast.success('Conexión con PAC validada correctamente');
      } else {
        toast.error(`Error de conexión: ${resultado.message}`);
      }
    } catch (error) {
      toast.error('Error al validar conexión');
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Configuración PAC SmartWeb (Conectia)
        </CardTitle>
        <CardDescription>
          Gestiona el ambiente de timbrado y credenciales del PAC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Estado actual del ambiente */}
        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="flex items-center gap-3">
            {isSandbox ? (
              <TestTube className="h-8 w-8 text-amber-500" />
            ) : (
              <Zap className="h-8 w-8 text-green-500" />
            )}
            <div>
              <p className="font-medium">Ambiente Actual</p>
              <p className="text-sm text-muted-foreground">{urlPAC}</p>
            </div>
          </div>
          <Badge 
            variant={isSandbox ? 'secondary' : 'default'}
            className={isSandbox ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}
          >
            {isSandbox ? 'SANDBOX' : 'PRODUCCIÓN'}
          </Badge>
        </div>

        {/* Advertencia de producción */}
        {isProduction && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Modo Producción Activo</AlertTitle>
            <AlertDescription>
              Los timbrados realizados consumirán créditos REALES y generarán CFDIs válidos ante el SAT.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Control de cambio de ambiente */}
        <div className="space-y-4">
          <h3 className="font-medium">Cambiar Ambiente</h3>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="space-y-1">
              <Label htmlFor="ambiente-switch" className="font-medium">
                Modo Producción
              </Label>
              <p className="text-sm text-muted-foreground">
                {isSandbox 
                  ? 'Actualmente en modo pruebas (sandbox)' 
                  : 'Actualmente en modo producción real'}
              </p>
            </div>
            <Switch
              id="ambiente-switch"
              checked={isProduction}
              onCheckedChange={handleCambiarAmbiente}
              disabled={isCambiandoAmbiente}
            />
          </div>
        </div>

        <Separator />

        {/* Información de credenciales */}
        <div className="space-y-4">
          <h3 className="font-medium">Credenciales Configuradas</h3>
          
          <div className="grid gap-3">
            <InfoRow 
              label="Proveedor" 
              value="SmartWeb (Conectia)" 
            />
            <InfoRow 
              label="RFC Emisor" 
              value={isProduction ? 'SOMA011202584' : 'EKU9003173C9 (Pruebas)'} 
            />
            <InfoRow 
              label="Usuario" 
              value={isProduction ? 'alanjahirsotomiranda@conectia.mx' : 'demo@sw.com.mx'} 
            />
            <InfoRow 
              label="URL API" 
              value={urlPAC} 
            />
          </div>
        </div>

        <Separator />

        {/* Validación de conexión */}
        <div className="space-y-4">
          <h3 className="font-medium">Estado de Conexión</h3>
          
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-3">
              {estadoConexion === 'conectado' ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : estadoConexion === 'error' ? (
                <XCircle className="h-5 w-5 text-red-500" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-muted" />
              )}
              <div>
                <p className="font-medium">
                  {estadoConexion === 'conectado' 
                    ? 'Conexión Activa' 
                    : estadoConexion === 'error'
                    ? 'Error de Conexión'
                    : 'Sin verificar'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Última verificación: {estadoConexion ? 'Reciente' : 'Nunca'}
                </p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleValidarConexion}
              disabled={isValidando}
            >
              {isValidando ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Validar
            </Button>
          </div>
        </div>

        <Separator />

        {/* Link al portal */}
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <a 
              href="https://portal.sw.com.mx/dashboard" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Ir al Portal SmartWeb
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 rounded bg-muted/50">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
  );
}
