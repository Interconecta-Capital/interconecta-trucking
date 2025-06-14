
import React, { useState, useEffect } from 'react';
import { PlantillasSelector } from './plantillas/PlantillasSelector';
import { DocumentUploadDialog } from './mercancias/DocumentUploadDialog';
import { FlujoCargaSelector } from './configuracion/FlujoCargaSelector';
import { ConfiguracionPrincipalMejoradaCorregida } from './configuracion/ConfiguracionPrincipalMejoradaCorregida';
import { VersionSelector } from './VersionSelector';
import { RFCValidator } from '@/utils/rfcValidation';
import { CartaPorteData } from '@/types/cartaPorte';
import { useVersionManager } from '@/hooks/useVersionManager';
import { CartaPorteVersion } from '@/types/cartaPorteVersions';
import { toast } from 'sonner';

interface ConfiguracionInicialCorregidoProps {
  data: CartaPorteData;
  onChange: (data: Partial<CartaPorteData>) => void;
  onNext: () => void;
}

export function ConfiguracionInicialCorregido({ data, onChange, onNext }: ConfiguracionInicialCorregidoProps) {
  const [tipoCreacion, setTipoCreacion] = useState<'plantilla' | 'carga' | 'manual'>(data.tipoCreacion || 'manual');
  const [showPlantillas, setShowPlantillas] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

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

  useEffect(() => {
    if (data.cartaPorteVersion !== version) {
      onChange({ cartaPorteVersion: version });
    }
  }, [version, data.cartaPorteVersion, onChange]);

  const handleConfiguracionChange = (newData: Partial<CartaPorteData>) => {
    console.log('ConfiguracionInicial - Procesando cambio:', {
      before: {
        entradaSalidaMerc: data.entradaSalidaMerc,
        viaTransporte: data.viaTransporte,
        transporteInternacional: data.transporteInternacional,
        pais_origen_destino: data.pais_origen_destino,
        via_entrada_salida: data.via_entrada_salida
      },
      change: newData,
      after: { ...data, ...newData }
    });
    
    onChange(newData);
  };

  const handleCargarPlantilla = (plantilla: any) => {
    const plantillaData = {
      rfcEmisor: plantilla.rfc_emisor,
      nombreEmisor: plantilla.nombre_emisor,
      rfcReceptor: plantilla.rfc_receptor,
      nombreReceptor: plantilla.nombre_receptor,
      tipoCfdi: plantilla.tipo_cfdi,
      transporteInternacional: plantilla.transporte_internacional,
      registroIstmo: plantilla.registro_istmo,
      cartaPorteVersion: plantilla.carta_porte_version || version
    };
    
    console.log('Cargando datos de plantilla:', plantillaData);
    onChange(plantillaData);
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
      toast.success(`${nuevas.length} mercancías cargadas desde el documento`);
    } else {
      toast.info('No se encontraron mercancías en el documento');
    }
    setShowDocumentUpload(false);
    setTipoCreacion('manual');
  };

  const isFormValid = () => {
    const validacionEmisor = data.rfcEmisor ? RFCValidator.validarRFC(data.rfcEmisor) : { esValido: false };
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
      <VersionSelector
        version={version}
        onVersionChange={toggleVersion}
        isChanging={isChangingVersion}
      />

      <FlujoCargaSelector
        tipoCreacion={tipoCreacion}
        onTipoChange={setTipoCreacion}
        onShowPlantillas={() => setShowPlantillas(true)}
        onShowDocumentUpload={() => setShowDocumentUpload(true)}
      />

      <ConfiguracionPrincipalMejoradaCorregida
        data={data}
        onChange={handleConfiguracionChange}
        onNext={onNext}
        isFormValid={isFormValid()}
      />

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
