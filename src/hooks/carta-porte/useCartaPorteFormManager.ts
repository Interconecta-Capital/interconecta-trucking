
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AutotransporteCompleto, FiguraCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';

export interface CartaPorteData {
  tipoRelacion: string;
  version: string;
  transporteInternacional: string;
  entradaSalidaMerc: string;
  viaTransporte: string;
  totalDistRec: number;
  tipoCreacion?: 'plantilla' | 'carga' | 'manual';
  cartaPorteVersion?: string;
  tipoCfdi?: string;
  rfcEmisor?: string;
  nombreEmisor?: string;
  rfcReceptor?: string;
  nombreReceptor?: string;
  registroIstmo?: boolean;
  mercancias?: any[];
  ubicaciones?: any[];
  autotransporte?: AutotransporteCompleto;
  figuras?: FiguraCompleta[];
}

export function useCartaPorteFormManager() {
  const [configuracion, setConfiguracion] = useState<CartaPorteData>({
    tipoRelacion: '01',
    version: '3.0',
    transporteInternacional: 'No',
    entradaSalidaMerc: '',
    viaTransporte: '',
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
  });

  const [ubicaciones, setUbicaciones] = useState<any[]>([]);
  const [mercancias, setMercancias] = useState<any>(null);
  const [autotransporte, setAutotransporte] = useState<AutotransporteCompleto>({
    placa_vm: '',
    anio_modelo_vm: 2023,
    config_vehicular: '',
    perm_sct: '',
    num_permiso_sct: '',
    asegura_resp_civil: '',
    poliza_resp_civil: '',
    asegura_med_ambiente: '',
    poliza_med_ambiente: '',
    remolques: [],
  });
  const [figuras, setFiguras] = useState<FiguraCompleta[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [xmlGenerated, setXmlGenerated] = useState<string>('');
  const [timbradoData, setTimbradoData] = useState<any>(null);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | undefined>(undefined);
  
  const [datosFormulario, setDatosFormulario] = useState<any>({});
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);

  const { toast } = useToast();

  // Enhanced onChange handler for configuracion
  const handleConfiguracionChange = (data: Partial<CartaPorteData>) => {
    setConfiguracion(prev => ({ ...prev, ...data }));
  };

  // Cargar borrador al inicializar
  useEffect(() => {
    const borrador = BorradorService.cargarUltimoBorrador();
    if (borrador && !borradorCargado) {
      setDatosFormulario(borrador.datosFormulario);
      setBorradorCargado(true);
      toast({
        title: "Borrador cargado",
        description: `Se ha cargado un borrador guardado el ${new Date(borrador.ultimaModificacion).toLocaleString()}`,
      });
    }
  }, [borradorCargado, toast]);

  // Iniciar guardado automático
  useEffect(() => {
    const getDatos = () => ({
      configuracion: configuracion,
      ubicaciones: ubicaciones,
      mercancias: mercancias,
      autotransporte: autotransporte,
      figuras: figuras,
      currentStep: currentStep
    });

    const onSave = () => {
      setUltimoGuardado(new Date());
    };

    BorradorService.iniciarGuardadoAutomatico(onSave, getDatos);

    return () => {
      BorradorService.detenerGuardadoAutomatico();
    };
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  // Actualizar datos del formulario cuando cambien
  useEffect(() => {
    setDatosFormulario({
      configuracion,
      ubicaciones,
      mercancias,
      autotransporte,
      figuras,
      currentStep
    });
  }, [configuracion, ubicaciones, mercancias, autotransporte, figuras, currentStep]);

  const handleGuardarBorrador = async () => {
    await BorradorService.guardarBorradorAutomatico(datosFormulario);
    setUltimoGuardado(new Date());
    toast({
      title: "Borrador guardado",
      description: "El borrador ha sido guardado correctamente.",
    });
  };

  const handleLimpiarBorrador = () => {
    BorradorService.limpiarBorrador();
    toast({
      title: "Borrador eliminado",
      description: "El borrador ha sido eliminado.",
    });
  };

  return {
    // State
    configuracion,
    ubicaciones,
    mercancias,
    autotransporte,
    figuras,
    currentStep,
    xmlGenerated,
    timbradoData,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    
    // Setters
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    setXmlGenerated,
    setTimbradoData,
    setCurrentCartaPorteId,
    
    // Handlers
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleLimpiarBorrador,
  };
}
