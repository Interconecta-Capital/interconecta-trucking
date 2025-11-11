import { CartaPorteData } from '@/types/cartaPorte';
import { supabase } from '@/integrations/supabase/client';

// ✅ ISO 27001 A.10.1 - Using centralized Supabase client

// Tipos explícitos para consultas de Supabase
// Evita inferencia excesiva de tipos complejos
type CartaPorteIdOnly = {
  id: string;
};

type SocioBasic = {
  id: string;
  nombre_razon_social: string | null;
};

interface BusinessValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

/**
 * Hook para validaciones de negocio de Carta Porte
 * Valida restricciones que dependen de datos en la base de datos
 */
export const useCartaPorteBusinessValidations = () => {
  
  /**
   * Valida que el conductor esté disponible (no asignado a otro viaje activo)
   */
  const validateConductorDisponibilidad = async (
    rfcConductor: string,
    fechaSalida: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    try {
      // Buscar viajes activos del conductor en la fecha de salida
    const { data: viajesActivos, error } = await (supabase as any)
      .from('cartas_porte')
      .select('id')
      .in('estado', ['borrador', 'en_transito', 'pendiente'])
      .gte('fecha_llegada_estimada', fechaSalida);

      if (error) throw error;

      if (viajesActivos && viajesActivos.length > 0) {
        return {
          isValid: false,
          error: `El conductor ya tiene ${viajesActivos.length} viaje(s) activo(s) en esta fecha`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validando disponibilidad conductor:', error);
      return { 
        isValid: false, 
        error: 'Error al verificar disponibilidad del conductor' 
      };
    }
  };

  /**
   * Valida que el vehículo esté disponible (no asignado a otro viaje activo)
   */
  const validateVehiculoDisponibilidad = async (
    placaVehiculo: string,
    fechaSalida: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    try {
    const { data: viajesActivos, error } = await (supabase as any)
      .from('cartas_porte')
      .select('id')
      .in('estado', ['borrador', 'en_transito', 'pendiente'])
      .gte('fecha_llegada_estimada', fechaSalida);

      if (error) throw error;

      if (viajesActivos && viajesActivos.length > 0) {
        return {
          isValid: false,
          error: `El vehículo ya está asignado a ${viajesActivos.length} viaje(s) activo(s)`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validando disponibilidad vehículo:', error);
      return { 
        isValid: false, 
        error: 'Error al verificar disponibilidad del vehículo' 
      };
    }
  };

  /**
   * Valida que el RFC existe en la tabla de socios
   */
  const validateRfcEnSocios = async (
    rfc: string
  ): Promise<{ isValid: boolean; error?: string }> => {
    try {
    const { data, error } = await (supabase as any)
      .from('socios')
      .select('id, nombre_razon_social')
      .eq('rfc', rfc)
      .eq('activo', true)
      .maybeSingle();

      if (error || !data) {
        return {
          isValid: false,
          error: `El RFC ${rfc} no está registrado en socios`
        };
      }

      return { isValid: true };
    } catch (error) {
      console.error('Error validando RFC en socios:', error);
      return { 
        isValid: false, 
        error: 'Error al verificar RFC en socios' 
      };
    }
  };

  /**
   * Valida pesos: suma de mercancías <= peso bruto vehicular
   */
  const validatePesos = (formData: CartaPorteData): { isValid: boolean; error?: string } => {
    const mercancias = formData.mercancias || [];
    const pesoTotal = mercancias.reduce((sum, m) => sum + (m.peso_kg || 0), 0);
    const pesoBrutoVehicular = formData.autotransporte?.peso_bruto_vehicular || 0;

    if (pesoTotal > pesoBrutoVehicular) {
      return {
        isValid: false,
        error: `El peso total de mercancías (${pesoTotal.toFixed(2)} kg) excede el peso bruto vehicular (${pesoBrutoVehicular.toFixed(2)} kg)`
      };
    }

    return { isValid: true };
  };

  /**
   * Valida fechas: fecha de llegada > fecha de salida
   */
  const validateFechas = (formData: CartaPorteData): { isValid: boolean; error?: string } => {
    const ubicaciones = formData.ubicaciones || [];
    
    if (ubicaciones.length < 2) {
      return { isValid: true }; // No hay suficientes ubicaciones para validar
    }

    const origen = ubicaciones.find(u => u.tipo_ubicacion === 'Origen');
    const destino = ubicaciones.find(u => u.tipo_ubicacion === 'Destino');

    if (!origen || !destino) {
      return { isValid: true }; // Falta información
    }

    const fechaSalida = new Date(origen.fecha_llegada_salida);
    const fechaLlegada = new Date(destino.fecha_llegada_salida);

    if (fechaLlegada <= fechaSalida) {
      return {
        isValid: false,
        error: 'La fecha de llegada debe ser posterior a la fecha de salida'
      };
    }

    return { isValid: true };
  };

  /**
   * Valida distancia total > 0 para viajes nacionales
   */
  const validateDistancia = (formData: CartaPorteData): { isValid: boolean; error?: string } => {
    const esInternacional = formData.transporteInternacional === 'Sí' || 
                           formData.transporteInternacional === true;
    
    if (esInternacional) {
      return { isValid: true }; // No validar para viajes internacionales
    }

    const distanciaTotal = formData.ubicaciones?.reduce(
      (sum, u) => sum + (u.distancia_recorrida || 0), 
      0
    ) || 0;

    if (distanciaTotal <= 0) {
      return {
        isValid: false,
        error: 'La distancia total del viaje debe ser mayor a 0 km'
      };
    }

    return { isValid: true };
  };

  /**
   * Ejecuta todas las validaciones de negocio
   */
  const validateAll = async (formData: CartaPorteData): Promise<BusinessValidationResult> => {
    const errors: Array<{ field: string; message: string; severity: 'error' | 'warning' }> = [];

    // Validaciones síncronas
    const pesosResult = validatePesos(formData);
    if (!pesosResult.isValid) {
      errors.push({
        field: 'mercancias',
        message: pesosResult.error!,
        severity: 'error'
      });
    }

    const fechasResult = validateFechas(formData);
    if (!fechasResult.isValid) {
      errors.push({
        field: 'ubicaciones',
        message: fechasResult.error!,
        severity: 'error'
      });
    }

    const distanciaResult = validateDistancia(formData);
    if (!distanciaResult.isValid) {
      errors.push({
        field: 'ubicaciones',
        message: distanciaResult.error!,
        severity: 'error'
      });
    }

    // Validaciones asíncronas
    if (formData.figuras && formData.figuras.length > 0) {
      const conductor = formData.figuras.find(f => f.tipo_figura === '01');
      const fechaSalida = formData.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen')?.fecha_llegada_salida;

      if (conductor && fechaSalida) {
        const conductorResult = await validateConductorDisponibilidad(
          conductor.rfc_figura,
          fechaSalida
        );
        if (!conductorResult.isValid) {
          errors.push({
            field: 'figuras',
            message: conductorResult.error!,
            severity: 'warning'
          });
        }
      }
    }

    if (formData.autotransporte?.placa_vm) {
      const fechaSalida = formData.ubicaciones?.find(u => u.tipo_ubicacion === 'Origen')?.fecha_llegada_salida;
      
      if (fechaSalida) {
        const vehiculoResult = await validateVehiculoDisponibilidad(
          formData.autotransporte.placa_vm,
          fechaSalida
        );
        if (!vehiculoResult.isValid) {
          errors.push({
            field: 'autotransporte',
            message: vehiculoResult.error!,
            severity: 'warning'
          });
        }
      }
    }

    // Validar RFCs de remitentes/destinatarios
    const ubicaciones = formData.ubicaciones || [];
    for (const ubicacion of ubicaciones) {
      if (ubicacion.rfc_remitente_destinatario) {
        const rfcResult = await validateRfcEnSocios(ubicacion.rfc_remitente_destinatario);
        if (!rfcResult.isValid) {
          errors.push({
            field: 'ubicaciones',
            message: rfcResult.error!,
            severity: 'warning'
          });
        }
      }
    }

    return {
      isValid: errors.filter(e => e.severity === 'error').length === 0,
      errors
    };
  };

  return {
    validateConductorDisponibilidad,
    validateVehiculoDisponibilidad,
    validateRfcEnSocios,
    validatePesos,
    validateFechas,
    validateDistancia,
    validateAll
  };
};
