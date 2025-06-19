
import { useState, useCallback } from 'react';
import { useCartaPorteFormManager } from './useCartaPorteFormManager';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';

export const useOptimizedCartaPorteFormManager = (cartaPorteId?: string) => {
  const formManager = useCartaPorteFormManager();
  
  // Extract individual sections from formData
  const configuracion = {
    tipoCfdi: formManager.formData.tipoCfdi || 'Traslado',
    rfcEmisor: formManager.formData.rfcEmisor || '',
    nombreEmisor: formManager.formData.nombreEmisor || '',
    rfcReceptor: formManager.formData.rfcReceptor || '',
    nombreReceptor: formManager.formData.nombreReceptor || '',
    transporteInternacional: formManager.formData.transporteInternacional || false,
    registroIstmo: formManager.formData.registroIstmo || false,
    cartaPorteVersion: formManager.formData.cartaPorteVersion || '3.1'
  };

  const ubicaciones = formManager.formData.ubicaciones || [];
  const mercancias = formManager.formData.mercancias || [];
  const autotransporte = formManager.formData.autotransporte;
  const figuras = formManager.formData.figuras || [];

  // Mock additional properties that are expected but don't exist yet
  const [xmlGenerado, setXmlGenerado] = useState<string>('');
  const [datosCalculoRuta, setDatosCalculoRuta] = useState<any>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [borradorData, setBorradorData] = useState<any>(null);

  const handleConfiguracionChange = useCallback((updates: any) => {
    formManager.updateFormData(updates);
  }, [formManager]);

  const setUbicaciones = useCallback((ubicaciones: UbicacionCompleta[]) => {
    formManager.updateFormData({ ubicaciones });
  }, [formManager]);

  const setMercancias = useCallback((mercancias: MercanciaCompleta[]) => {
    formManager.updateFormData({ mercancias });
  }, [formManager]);

  const setAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    formManager.updateFormData({ autotransporte });
  }, [formManager]);

  const setFiguras = useCallback((figuras: FiguraCompleta[]) => {
    formManager.updateFormData({ figuras });
  }, [formManager]);

  const handleXMLGenerated = useCallback((xml: string) => {
    setXmlGenerado(xml);
  }, []);

  const handleCalculoRutaUpdate = useCallback((datos: any) => {
    setDatosCalculoRuta(datos);
  }, []);

  return {
    // Form sections
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    
    // Form state
    currentStep: formManager.currentStep,
    currentCartaPorteId: cartaPorteId,
    borradorCargado: false,
    ultimoGuardado: null,
    validationSummary: null,
    isGuardando: false,
    xmlGenerado,
    datosCalculoRuta,
    
    // Recovery dialog
    showRecoveryDialog,
    borradorData,
    handleAcceptBorrador: () => setShowRecoveryDialog(false),
    handleRejectBorrador: () => setShowRecoveryDialog(false),
    
    // Update functions
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep: formManager.setCurrentStep,
    handleConfiguracionChange,
    
    // Action handlers - mock for now
    handleGuardarBorrador: async () => {},
    handleGuardarCartaPorteOficial: async () => {},
    handleGuardarYSalir: async () => {},
    handleLimpiarBorrador: async () => {},
    handleXMLGenerated,
    handleCalculoRutaUpdate,
  };
};
