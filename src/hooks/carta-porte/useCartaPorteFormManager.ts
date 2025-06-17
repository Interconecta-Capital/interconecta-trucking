
import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useCartaPorteValidation } from './useCartaPorteValidation';
import { toast } from 'sonner';
import { useCartaPorteAutoSave } from './useCartaPorteAutoSave';
import { useBorradorRecovery } from './useBorradorRecovery';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

// Extender CartaPorteData para incluir currentStep
interface CartaPorteDataWithStep extends CartaPorteData {
  currentStep?: number;
}

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
  const { user } = useAuth();
  const [formData, setFormData] = useState<CartaPorteData>(initialCartaPorteData);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentCartaPorteId, setCurrentCartaPorteId] = useState<string | null>(cartaPorteId || null);
  const [borradorCargado, setBorradorCargado] = useState(false);
  const [ultimoGuardado, setUltimoGuardado] = useState<Date | null>(null);
  const [isGuardando, setIsGuardando] = useState(false);
  
  const { getValidationSummary } = useCartaPorteValidation();

  // Auto-save mejorado
  const { isAutoSaving, lastSaved } = useCartaPorteAutoSave({
    formData,
    currentCartaPorteId: currentCartaPorteId || undefined,
    onCartaPorteIdChange: (id) => setCurrentCartaPorteId(id),
    enabled: true
  });

  // Recuperación de borrador
  const { showRecoveryDialog, borradorData, acceptBorrador, rejectBorrador } = useBorradorRecovery(cartaPorteId);

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

  // Manejar aceptación de borrador
  const handleAcceptBorrador = useCallback(() => {
    const { data, id } = acceptBorrador();
    if (data) {
      setFormData(data);
      setCurrentCartaPorteId(id);
      setBorradorCargado(true);
      if ((data as CartaPorteDataWithStep).currentStep !== undefined) {
        setCurrentStep((data as CartaPorteDataWithStep).currentStep!);
      }
    }
  }, [acceptBorrador]);

  // Manejar rechazo de borrador
  const handleRejectBorrador = useCallback(() => {
    rejectBorrador();
    setFormData(initialCartaPorteData);
    setCurrentStep(0);
    setCurrentCartaPorteId(null);
    setBorradorCargado(false);
  }, [rejectBorrador]);
  
  // Guardar como carta porte oficial (no borrador)
  const handleGuardarCartaPorteOficial = useCallback(async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      // Generar folio único
      const folio = `CP-${Date.now().toString().slice(-8)}`;
      
      // Preparar datos para la carta porte oficial - convertir a JSON compatible
      const cartaPorteData = {
        folio,
        tipo_cfdi: formData.tipoCfdi || 'Traslado',
        rfc_emisor: formData.rfcEmisor || '',
        nombre_emisor: formData.nombreEmisor || '',
        rfc_receptor: formData.rfcReceptor || '',
        nombre_receptor: formData.nombreReceptor || '',
        transporte_internacional: (formData.transporteInternacional === 'Sí' || formData.transporteInternacional === true) ? true : false,
        registro_istmo: formData.registroIstmo || false,
        status: 'borrador', // Inicia como borrador hasta que se genere XML
        datos_formulario: JSON.parse(JSON.stringify(formData)), // Asegurar compatibilidad con JSON
        usuario_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      let savedId = currentCartaPorteId;

      if (currentCartaPorteId) {
        // Actualizar carta porte existente
        const { error } = await supabase
          .from('cartas_porte')
          .update({
            ...cartaPorteData,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentCartaPorteId);

        if (error) throw error;
      } else {
        // Crear nueva carta porte
        const { data: nuevaCarta, error } = await supabase
          .from('cartas_porte')
          .insert(cartaPorteData)
          .select()
          .single();

        if (error) throw error;
        if (nuevaCarta) {
          savedId = nuevaCarta.id;
          setCurrentCartaPorteId(nuevaCarta.id);
        }
      }
      
      setUltimoGuardado(new Date());
      toast.success('Carta porte guardada correctamente');
      
      return savedId;
    } catch (error) {
      console.error('Error guardando carta porte:', error);
      toast.error('Error al guardar la carta porte');
      throw error;
    } finally {
      setIsGuardando(false);
    }
  }, [formData, currentCartaPorteId, user?.id, isGuardando]);

  // Lógica de borrador (mantenida para compatibilidad)
  const handleGuardarBorrador = useCallback(async () => {
    if (isGuardando) return;
    
    setIsGuardando(true);
    try {
      const datosCompletos: CartaPorteDataWithStep = {
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

  // Actualizar último guardado cuando hay auto-save
  useEffect(() => {
    if (lastSaved) {
      setUltimoGuardado(lastSaved);
    }
  }, [lastSaved]);

  return {
    // Estado unificado
    configuracion: formData,
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
    isGuardando: isGuardando || isAutoSaving,
    
    // Dialog de recuperación
    showRecoveryDialog,
    borradorData,
    handleAcceptBorrador,
    handleRejectBorrador,
    
    // Setters y Handlers estables
    setUbicaciones,
    setMercancias,
    setAutotransporte,
    setFiguras,
    setCurrentStep,
    handleConfiguracionChange,
    handleGuardarBorrador,
    handleGuardarCartaPorteOficial,
    handleLimpiarBorrador,
  };
}
