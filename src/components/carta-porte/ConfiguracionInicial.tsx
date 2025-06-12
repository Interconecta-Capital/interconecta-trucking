
import React, { useState, useEffect } from 'react';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { FlujoCargaSelector } from './configuracion/FlujoCargaSelector';
import { ConfiguracionPrincipal } from './configuracion/ConfiguracionPrincipal';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from './CartaPorteForm';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const [tipoCreacion, setTipoCreacion] = useState<'plantilla' | 'carga' | 'manual'>(data.tipoCreacion || 'manual');
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  useEffect(() => {
    onChange({ tipoCreacion });
  }, [tipoCreacion, onChange]);

  const handleCargarPlantilla = (plantilla: any) => {
    onChange({
      rfcEmisor: plantilla.rfc_emisor,
      nombreEmisor: plantilla.nombre_emisor,
      rfcReceptor: plantilla.rfc_receptor,
      nombreReceptor: plantilla.nombre_receptor,
      tipoCfdi: plantilla.tipo_cfdi,
      transporteInternacional: plantilla.transporte_internacional,
      registroIstmo: plantilla.registro_istmo,
    });
    setShowPlantillas(false);
    setTipoCreacion('manual');
  };

  const handleCargarDocumento = (mercancias: any[]) => {
    // Process extracted goods data and update form
    console.log('Mercancías extraídas:', mercancias);
    setShowDocumentUpload(false);
    setTipoCreacion('manual');
  };

  const isFormValid = () => {
    // Validate RFC emisor
    const validacionEmisor = data.rfcEmisor ? RFCValidator.validarRFC(data.rfcEmisor) : { esValido: false };
    // Validate RFC receptor
    const validacionReceptor = data.rfcReceptor ? RFCValidator.validarRFC(data.rfcReceptor) : { esValido: false };

    return (
      data.rfcEmisor &&
      data.nombreEmisor &&
      data.rfcReceptor &&
      data.nombreReceptor &&
      data.tipoCfdi &&
      validacionEmisor.esValido &&
      validacionReceptor.esValido
    );
  };

  return (
    <div className="space-y-6">
      {/* Selector de Tipo de Creación */}
      <FlujoCargaSelector
        tipoCreacion={tipoCreacion}
        onTipoChange={setTipoCreacion}
        onShowPlantillas={() => setShowPlantillas(true)}
        onShowDocumentUpload={() => setShowDocumentUpload(true)}
      />

      {/* Configuración Principal */}
      <ConfiguracionPrincipal
        data={data}
        onChange={onChange}
        onNext={onNext}
        isFormValid={isFormValid()}
      />

      {/* Dialogs */}
      {showPlantillas && (
        <PlantillasSelector
          onSelectPlantilla={handleCargarPlantilla}
          onClose={() => setShowPlantillas(false)}
        />
      )}

      {showDocumentUpload && (
        <DocumentUploadDialog
          open={showDocumentUpload}
          onOpenChange={setShowDocumentUpload}
          onDocumentProcessed={handleCargarDocumento}
        />
      )}
    </div>
  );
}
