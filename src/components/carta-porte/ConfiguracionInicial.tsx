
import React, { useState, useEffect } from 'react';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { FlujoCargaSelector } from './configuracion/FlujoCargaSelector';
import { ConfiguracionPrincipalMejorada } from './configuracion/ConfiguracionPrincipalMejorada';
import { VersionSelector } from './VersionSelector';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from '@/types/cartaPorte';
import { useVersionManager } from '@/hooks/useVersionManager';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';
import { toast } from 'sonner';

interface ConfiguracionInicialProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicial({ data, onChange, onNext }: ConfiguracionInicialProps) {
  // Provide default values if data is undefined or incomplete
  const safeData = {
    tipoCreacion: 'manual' as const,
    cartaPorteVersion: '3.1' as CartaPorteVersion,
    tipoCfdi: 'Traslado' as const,
    transporteInternacional: 'No',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    registroIstmo: false,
    ...data
  };

  const [tipoCreacion, setTipoCreacion] = useState<'plantilla' | 'carga' | 'manual'>(
    safeData.tipoCreacion || 'manual'
  );
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Gestión de versiones
  const {
    version,
    toggleVersion,
    isChangingVersion
  } = useVersionManager({
    initialVersion: safeData.cartaPorteVersion || '3.1',
    onVersionChange: (newVersion) => {
      onChange({ cartaPorteVersion: newVersion });
    },
    formData: safeData,
    updateFormData: (section, newData) => {
      onChange(newData);
    }
  });

  useEffect(() => {
    onChange({ tipoCreacion });
  }, [tipoCreacion, onChange]);

  // Actualizar versión en datos cuando cambie
  useEffect(() => {
    if (safeData.cartaPorteVersion !== version) {
      onChange({ cartaPorteVersion: version });
    }
  }, [version, safeData.cartaPorteVersion, onChange]);

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
      const actuales = Array.isArray(safeData.mercancias) ? safeData.mercancias : [];
      onChange({ mercancias: [...actuales, ...nuevas] });
      toast.success(`${nuevas.length} mercancías cargadas desde el documento`);
    } else {
      toast.info('No se encontraron mercancías en el documento');
    }
    setShowDocumentUpload(false);
    setTipoCreacion('manual');
  };

  const isFormValid = () => {
    // Validate RFC emisor
    const validacionEmisor = safeData.rfcEmisor ? RFCValidator.validarRFC(safeData.rfcEmisor) : { esValido: false };
    // Validate RFC receptor
    const validacionReceptor = safeData.rfcReceptor ? RFCValidator.validarRFC(safeData.rfcReceptor) : { esValido: false };

    return (
      safeData.rfcEmisor &&
      safeData.nombreEmisor &&
      safeData.rfcReceptor &&
      safeData.nombreReceptor &&
      safeData.tipoCfdi &&
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
        data={safeData}
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
