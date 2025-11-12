import { useMemo, useEffect } from 'react';
import { CartaPorteData } from '@/types/cartaPorte';

export interface ValidationSummary {
  sectionStatus: {
    configuracion: 'empty' | 'incomplete' | 'complete';
    ubicaciones: 'empty' | 'incomplete' | 'complete';
    mercancias: 'empty' | 'incomplete' | 'complete';
    autotransporte: 'empty' | 'incomplete' | 'complete';
    figuras: 'empty' | 'incomplete' | 'complete';
    xml: 'empty' | 'incomplete' | 'complete';
  };
  overallProgress: number;
  completionPercentage: number;
  missingFields: {
    configuracion: string[];
    ubicaciones: string[];
    mercancias: string[];
    autotransporte: string[];
    figuras: string[];
  };
  completedSections: number;
  totalSections: number;
}

export const useCartaPorteValidation = () => {
  const getValidationSummary = useMemo(() => {
    return (formData: CartaPorteData): ValidationSummary => {
      console.log('🔍 Validando datos del formulario:', {
        hasEmisor: !!formData.rfcEmisor,
        hasReceptor: !!formData.rfcReceptor,
        ubicacionesCount: formData.ubicaciones?.length || 0,
        mercanciasCount: formData.mercancias?.length || 0,
        hasAutotransporte: !!formData.autotransporte?.placa_vm,
        figurasCount: formData.figuras?.length || 0
      });

      const missingFields = {
        configuracion: [] as string[],
        ubicaciones: [] as string[],
        mercancias: [] as string[],
        autotransporte: [] as string[],
        figuras: [] as string[]
      };

      // Validar Configuración
      let configuracionStatus: 'empty' | 'incomplete' | 'complete' = 'empty';
      if (!formData.rfcEmisor) missingFields.configuracion.push('RFC del Emisor');
      if (!formData.nombreEmisor) missingFields.configuracion.push('Nombre del Emisor');
      if (!formData.rfcReceptor) missingFields.configuracion.push('RFC del Receptor');
      if (!formData.nombreReceptor) missingFields.configuracion.push('Nombre del Receptor');
      
      if (formData.rfcEmisor || formData.rfcReceptor) {
        configuracionStatus = missingFields.configuracion.length === 0 ? 'complete' : 'incomplete';
      }

      // Validar Ubicaciones
      let ubicacionesStatus: 'empty' | 'incomplete' | 'complete' = 'empty';
      const ubicaciones = formData.ubicaciones || [];
      
      if (ubicaciones.length === 0) {
        missingFields.ubicaciones.push('Agregar al menos una ubicación de origen');
        missingFields.ubicaciones.push('Agregar al menos una ubicación de destino');
      } else {
        const hasOrigen = ubicaciones.some(u => 
          u.tipo_ubicacion === 'Origen' || (u as any).tipoUbicacion === 'Origen'
        );
        const hasDestino = ubicaciones.some(u => 
          u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
        );
        
        if (!hasOrigen) missingFields.ubicaciones.push('Ubicación de Origen');
        if (!hasDestino) missingFields.ubicaciones.push('Ubicación de Destino');
        
        // Validar distancia recorrida
        const destino = ubicaciones.find(u => 
          u.tipo_ubicacion === 'Destino' || (u as any).tipoUbicacion === 'Destino'
        );
        
        // Buscar distancia en TODOS los formatos posibles
        const distancia = destino?.distancia_recorrida || 
                          (destino as any)?.distanciaRecorrida || 
                          (destino as any)?.distancia ||
                          formData.datosCalculoRuta?.distanciaTotal ||
                          0;
        
        console.log('🔍 [VALIDACION] === ANÁLISIS DE DISTANCIA ===');
        console.log('🔍 [VALIDACION] Destino completo:', JSON.stringify(destino, null, 2));
        console.log('🔍 [VALIDACION] distancia_recorrida:', destino?.distancia_recorrida);
        console.log('🔍 [VALIDACION] distanciaRecorrida:', (destino as any)?.distanciaRecorrida);
        console.log('🔍 [VALIDACION] datosCalculoRuta:', formData.datosCalculoRuta);
        console.log('🔍 [VALIDACION] Distancia final encontrada:', distancia);
        
        if (distancia === 0) {
          missingFields.ubicaciones.push('Calcular distancia haciendo clic en "Calcular Ruta con Google Maps"');
        }
        
      // Validar domicilios completos
      ubicaciones.forEach((ub, index) => {
        // ✅ FASE 1: Soportar AMBOS formatos (snake_case Y camelCase) con type assertion
        const domicilio = ub.domicilio as any;
        const codigoPostal = domicilio?.codigo_postal || domicilio?.codigoPostal;
        const calle = ub.domicilio?.calle;
        
        if (!codigoPostal) {
          missingFields.ubicaciones.push(`Código postal obligatorio en ubicación ${index + 1}`);
        }
        if (!calle) {
          missingFields.ubicaciones.push(`Calle en ubicación ${index + 1}`);
        }
        if (!ub.rfc_remitente_destinatario && ub.tipo_ubicacion !== 'Paso') {
          missingFields.ubicaciones.push(`RFC en ubicación ${index + 1}`);
        }
      });
        
        ubicacionesStatus = missingFields.ubicaciones.length === 0 ? 'complete' : 'incomplete';
      }

      // Validar Mercancías
      let mercanciasStatus: 'empty' | 'incomplete' | 'complete' = 'empty';
      const mercancias = formData.mercancias || [];
      
      if (mercancias.length === 0) {
        missingFields.mercancias.push('Agregar al menos una mercancía');
      } else {
        mercancias.forEach((merc, index) => {
          if (!merc.bienes_transp) {
            missingFields.mercancias.push(`Clave de producto en mercancía ${index + 1}`);
          }
          if (!merc.cantidad || merc.cantidad <= 0) {
            missingFields.mercancias.push(`Cantidad en mercancía ${index + 1}`);
          }
          if (!merc.peso_kg || merc.peso_kg <= 0) {
            missingFields.mercancias.push(`Peso en mercancía ${index + 1}`);
          }
        });
        
        mercanciasStatus = missingFields.mercancias.length === 0 ? 'complete' : 'incomplete';
      }

      // Validar Autotransporte
      let autotransporteStatus: 'empty' | 'incomplete' | 'complete' = 'empty';
      const auto = formData.autotransporte;
      
      if (!auto?.placa_vm) {
        missingFields.autotransporte.push('Placa del vehículo');
      }
      if (!auto?.config_vehicular) {
        missingFields.autotransporte.push('Configuración vehicular');
      }
      if (!auto?.perm_sct) {
        missingFields.autotransporte.push('Permiso SCT');
      }
      if (!auto?.num_permiso_sct) {
        missingFields.autotransporte.push('Número de permiso SCT');
      }
      if (!auto?.asegura_resp_civil) {
        missingFields.autotransporte.push('Aseguradora');
      }
      if (!auto?.poliza_resp_civil) {
        missingFields.autotransporte.push('Póliza de seguro');
      }
      
      if (auto?.placa_vm) {
        autotransporteStatus = missingFields.autotransporte.length === 0 ? 'complete' : 'incomplete';
      }

      // Validar Figuras
      let figurasStatus: 'empty' | 'incomplete' | 'complete' = 'empty';
      const figuras = formData.figuras || [];
      
      if (figuras.length === 0) {
        missingFields.figuras.push('Agregar al menos una figura de transporte');
      } else {
        figuras.forEach((figura, index) => {
          if (!figura.rfc_figura) {
            missingFields.figuras.push(`RFC en figura ${index + 1}`);
          }
          if (!figura.nombre_figura) {
            missingFields.figuras.push(`Nombre en figura ${index + 1}`);
          }
          if (!figura.tipo_figura) {
            missingFields.figuras.push(`Tipo de figura ${index + 1}`);
          }
        });
        
        figurasStatus = missingFields.figuras.length === 0 ? 'complete' : 'incomplete';
      }

      const sectionStatus = {
        configuracion: configuracionStatus,
        ubicaciones: ubicacionesStatus,
        mercancias: mercanciasStatus,
        autotransporte: autotransporteStatus,
        figuras: figurasStatus,
        xml: 'empty' as const
      };

      const completedSections = Object.values(sectionStatus).filter(status => status === 'complete').length;
      const totalSections = Object.keys(sectionStatus).length - 1; // Excluir XML del conteo
      const overallProgress = Math.round((completedSections / totalSections) * 100);
      const completionPercentage = overallProgress;

      console.log('📊 Resultado de validación:', {
        completedSections,
        totalSections,
        overallProgress,
        completionPercentage,
        sectionStatus,
        totalMissingFields: Object.values(missingFields).flat().length
      });

      return {
        sectionStatus,
        overallProgress,
        completionPercentage,
        missingFields,
        completedSections,
        totalSections
      };
    };
  }, []);

  // Add missing validateComplete method
  const validateComplete = useMemo(() => {
    return (formData: CartaPorteData) => {
      const summary = getValidationSummary(formData);
      return {
        isValid: summary.overallProgress === 100,
        completionPercentage: summary.completionPercentage,
        summary
      };
    };
  }, [getValidationSummary]);

  return { getValidationSummary, validateComplete };
};
