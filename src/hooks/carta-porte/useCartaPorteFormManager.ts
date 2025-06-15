import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';

// Estado inicial unificado y por defecto
const initialCartaPorteData: CartaPorteData = {
  tipoCfdi: 'Traslado',
  transporteInternacional: 'No',
  version: '4.0',
  cartaPorteVersion: '3.1',
  rfcEmisor: '',
  nombreEmisor: '',
  rfcReceptor: '',
  nombreReceptor: '',
  ubicaciones: [],
  mercancias: [],
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
  figuras: [],
};

export function useCartaPorteFormManager(cartaPorteId?: string) {
  const [formData, setFormData] = useState<CartaPorteData>(initialCartaPorteData);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(cartaPorteId || null);
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // El resumen de validación ahora depende directamente del estado unificado
  const validationSummary = getValidationSummary(formData);

  // Handler de cambio unificado y estable
  const handleConfiguracionChange = useCallback((updates: Partial<CartaPorteData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Setters estables para cada sección del formulario
  const setUbicaciones = useCallback((ubicaciones: UbicacionCompleta[]) => {
    setFormData(prev => ({ ...prev, ubicaciones }));
  }, []);

  const setMercancias = useCallback((mercancias: MercanciaCompleta[]) => {
    setFormData(prev => ({ ...prev, mercancias }));
  }, []);
  
  const setAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    setFormData(prev => ({ ...prev, autotransporte }));
  }, []);

  const setFiguras = useCallback((figuras: FiguraCompleta[]) => {
    setFormData(prev => ({ ...prev, figuras }));
  }, []);
  
  // Lógica de borrador (mantenida pero simplificada)
  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      const datosCompletos = {
        ...formData,
        currentStep,
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
  }, [formData, currentStep, currentCartaPorteId, isGuardando]);

  const handleLimpiarBorrador = useCallback(async () => {
    try {
      await BorradorService.limpiarBorrador(currentCartaPorteId || undefined);
      
      setFormData(initialCartaPorteData);
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

  const cargarBorrador = useCallback(async (id: string) => {
    try {
      const borrador = await BorradorService.cargarBorrador(id);
      
      if (borrador && borrador.datosFormulario) {
        setFormData(borrador.datosFormulario);
        setCurrentStep(borrador.datosFormulario.currentStep || 0);
        setCurrentCartaPorteId(id);
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

  // Efecto para cargar el borrador una sola vez
  useEffect(() => {
    if (cartaPorteId) {
      cargarBorrador(cartaPorteId);
    }
  }, [cartaPorteId, cargarBorrador]);


  return {
    // Estado unificado
    configuracion: formData, // Ahora 'configuracion' es el formData completo
    ubicaciones: formData.ubicaciones,
    mercancias: formData.mercancias,
    autotransporte: formData.autotransporte,
    figuras: formData.figuras,
    
    // Estado de la UI
    currentStep,
    currentCartaPorteId,
    borradorCargado,
    ultimoGuardado,
    validationSummary,
    isGuardando,
    
    // Setters y Handlers estables
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    handleConfiguracionChange, // Handler unificado
    handleGuardarBorrador,
    handleLimpiarBorrador,
    cargarBorrador,
  };
}
