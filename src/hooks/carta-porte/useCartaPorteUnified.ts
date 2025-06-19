
import { useState, useCallback, useEffect } from 'react';
import { CartaPorteData, AutotransporteCompleto, FiguraCompleta, MercanciaCompleta, UbicacionCompleta } from '@/types/cartaPorte';
import { BorradorService } from '@/services/borradorService';
import { useToast } from '@/hooks/use-toast';

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

const getInitialData = (): CartaPorteData => ({
  version: '3.1',
  cartaPorteVersion: '3.1',
  tipoCreacion: 'manual',
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
  figuras: []
});

export const useCartaPorteUnified = (cartaPorteId?: string) => {
  const [data, setData] = useState<CartaPorteData>(getInitialData());
  const [currentStep, setCurrentStep] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Cargar datos si existe un ID
  useEffect(() => {
    if (cartaPorteId) {
      loadCartaPorte(cartaPorteId);
    }
  }, [cartaPorteId]);

  const loadCartaPorte = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const result = await BorradorService.cargarBorrador(id);
      if (result.success && result.data) {
        setData(result.data);
        setIsDirty(false);
      } else {
        setError(result.error || 'Error cargando borrador');
      }
    } catch (err) {
      setError('Error cargando datos');
      console.error('Error loading carta porte:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateField = useCallback((field: keyof CartaPorteData, value: any) => {
    console.log(`Updating field ${field}:`, value);
    setData(prev => {
      const newData = { ...prev, [field]: value };
      console.log('New data:', newData);
      return newData;
    });
    setIsDirty(true);
    setError(null);
  }, []);

  const updateAutotransporte = useCallback((autotransporte: AutotransporteCompleto) => {
    updateField('autotransporte', autotransporte);
  }, [updateField]);

  const updateUbicaciones = useCallback((ubicaciones: UbicacionCompleta[]) => {
    updateField('ubicaciones', ubicaciones);
  }, [updateField]);

  const updateMercancias = useCallback((mercancias: MercanciaCompleta[]) => {
    updateField('mercancias', mercancias);
  }, [updateField]);

  const updateFiguras = useCallback((figuras: FiguraCompleta[]) => {
    updateField('figuras', figuras);
  }, [updateField]);

  const saveData = useCallback(async () => {
    if (!isDirty) return;

    setIsLoading(true);
    try {
      const savedId = await BorradorService.guardarBorrador(data, cartaPorteId);
      if (savedId) {
        setIsDirty(false);
        toast({
          title: 'Guardado exitoso',
          description: 'Los datos se han guardado correctamente'
        });
        return savedId;
      } else {
        throw new Error('No se pudo guardar');
      }
    } catch (err) {
      setError('Error guardando datos');
      toast({
        title: 'Error al guardar',
        description: 'No se pudieron guardar los datos',
        variant: 'destructive'
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [data, cartaPorteId, isDirty, toast]);

  const resetForm = useCallback(() => {
    setData(getInitialData());
    setCurrentStep(0);
    setIsDirty(false);
    setError(null);
  }, []);

  const validateData = useCallback(() => {
    const errors: string[] = [];
    
    if (!data.rfcEmisor?.trim()) errors.push('RFC Emisor requerido');
    if (!data.rfcReceptor?.trim()) errors.push('RFC Receptor requerido');
    if (!data.ubicaciones || data.ubicaciones.length < 2) errors.push('Se requieren al menos 2 ubicaciones');
    if (!data.mercancias || data.mercancias.length === 0) errors.push('Se requiere al menos 1 mercancía');
    if (!data.autotransporte?.placa_vm) errors.push('Placa del vehículo requerida');
    if (!data.figuras || data.figuras.length === 0) errors.push('Se requiere al menos 1 figura de transporte');

    return {
      isValid: errors.length === 0,
      errors
    };
  }, [data]);

  const getCompletionPercentage = useCallback(() => {
    let completed = 0;
    const total = 6;

    if (data.rfcEmisor && data.rfcReceptor) completed++;
    if (data.ubicaciones && data.ubicaciones.length >= 2) completed++;
    if (data.mercancias && data.mercancias.length > 0) completed++;
    if (data.autotransporte?.placa_vm) completed++;
    if (data.figuras && data.figuras.length > 0) completed++;
    if (data.tipoCfdi && data.cartaPorteVersion) completed++;

    return Math.round((completed / total) * 100);
  }, [data]);

  return {
    // Estado
    data,
    currentStep,
    isDirty,
    isLoading,
    error,
    
    // Acciones principales
    updateField,
    updateAutotransporte,
    updateUbicaciones,
    updateMercancias,
    updateFiguras,
    setCurrentStep,
    
    // Operaciones
    saveData,
    resetForm,
    loadCartaPorte,
    
    // Utilidades
    validateData,
    getCompletionPercentage
  };
};
