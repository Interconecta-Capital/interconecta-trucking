
import { useState, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto } from '@/types/cartaPorte';
import { CartaPorteFormData } from '@/hooks/carta-porte/types/useCartaPorteFormTypes';

const getDefaultAutotransporte = (): AutotransporteCompleto => ({
  placa_vm: '',
  anio_modelo_vm: new Date().getFullYear(),
  config_vehicular: '',
  perm_sct: '',
  num_permiso_sct: '',
  asegura_resp_civil: '',
  poliza_resp_civil: '',
  peso_bruto_vehicular: 0,
  capacidad_carga: 0,
  remolques: []
});

const getDefaultFormData = (): CartaPorteFormData => {
  const defaultCartaPorteData: CartaPorteData = {
    version: '3.1',
    cartaPorteVersion: '3.1',
    tipoCfdi: 'Traslado',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    transporteInternacional: false,
    registroIstmo: false,
    ubicaciones: [],
    mercancias: [],
    autotransporte: getDefaultAutotransporte(),
    figuras: [],
    tipoCreacion: 'manual'
  };

  return {
    configuracion: {
      version: '3.1' as const,
      tipoComprobante: 'T',
      emisor: {
        rfc: '',
        nombre: '',
        regimenFiscal: ''
      },
      receptor: {
        rfc: '',
        nombre: ''
      }
    },
    // Spread all CartaPorteData properties
    ...defaultCartaPorteData
  };
};

export const useCartaPorteForm = () => {
  const [formData, setFormData] = useState<CartaPorteFormData>(getDefaultFormData());
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const updateFormData = useCallback((updates: Partial<CartaPorteData>) => {
    setFormData(prev => {
      const updatedCartaPorteData: CartaPorteData = {
        ...prev,
        ...updates,
        version: updates.version || prev.version || '3.1'
      };

      // Update configuracion section as well
      const updatedFormData: CartaPorteFormData = {
        configuracion: {
          ...prev.configuracion,
          version: (updates.cartaPorteVersion as '3.0' | '3.1') || prev.configuracion.version,
          emisor: {
            ...prev.configuracion.emisor,
            rfc: updates.rfcEmisor || prev.configuracion.emisor.rfc,
            nombre: updates.nombreEmisor || prev.configuracion.emisor.nombre
          },
          receptor: {
            ...prev.configuracion.receptor,
            rfc: updates.rfcReceptor || prev.configuracion.receptor.rfc,
            nombre: updates.nombreReceptor || prev.configuracion.receptor.nombre
          }
        },
        ...updatedCartaPorteData
      };

      return updatedFormData;
    });
    setIsDirty(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData(getDefaultFormData());
    setCurrentStep(0);
    setIsDirty(false);
  }, []);

  return {
    formData,
    setFormData,
    currentStep,
    setCurrentStep,
    isDirty,
    updateFormData,
    resetForm
  };
};
