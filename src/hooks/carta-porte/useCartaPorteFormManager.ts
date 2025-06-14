
import { useState, useEffect, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';

interface UseCartaPorteFormManagerResult {
  configuracion: CartaPorteData;
  ubicaciones: any[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  currentStep: number;
  currentCartaPorteId: string | null;
  borradorCargado: boolean;
  ultimoGuardado: string | null;
  
  setUbicaciones: (ubicaciones: any[]) => void;
  setMercancias: (mercancias: MercanciaCompleta[]) => void;
  setAutotransporte: (autotransporte: AutotransporteCompleto) => void;
  setFiguras: (figuras: FiguraCompleta[]) => void;
  setCurrentStep: (step: number) => void;
  setXmlGenerated: (xml: string) => void;
  setTimbradoData: (data: any) => void;
  
  handleConfiguracionChange: (data: Partial<CartaPorteData>) => void;
  handleGuardarBorrador: () => void;
  handleLimpiarBorrador: () => void;
}

export function useCartaPorteFormManager(): UseCartaPorteFormManagerResult {
  const defaultConfig: CartaPorteData = {
    tipoRelacion: '04',
    version: '4.0',
    transporteInternacional: 'No',
    entradaSalidaMerc: 'Salida',
    viaTransporte: '01',
    totalDistRec: 0,
    tipoCreacion: 'manual',
    cartaPorteVersion: '3.1',
    tipoCfdi: 'T',
    rfcEmisor: '',
    nombreEmisor: '',
    rfcReceptor: '',
    nombreReceptor: '',
    registroIstmo: false,
    mercancias: [],
    ubicaciones: [],
    autotransporte: {
      placa_vm: '',
      anio_modelo_vm: 0,
      config_vehicular: '',
      perm_sct: '',
      num_permiso_sct: '',
      asegura_resp_civil: '',
      poliza_resp_civil: '',
      remolques: []
    },
    figuras: []
  };

  const [configuracion, setConfiguracion] = useState<CartaPorteData>(defaultConfig);
  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [mercancias, setMercancias] = useState<MercanciaCompleta[]>([]);
  const [autotransporte, setAutotransporte] = useState<AutotransporteCompleto>(defaultConfig.autotransporte!);
  const [figuras, setFiguras] = useState<FiguraCompleta[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(null);
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<string | null>(null);

  useEffect(() => {
    const borrador = BorradorService.cargarUltimoBorrador();
    if (borrador && borrador.datosFormulario) {
      setConfiguracion(prev => ({ ...prev, ...borrador.datosFormulario }));
      setBorradorCargado(true);
      setUltimoGuardado(borrador.ultimaModificacion);
    }
  }, []);

  useEffect(() => {
    const getAllData = () => ({
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      currentStep
    });

    const handleAutoSave = () => {
      setUltimoGuardado(new Date().toISOString());
    };

    BorradorService.iniciarGuardadoAutomatico(
      handleAutoSave,
      getAllData,
      30000
    );

    return () => {
      BorradorService.detenerGuardadoAutomatico();
    };
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  const handleConfiguracionChange = useCallback((data: Partial<CartaPorteData>) => {
    setConfiguracion(prev => ({ ...prev, ...data }));
  }, []);

  const handleGuardarBorrador = useCallback(() => {
    const datosCompletos = {
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      currentStep
    };
    BorradorService.guardarBorradorAutomatico(datosCompletos);
    setUltimoGuardado(new Date().toISOString());
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  const handleLimpiarBorrador = useCallback(() => {
    BorradorService.limpiarBorrador();
    setConfiguracion(defaultConfig);
    setUbicaciones([]);
    setMercancias([]);
    setAutotransporte(defaultConfig.autotransporte!);
    setFiguras([]);
    setCurrentStep(0);
    setBorradorCargado(false);
    setUltimoGuardado(null);
  }, []);

  const setXmlGenerated = useCallback((xml: string) => {
    console.log('XML generated:', xml);
  }, []);

  const setTimbradoData = useCallback((data: any) => {
    console.log('Timbrado data:', data);
  }, []);

  return {
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    currentStep,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    setXmlGenerated,
    setTimbradoData,
    
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
  };
}
