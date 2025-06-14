import React, { useState, useEffect } from 'react';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { FlujoCargaSelector } from './configuracion/FlujoCargaSelector';
import { ConfiguracionPrincipalMejorada } from './configuracion/ConfiguracionPrincipalMejorada';
import { VersionSelector } from './VersionSelector';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from './CartaPorteForm';
import { useVersionManager } from '@/hooks/useVersionManager';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';
import { toast } from 'sonner';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  const [tipoCreacion, setTipoCreacion] = useState<'plantilla' | 'carga' | 'manual'>(data.tipoCreacion || 'manual');
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Gestión de versiones
  const {
    version,
    toggleVersion,
    isChangingVersion
  } = useVersionManager({
    initialVersion: (data.cartaPorteVersion as CartaPorteVersion) || '3.1',
    onVersionChange: (newVersion) => {
      onChange({ cartaPorteVersion: newVersion });
    },
    formData: data,
    updateFormData: (section, newData) => {
      onChange(newData);
    }
  });

  useEffect(() => {
    onChange({ tipoCreacion });
  }, [tipoCreacion, onChange]);

  // Actualizar versión en datos cuando cambie
  useEffect(() => {
    if (data.cartaPorteVersion !== version) {
      onChange({ cartaPorteVersion: version });
    }
  }, [version, data.cartaPorteVersion, onChange]);

  const handleCargarPlantilla = (plantilla: any) => {
    onChange({
      rfcEmisor: plantilla.rfc_emisor,
      nombreEmisor: plantilla.nombre_emisor,
      rfcReceptor: plantilla.rfc_receptor,
      nombreReceptor: plantilla.nombre_receptor,
      tipoCfdi: plantilla.tipo_cfdi,
      transporteInternacional: plantilla.transporte_internacional,
      registroIstmo: plantilla.registro_istmo,
      cartaPorteVersion: plantilla.carta_porte_version || version
    });
    setShowPlantillas(false);
    setTipoCreacion('manual');
  };

  const handleCargarDocumento = (mercancias: any[]) => {
    if (Array.isArray(mercancias) && mercancias.length > 0) {
      const nuevas = mercancias.map(m => ({
        id: crypto.randomUUID(),
        moneda: m.moneda || 'MXN',
        ...m
      }));
      const actuales = Array.isArray(data.mercancias) ? data.mercancias : [];
      onChange({ mercancias: [...actuales, ...nuevas] });
      toast.success(`${nuevas.length} mercancías importadas`);
    } else {
      toast.info('No se encontraron mercancías en el documento');
    }
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
      {/* Selector de Versión del Complemento */}
      <VersionSelector
        version={version}
        onVersionChange={toggleVersion}
        isChanging={isChangingVersion}
      />

      {/* Selector de Tipo de Creación */}
      <FlujoCargaSelector
        tipoCreacion={tipoCreacion}
        onTipoChange={setTipoCreacion}
        onShowPlantillas={() => setShowPlantillas(true)}
        onShowDocumentUpload={() => setShowDocumentUpload(true)}
      />

      {/* Configuración Principal con CRM Integrado */}
      <ConfiguracionPrincipalMejorada
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
