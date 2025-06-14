import { useState, useEffect, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { BorradorServiceExtendido } from '@/services/borradorServiceExtendido';

interface UseCartaPorteFormManagerResult {
  configuracion: CartaPorteData;
  ubicaciones: any[];
  mercancias: MercanciaCompleta[];
  autotransporte: AutotransporteCompleto;
  figuras: FiguraCompleta[];
  currentStep: number;
  currentCartaPorteId: string | null;
  borradorCargado: boolean;
  ultimoGuardado: Date | null;
  
  setUbicaciones: (ubicaciones: any[]) => void;
  setMercancias: (mercancias: MercanciaCompleta[]) => void;
  setAutotransporte: (autotransporte: AutotransporteCompleto) => void;
  setFiguras: (figuras: FiguraCompleta[]) => void;
  setCurrentStep: (step: number) => void;
  setXmlGenerated: (xml: string) => void;
  setTimbradoData: (data: any) => void;
  setCurrentCartaPorteId: (id: string | null) => void;
  
  handleConfiguracionChange: (data: Partial<CartaPorteData>) => void;
  handleGuardarBorrador: () => void;
  handleLimpiarBorrador: () => void;
}

export function useCartaPorteFormManager(cartaPorteId?: string): UseCartaPorteFormManagerResult {
  const defaultConfig: CartaPorteData = {
    tipoRelacion: '04',
    version: '4.0',
    transporteInternacional: 'No',
    entradaSalidaMerc: 'Salida',
    viaTransporte: '01',
    totalDistRec: 0,
    tipoCreacion: 'manual',
    cartaPorteVersion: '3.1',
    tipoCfdi: 'Traslado',
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
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);

  // Effect to load draft from Supabase if cartaPorteId is provided
  useEffect(() => {
    const loadBorrador = async () => {
      if (cartaPorteId) {
        console.log('Loading draft from Supabase:', cartaPorteId);
        try {
          const borradorData = await BorradorServiceExtendido.cargarBorradorSupabase(cartaPorteId);
          if (borradorData) {
            console.log('Draft loaded from Supabase:', borradorData);
            setConfiguracion(prev => ({ ...prev, ...borradorData }));
            setCurrentCartaPorteId(cartaPorteId);
            setBorradorCargado(true);
            setUltimoGuardado(new Date());
            
            // Load related data if present
            if (borradorData.ubicaciones) {
              setUbicaciones(borradorData.ubicaciones);
            }
            if (borradorData.mercancias) {
              setMercancias(borradorData.mercancias);
            }
            if (borradorData.autotransporte) {
              setAutotransporte(borradorData.autotransporte);
            }
            if (borradorData.figuras) {
              setFiguras(borradorData.figuras);
            }
          }
        } catch (error) {
          console.error('Error loading draft from Supabase:', error);
          // Fallback to localStorage
          const localBorrador = BorradorService.cargarUltimoBorrador();
          if (localBorrador && localBorrador.datosFormulario) {
            setConfiguracion(prev => ({ ...prev, ...localBorrador.datosFormulario }));
            setBorradorCargado(true);
            if (localBorrador.ultimaModificacion) {
              const fecha = typeof localBorrador.ultimaModificacion === 'string' 
                ? new Date(localBorrador.ultimaModificacion)
                : localBorrador.ultimaModificacion;
              setUltimoGuardado(fecha);
            }
          }
        }
      } else {
        // Load from localStorage if no cartaPorteId provided
        const borrador = BorradorService.cargarUltimoBorrador();
        if (borrador && borrador.datosFormulario) {
          setConfiguracion(prev => ({ ...prev, ...borrador.datosFormulario }));
          setBorradorCargado(true);
          if (borrador.ultimaModificacion) {
            const fecha = typeof borrador.ultimaModificacion === 'string' 
              ? new Date(borrador.ultimaModificacion)
              : borrador.ultimaModificacion;
            setUltimoGuardado(fecha);
          }
        }
      }
    };

    loadBorrador();
  }, [cartaPorteId]);

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
      setUltimoGuardado(new Date());
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
    setUltimoGuardado(new Date());
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  // Updated handleLimpiarBorrador to handle Supabase drafts
  const handleLimpiarBorrador = useCallback(async () => {
    try {
      // Clear from both Supabase and localStorage
      if (currentCartaPorteId) {
        await BorradorServiceExtendido.limpiarBorrador(currentCartaPorteId);
      } else {
        BorradorService.limpiarBorrador();
      }
      
      setConfiguracion(defaultConfig);
      setUbicaciones([]);
      setMercancias([]);
      setAutotransporte(defaultConfig.autotransporte!);
      setFiguras([]);
      setCurrentStep(0);
      setBorradorCargado(false);
      setUltimoGuardado(null);
      setCurrentCartaPorteId(null);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  }, [currentCartaPorteId]);

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
    setCurrentCartaPorteId,
    
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
  };
}
