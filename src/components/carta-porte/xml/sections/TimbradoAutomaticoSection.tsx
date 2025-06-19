
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

interface TimbradoAutomaticoSectionProps {
  cartaPorteCompleta: boolean;
  autoTimbrado: boolean;
  onToggleAutoTimbrado: (value: boolean) => void;
  onTimbrarManual: () => Promise<void>;
  isTimbring: boolean;
  xmlTimbrado?: string;
}

export function TimbradoAutomaticoSection({
  cartaPorteCompleta,
  autoTimbrado,
  onToggleAutoTimbrado,
  onTimbrarManual,
  isTimbring,
  xmlTimbrado
}: TimbradoAutomaticoSectionProps) {
  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-800">
            <Zap className="h-5 w-5" />
            <span>Timbrado Automático</span>
          </div>
          {xmlTimbrado && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Timbrado
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="auto-timbrado"
            checked={autoTimbrado}
            onCheckedChange={onToggleAutoTimbrado}
          />
          <Label htmlFor="auto-timbrado">
            Timbrar automáticamente cuando la carta porte esté completa
          </Label>
        </div>

        {!cartaPorteCompleta && (
          <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm">
              Complete todos los datos requeridos para habilitar el timbrado automático
            </span>
          </div>
        )}

        {cartaPorteCompleta && !xmlTimbrado && (
          <Button
            onClick={onTimbrarManual}
            disabled={isTimbring}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isTimbring ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Timbrando...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Timbrar Ahora
              </>
            )}
          </Button>
        )}

        <div className="text-xs text-gray-600 bg-white p-3 rounded border">
          <strong>Timbrado Automático:</strong> Se ejecutará automáticamente cuando:
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Todos los datos obligatorios estén completos</li>
            <li>El XML haya sido generado exitosamente</li>
            <li>La opción de auto-timbrado esté activada</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
