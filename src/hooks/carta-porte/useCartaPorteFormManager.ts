
import { useState, useEffect, useCallback } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';

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
  validationSummary: any;
  isGuardando: boolean;
  
  setUbicaciones: (ubicaciones: any[]) => void;
  setMercancias: (mercancias: MercanciaCompleta[]) => void;
  setAutotransporte: (autotransporte: AutotransporteCompleto) => void;
  setFiguras: (figuras: FiguraCompleta[]) => void;
  setCurrentStep: (step: number) => void;
  setXmlGenerated: (xml: string) => void;
  setTimbradoData: (data: any) => void;
  
  handleConfiguracionChange: (data: Partial<CartaPorteData>) => void;
  handleGuardarBorrador: () => Promise<void>;
  handleLimpiarBorrador: () => Promise<void>;
  cargarBorrador: (cartaPorteId: string) => Promise<void>;
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
      anio_modelo_vm: new Date().getFullYear(),
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
  const [isGuardando, setIsGuardando] = useState(false);

  const { getValidationSummary } = useCartaPorteValidation();

  // Obtener resumen de validación actualizado
  const validationSummary = getValidationSummary({
    ...configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras
  });

  // Cargar borrador inicial
  useEffect(() => {
    const cargarBorradorInicial = async () => {
      const borrador = BorradorService.cargarUltimoBorrador();
      if (borrador && borrador.datosFormulario) {
        const datos = borrador.datosFormulario;
        
        // Restaurar estado del formulario
        if (datos.configuracion) {
          setConfiguracion(prev => ({ ...prev, ...datos.configuracion }));
        } else {
          setConfiguracion(prev => ({ ...prev, ...datos }));
        }
        
        if (datos.ubicaciones) setUbicaciones(datos.ubicaciones);
        if (datos.mercancias) setMercancias(datos.mercancias);
        if (datos.autotransporte) setAutotransporte(datos.autotransporte);
        if (datos.figuras) setFiguras(datos.figuras);
        if (typeof datos.currentStep === 'number') setCurrentStep(datos.currentStep);
        if (borrador.cartaPorteId) setCurrentCartaPorteId(borrador.cartaPorteId);
        
        setBorradorCargado(true);
        
        if (borrador.ultimaModificacion) {
          const fecha = new Date(borrador.ultimaModificacion);
          setUltimoGuardado(fecha);
        }

        toast.success('Borrador cargado correctamente');
      }
    };

    cargarBorradorInicial();
  }, []);

  // Auto-guardado mejorado
  useEffect(() => {
    const getAllData = () => ({
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      currentStep
    });

    const handleAutoSave = (cartaPorteId?: string) => {
      setUltimoGuardado(new Date());
      if (cartaPorteId && cartaPorteId !== currentCartaPorteId) {
        setCurrentCartaPorteId(cartaPorteId);
      }
    };

    const getCartaPorteId = () => currentCartaPorteId || undefined;

    BorradorService.iniciarGuardadoAutomatico(
      handleAutoSave,
      getAllData,
      getCartaPorteId,
      45000 // 45 segundos
    );

    return () => {
      BorradorService.detenerGuardadoAutomatico();
    };
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep, currentCartaPorteId]);

  const handleConfiguracionChange = useCallback((data: Partial<CartaPorteData>) => {
    setConfiguracion(prev => ({ ...prev, ...data }));
  }, []);

  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      const datosCompletos = {
        configuracion,
        ubicaciones,
        mercancias,
        autotransporte,
        figuras,
        currentStep,
        // Incluir datos planos para compatibilidad
        ...configuracion
      };
      
      const nuevoId = await BorradorService.guardarBorrador(datosCompletos, currentCartaPorteId || undefined);
      
      if (nuevoId && nuevoId !== currentCartaPorteId) {
        setCurrentCartaPorteId(nuevoId);
      }
      
      setUltimoGuardado(new Date());
      toast.success('Borrador guardado correctamente');
    } catch (error) {
      console.error('Error guardando borrador:', error);
      toast.error('Error al guardar el borrador');
    } finally {
      setIsGuardando(false);
    }
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep, currentCartaPorteId, isGuardando]);

  const handleLimpiarBorrador = useCallback(async () => {
    try {
      await BorradorService.limpiarBorrador(currentCartaPorteId || undefined);
      
      // Resetear estado
      setConfiguracion(defaultConfig);
      setUbicaciones([]);
      setMercancias([]);
      setAutotransporte(defaultConfig.autotransporte!);
      setFiguras([]);
      setCurrentStep(0);
      setCurrentCartaPorteId(null);
      setBorradorCargado(false);
      setUltimoGuardado(null);
      
      toast.success('Borrador eliminado correctamente');
    } catch (error) {
      console.error('Error limpiando borrador:', error);
      toast.error('Error al eliminar el borrador');
    }
  }, [currentCartaPorteId]);

  const cargarBorrador = useCallback(async (cartaPorteId: string) => {
    try {
      const borrador = await BorradorService.cargarBorrador(cartaPorteId);
      
      if (borrador && borrador.datosFormulario) {
        const datos = borrador.datosFormulario;
        
        // Restaurar estado
        if (datos.configuracion) {
          setConfiguracion(prev => ({ ...prev, ...datos.configuracion }));
        } else {
          setConfiguracion(prev => ({ ...prev, ...datos }));
        }
        
        if (datos.ubicaciones) setUbicaciones(datos.ubicaciones);
        if (datos.mercancias) setMercancias(datos.mercancias);
        if (datos.autotransporte) setAutotransporte(datos.autotransporte);
        if (datos.figuras) setFiguras(datos.figuras);
        if (typeof datos.currentStep === 'number') setCurrentStep(datos.currentStep);
        
        setCurrentCartaPorteId(cartaPorteId);
        setBorradorCargado(true);
        
        if (borrador.ultimaModificacion) {
          setUltimoGuardado(new Date(borrador.ultimaModificacion));
        }
        
        toast.success('Borrador cargado correctamente');
      }
    } catch (error) {
      console.error('Error cargando borrador:', error);
      toast.error('Error al cargar el borrador');
    }
  }, []);

  const setXmlGenerated = useCallback((xml: string) => {
    console.log('XML generated:', xml);
    toast.success('XML generado correctamente');
  }, []);

  const setTimbradoData = useCallback((data: any) => {
    console.log('Timbrado data:', data);
    toast.success('Carta Porte timbrada correctamente');
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
    validationSummary,
    isGuardando,
    
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
    cargarBorrador,
  };
}
