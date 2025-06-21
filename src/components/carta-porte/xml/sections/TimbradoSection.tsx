
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Stamp, Download, CheckCircle, Loader2, AlertCircle, Shield, Clock, QrCode } from 'lucide-react';

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
  const formatFechaTimbrado = (fecha?: string) => {
    if (!fecha) return 'No disponible';
    try {
      return new Date(fecha).toLocaleString('es-MX');
    } catch {
      return fecha;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium flex items-center space-x-2">
          <Stamp className="h-4 w-4" />
          <span>Timbrado Fiscal SAT</span>
        </h3>
        
        {xmlTimbrado && (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Timbrado
          </Badge>
        )}
      </div>
      
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Timbrado PAC Real:</strong> Sistema integrado con FISCAL API para timbrado 
          oficial de documentos fiscales. Ambiente sandbox configurado para pruebas.
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
          <span>{isTimbring ? 'Timbrando...' : 'Timbrar con PAC'}</span>
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
      
      {isTimbring && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Procesando timbrado con proveedor PAC... Este proceso puede tomar unos segundos.
          </AlertDescription>
        </Alert>
      )}
      
      {datosTimbre && (
        <div className="space-y-3">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Carta Porte timbrada exitosamente</strong>
            </AlertDescription>
          </Alert>
          
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>UUID Fiscal:</strong> 
                <code className="ml-2 text-sm bg-white px-2 py-1 rounded block mt-1 break-all">
                  {datosTimbre.uuid}
                </code>
              </div>
              
              {datosTimbre.folio && (
                <div>
                  <strong>Folio Fiscal:</strong> 
                  <span className="ml-2 font-mono">{datosTimbre.folio}</span>
                </div>
              )}
              
              {datosTimbre.fechaTimbrado && (
                <div>
                  <strong>Fecha Timbrado:</strong> 
                  <span className="ml-2">{formatFechaTimbrado(datosTimbre.fechaTimbrado)}</span>
                </div>
              )}
              
              {datosTimbre.pac && (
                <div>
                  <strong>Proveedor PAC:</strong> 
                  <Badge variant="outline" className="ml-2">{datosTimbre.pac}</Badge>
                </div>
              )}
            </div>
            
            {datosTimbre.cadenaOriginal && (
              <div>
                <strong>Cadena Original (primeros 100 caracteres):</strong>
                <code className="ml-2 text-xs bg-white px-2 py-1 rounded block mt-1">
                  {datosTimbre.cadenaOriginal.substring(0, 100)}...
                </code>
              </div>
            )}
            
            {datosTimbre.qrCode && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <QrCode className="h-4 w-4" />
                  <strong>Código QR Fiscal:</strong>
                </div>
                <div className="flex justify-center">
                  <img 
                    src={datosTimbre.qrCode} 
                    alt="Código QR Fiscal" 
                    className="w-32 h-32 border border-gray-300 rounded" 
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
