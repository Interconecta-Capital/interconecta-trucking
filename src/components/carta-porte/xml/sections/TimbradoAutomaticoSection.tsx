
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, 
  Timer, 
  CheckCircle, 
  AlertCircle, 
  Settings,
  Activity
} from 'lucide-react';

interface TimbradoAutomaticoSectionProps {
  cartaPorteCompleta: boolean;
  autoTimbrado: boolean;
  onToggleAutoTimbrado: (enabled: boolean) => void;
  onTimbrarManual: () => void;
  isTimbring: boolean;
  xmlTimbrado: string | null;
}

export function TimbradoAutomaticoSection({
  cartaPorteCompleta,
  autoTimbrado,
  onToggleAutoTimbrado,
  onTimbrarManual,
  isTimbring,
  xmlTimbrado
}: TimbradoAutomaticoSectionProps) {
  const [showConfig, setShowConfig] = useState(false);

  const getStatusBadge = () => {
    if (xmlTimbrado) {
      return <Badge className="bg-green-100 text-green-800">Timbrado Completado</Badge>;
    }
    if (cartaPorteCompleta && autoTimbrado) {
      return <Badge className="bg-blue-100 text-blue-800">Auto-Timbrado Activo</Badge>;
    }
    if (cartaPorteCompleta) {
      return <Badge className="bg-yellow-100 text-yellow-800">Listo para Timbrar</Badge>;
    }
    return <Badge variant="outline">Carta Porte Incompleta</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Zap className="h-5 w-5" />
          <span>Timbrado Automático</span>
        </h3>
        {getStatusBadge()}
      </div>

      <Alert className="bg-blue-50 border-blue-200">
        <Activity className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>FISCAL API integrado:</strong> Timbrado automático al completar datos 
          o manual cuando lo requieras. Compliance SAT al 100% garantizado.
        </AlertDescription>
      </Alert>

      {/* Configuración de Auto-Timbrado */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Timer className="h-5 w-5 text-gray-600" />
            <div>
              <h4 className="font-medium">Timbrado Automático</h4>
              <p className="text-sm text-gray-600">
                Timbra automáticamente al completar todos los datos
              </p>
            </div>
          </div>
          <Switch
            checked={autoTimbrado}
            onCheckedChange={onToggleAutoTimbrado}
            disabled={!cartaPorteCompleta}
          />
        </div>

        {autoTimbrado && cartaPorteCompleta && !xmlTimbrado && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              La Carta Porte se timbrará automáticamente cuando todos los datos estén completos
            </AlertDescription>
          </Alert>
        )}

        {!cartaPorteCompleta && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Completa todos los datos requeridos para habilitar el timbrado automático
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Timbrado Manual */}
      <div className="space-y-3">
        <h4 className="font-medium">Timbrado Manual</h4>
        <p className="text-sm text-gray-600">
          Si necesitas timbrar antes de completar el viaje o prefieres control manual
        </p>
        
        <Button
          onClick={onTimbrarManual}
          disabled={!cartaPorteCompleta || isTimbring || xmlTimbrado !== null}
          className="flex items-center space-x-2"
          variant={xmlTimbrado ? "outline" : "default"}
        >
          {isTimbring ? (
            <>
              <Timer className="h-4 w-4 animate-spin" />
              <span>Timbrando...</span>
            </>
          ) : xmlTimbrado ? (
            <>
              <CheckCircle className="h-4 w-4" />
              <span>Ya Timbrado</span>
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              <span>Timbrar Ahora</span>
            </>
          )}
        </Button>
      </div>

      {/* Configuración Avanzada */}
      <div className="border-t pt-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Configuración Avanzada</span>
        </Button>

        {showConfig && (
          <div className="mt-3 space-y-3 bg-gray-50 p-3 rounded">
            <div className="text-sm space-y-2">
              <p><strong>API:</strong> FISCAL API (Ambiente: Test)</p>
              <p><strong>Compliance:</strong> SAT 100%</p>
              <p><strong>Tracking:</strong> Integrado</p>
              <p><strong>Facturación:</strong> Instantánea disponible</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
