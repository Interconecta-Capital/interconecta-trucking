
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Stamp, Download, CheckCircle, Loader2, AlertCircle, Shield } from 'lucide-react';

interface TimbradoSectionProps {
  xmlGenerado: string | null;
  xmlTimbrado: string | null;
  datosTimbre: any;
  isTimbring: boolean;
  cartaPorteId?: string;
  onValidarConexionPAC: () => void;
  onTimbrar: () => void;
  onDescargarTimbrado: () => void;
}

export function TimbradoSection({ 
  xmlGenerado,
  xmlTimbrado,
  datosTimbre,
  isTimbring,
  cartaPorteId,
  onValidarConexionPAC,
  onTimbrar,
  onDescargarTimbrado
}: TimbradoSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center space-x-2">
        <Stamp className="h-4 w-4" />
        <span>Timbrado Fiscal</span>
      </h3>
      
      <Alert className="bg-yellow-50 border-yellow-200">
        <AlertCircle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Funcionalidad en desarrollo:</strong> El timbrado está preparado para producción 
          pero requiere configuración del proveedor PAC.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={onValidarConexionPAC}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Shield className="h-4 w-4" />
          <span>Validar PAC</span>
        </Button>
        
        <Button
          onClick={onTimbrar}
          disabled={!xmlGenerado || isTimbring || !cartaPorteId}
          className="flex items-center space-x-2"
        >
          {isTimbring ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Stamp className="h-4 w-4" />
          )}
          <span>{isTimbring ? 'Timbrando...' : 'Timbrar'}</span>
        </Button>
        
        {xmlTimbrado && (
          <Button
            variant="outline"
            onClick={onDescargarTimbrado}
            className="flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Descargar Timbrado</span>
          </Button>
        )}
      </div>
      
      {datosTimbre && (
        <div className="space-y-2">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Carta Porte timbrada exitosamente
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>UUID:</strong> 
                <code className="ml-2 text-sm bg-white px-2 py-1 rounded">
                  {datosTimbre.uuid}
                </code>
              </div>
              {datosTimbre.folio && (
                <div>
                  <strong>Folio:</strong> 
                  <span className="ml-2">{datosTimbre.folio}</span>
                </div>
              )}
            </div>
            
            {datosTimbre.qrCode && (
              <div className="mt-4">
                <strong>Código QR:</strong>
                <div className="mt-2">
                  <img 
                    src={datosTimbre.qrCode} 
                    alt="Código QR" 
                    className="w-32 h-32 border" 
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
