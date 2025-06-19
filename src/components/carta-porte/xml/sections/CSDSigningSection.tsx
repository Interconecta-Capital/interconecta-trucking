
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Download, CheckCircle, Loader2, AlertTriangle, FileSignature } from 'lucide-react';
import { CertificadoDigital } from '@/types/certificados';

interface CSDSigningSectionProps {
  xmlGenerado: string | null;
  xmlFirmado: string | null;
  certificadoActivo: CertificadoDigital | null;
  isSigning: boolean;
  infoFirmado: any;
  onFirmarXML: () => void;
  onDescargarFirmado: () => void;
  onValidarFirmado: () => void;
}

export function CSDSigningSection({ 
  xmlGenerado,
  xmlFirmado,
  certificadoActivo,
  isSigning,
  infoFirmado,
  onFirmarXML,
  onDescargarFirmado,
  onValidarFirmado
}: CSDSigningSectionProps) {
  
  const getCertificadoStatus = () => {
    if (!certificadoActivo) {
      return (
        <Alert className="bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            No tienes un certificado digital activo. 
            <strong className="ml-1">Configura uno en Configuración → Certificados Digitales</strong>
          </AlertDescription>
        </Alert>
      );
    }

    const diasVencimiento = Math.ceil(
      (new Date(certificadoActivo.fecha_fin_vigencia).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Shield className="h-5 w-5 text-green-600" />
          <div className="flex-1">
            <div className="font-medium text-green-900">
              Certificado Activo: {certificadoActivo.nombre_certificado}
            </div>
            <div className="text-sm text-green-700">
              RFC: {certificadoActivo.rfc_titular} | Serie: {certificadoActivo.numero_certificado}
            </div>
            <div className="text-sm text-green-600">
              Vigente por {diasVencimiento} días más
            </div>
          </div>
          <Badge variant="default" className="bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium flex items-center space-x-2">
        <FileSignature className="h-4 w-4" />
        <span>Firmado Digital con CSD</span>
      </h3>
      
      {getCertificadoStatus()}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button
          onClick={onFirmarXML}
          disabled={!xmlGenerado || !certificadoActivo || isSigning}
          className="flex items-center space-x-2"
        >
          {isSigning ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileSignature className="h-4 w-4" />
          )}
          <span>{isSigning ? 'Firmando...' : 'Firmar con CSD'}</span>
        </Button>
        
        {xmlFirmado && (
          <>
            <Button
              variant="outline"
              onClick={onValidarFirmado}
              className="flex items-center space-x-2"
            >
              <Shield className="h-4 w-4" />
              <span>Validar Firmado</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={onDescargarFirmado}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Descargar Firmado</span>
            </Button>
          </>
        )}
      </div>
      
      {xmlFirmado && infoFirmado && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>XML firmado exitosamente</strong>
            <div className="mt-2 space-y-1 text-sm">
              <div>Certificado: {infoFirmado.certificado?.numero}</div>
              <div>RFC Titular: {infoFirmado.certificado?.rfc}</div>
              <div>Fecha: {new Date(infoFirmado.fechaFirmado).toLocaleString()}</div>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {!certificadoActivo && (
        <Alert className="bg-blue-50 border-blue-200">
          <Shield className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>¿Qué es el firmado CSD?</strong>
            <div className="mt-2 text-sm">
              El firmado con Certificado de Sello Digital (CSD) añade una capa de autenticidad 
              y validez legal a tus documentos XML. Es requerido para documentos fiscales oficiales.
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
