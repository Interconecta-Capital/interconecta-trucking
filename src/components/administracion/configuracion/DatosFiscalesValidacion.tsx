import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, Search, AlertTriangle } from 'lucide-react';
import { ValidacionRFCConCacheService } from '@/services/validacion/ValidacionRFCConCacheService';
import { NormalizadorSATService } from '@/services/normalizacion/NormalizadorSATService';
import { SATFormatters } from '@/utils/satFormatters';
import { toast } from 'sonner';

interface DatosFiscalesValidacionProps {
  rfc: string;
  razonSocial: string;
  modoPruebas: boolean;
  onValidacionExitosa: (rfcValidado: string, razonSocialNormalizada: string, regimenFiscal?: string) => void;
}

export function DatosFiscalesValidacion({
  rfc,
  razonSocial,
  modoPruebas,
  onValidacionExitosa
}: DatosFiscalesValidacionProps) {
  const [validando, setValidando] = useState(false);
  const [rfcValidado, setRfcValidado] = useState(false);
  const [advertencia, setAdvertencia] = useState<string | null>(null);

  const validarRFC = async () => {
    if (!rfc) {
      toast.error("Por favor ingresa un RFC");
      return;
    }
    
    // Validar formato
    if (!SATFormatters.validarRFC(rfc)) {
      toast.error("Formato de RFC inválido");
      return;
    }
    
    setValidando(true);
    setAdvertencia(null);
    
    try {
      const ambiente = modoPruebas ? 'sandbox' : 'produccion';
      
      const rfcValidadoData = await ValidacionRFCConCacheService.validarYCachearRFC(
        rfc,
        ambiente
      );
      
      // Comparar nombre ingresado con el del SAT
      const sugerencia = NormalizadorSATService.sugerirCorreccion(
        razonSocial,
        rfcValidadoData.razonSocial
      );
      
      if (sugerencia.necesitaCorreccion) {
        setAdvertencia(sugerencia.mensaje);
      }
      
      // Notificar éxito con datos normalizados
      onValidacionExitosa(
        rfcValidadoData.rfc,
        rfcValidadoData.razonSocialNormalizada,
        rfcValidadoData.regimenFiscal
      );
      
      setRfcValidado(true);
      
      toast.success(
        rfcValidadoData.origen === 'cache' 
          ? '✅ RFC validado (desde cache)' 
          : '✅ RFC validado contra el SAT'
      );
      
    } catch (error: any) {
      console.error('Error validando RFC:', error);
      toast.error(error.message || 'Error al validar RFC');
      setRfcValidado(false);
    } finally {
      setValidando(false);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={validarRFC}
        disabled={validando || !rfc}
        variant="outline"
        className="w-full"
      >
        {validando ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Validando contra el SAT...
          </>
        ) : rfcValidado ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            RFC Validado
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Validar RFC contra el SAT
          </>
        )}
      </Button>
      
      {rfcValidado && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            RFC validado correctamente. Los datos del SAT serán utilizados para timbrado.
          </AlertDescription>
        </Alert>
      )}
      
      {advertencia && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {advertencia}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
