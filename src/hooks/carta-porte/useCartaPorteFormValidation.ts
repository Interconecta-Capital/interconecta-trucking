
import { useMemo } from 'react';
import { useCartaPorteValidationEnhanced } from './useCartaPorteValidationEnhanced';
import { CartaPorteFormData } from './useCartaPorteMappers';
import { CartaPorteData } from '@/types/cartaPorte';
import { StepValidations } from './types/useCartaPorteFormTypes';

interface UseCartaPorteFormValidationOptions {
  formDataForValidation: CartaPorteFormData;
  enableAI?: boolean;
}

export const useCartaPorteFormValidation = ({ 
  formDataForValidation, 
  enableAI = true 
}: UseCartaPorteFormValidationOptions) => {
  // Transform formData to CartaPorteData for validation
  const transformedData = useMemo((): CartaPorteData => {
    return {
      ...formDataForValidation,
      mercancias: formDataForValidation.mercancias?.map(m => ({
        id: m.id,
        bienes_transp: m.claveProdServ || '',
        descripcion: m.descripcion,
        cantidad: m.cantidad,
        clave_unidad: m.unidadMedida,
        peso_kg: m.peso,
        valor_mercancia: m.valor,
        material_peligroso: false,
        moneda: 'MXN'
      })) || [],
      ubicaciones: formDataForValidation.ubicaciones?.map(u => ({
        id: u.id,
        tipo_ubicacion: u.tipo === 'origen' ? 'Origen' : 'Destino',
        id_ubicacion: u.id,
        domicilio: {
          pais: 'MEX',
          codigo_postal: u.codigoPostal,
          estado: u.estado,
          municipio: u.municipio,
          colonia: '',
          calle: u.direccion,
          numero_exterior: '',
        },
        coordenadas: u.coordenadas
      })) || [],
      autotransporte: formDataForValidation.autotransporte ? {
        placa_vm: formDataForValidation.autotransporte.placaVm,
        anio_modelo_vm: 2020,
        config_vehicular: formDataForValidation.autotransporte.configuracionVehicular,
        perm_sct: 'TPAF01',
        num_permiso_sct: '123456',
        asegura_resp_civil: formDataForValidation.autotransporte.seguro?.aseguradora || '',
        poliza_resp_civil: formDataForValidation.autotransporte.seguro?.poliza || '',
        remolques: formDataForValidation.autotransporte.remolques || []
      } : undefined
    };
  }, [formDataForValidation]);

  // Usar validaciones mejoradas con IA con datos transformados
  const validationResult = useCartaPorteValidationEnhanced({ 
    formData: transformedData,
    enableAI 
  });

  const { 
    stepValidations: rawStepValidations, 
    totalProgress,
    aiValidation,
    hasAIEnhancements,
    validationMode,
    overallScore,
    validateComplete
  } = validationResult;

  // Convertir las validaciones al formato correcto de forma estable
  const stepValidations: StepValidations = useMemo(() => ({
    configuracion: rawStepValidations?.configuracion || false,
    ubicaciones: rawStepValidations?.ubicaciones || false,
    mercancias: rawStepValidations?.mercancias || false,
    autotransporte: rawStepValidations?.autotransporte || false,
    figuras: rawStepValidations?.figuras || false,
  }), [rawStepValidations]);

  return {
    stepValidations,
    totalProgress: totalProgress || 0,
    aiValidation,
    hasAIEnhancements: hasAIEnhancements || false,
    validationMode: validationMode || 'standard',
    overallScore: overallScore || 0,
    validateComplete
  };
};
