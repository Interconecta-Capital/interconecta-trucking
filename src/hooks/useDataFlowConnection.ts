import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CotizacionToViajeData {
  cotizacionId: string;
  fechaInicioProgramada: string;
  fechaFinProgramada: string;
  conductorId?: string;
  vehiculoId?: string;
  remolqueId?: string;
}

interface ViajeToCartaPorteData {
  viajeId: string;
  mercanciaData: any;
  ubicacionesData: any;
}

export const useDataFlowConnection = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Convertir cotización aprobada a viaje
  const convertirCotizacionAViaje = useMutation({
    mutationFn: async (data: CotizacionToViajeData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // 1. Obtener datos de la cotización
      const { data: cotizacion, error: cotizacionError } = await supabase
        .from('cotizaciones')
        .select('*')
        .eq('id', data.cotizacionId)
        .eq('user_id', user.id)
        .single();

      if (cotizacionError) throw cotizacionError;

      // 2. Crear el viaje basado en la cotización
      const { data: nuevoViaje, error: viajeError } = await supabase
        .from('viajes')
        .insert({
          user_id: user.id,
          origen: cotizacion.nombre_cotizacion?.split(' - ')[0] || 'Origen',
          destino: cotizacion.nombre_cotizacion?.split(' - ')[1] || 'Destino',
          estado: 'programado',
          fecha_inicio_programada: data.fechaInicioProgramada,
          fecha_fin_programada: data.fechaFinProgramada,
          conductor_id: data.conductorId,
          vehiculo_id: data.vehiculoId,
          remolque_id: data.remolqueId,
          observaciones: `Generado desde cotización ${cotizacion.folio_cotizacion}`,
          tracking_data: {
            cotizacion_origen_id: cotizacion.id,
            folio_cotizacion: cotizacion.folio_cotizacion,
            cliente: cotizacion.cliente_tipo === 'existente' 
              ? cotizacion.cliente_existente_id 
              : cotizacion.cliente_nuevo_datos,
            distancia_estimada: cotizacion.distancia_total,
            tiempo_estimado: cotizacion.tiempo_estimado
          }
        } as any)
        .select()
        .single();

      if (viajeError) throw viajeError;

      // 3. Crear registro de costos basado en la cotización
      const costosInternos = cotizacion.costos_internos as any || {};
      const { error: costosError } = await supabase
        .from('costos_viaje')
        .insert({
          user_id: user.id,
          viaje_id: nuevoViaje.id,
          precio_cotizado: cotizacion.precio_cotizado,
          costo_total_estimado: cotizacion.costo_total_interno,
          margen_estimado: cotizacion.margen_ganancia,
          combustible_estimado: costosInternos.combustible || 0,
          peajes_estimados: costosInternos.peajes || 0,
          casetas_estimadas: costosInternos.casetas || 0,
          mantenimiento_estimado: costosInternos.mantenimiento || 0,
          salario_conductor_estimado: costosInternos.conductor || 0,
          otros_costos_estimados: costosInternos.otros || 0,
          comprobantes_urls: []
        });

      if (costosError) throw costosError;

      // 4. Actualizar estado de la cotización
      const { error: updateError } = await supabase
        .from('cotizaciones')
        .update({ 
          estado: 'aprobada',
          fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', cotizacion.id);

      if (updateError) throw updateError;

      return { viaje: nuevoViaje, cotizacion };
    },
    onSuccess: (data) => {
      toast.success(`Viaje creado exitosamente desde cotización ${data.cotizacion.folio_cotizacion}`);
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['real-dashboard-metrics'] });
    },
    onError: (error) => {
      console.error('Error convirtiendo cotización a viaje:', error);
      toast.error('Error al crear viaje desde cotización');
    }
  });

  // Generar carta porte automáticamente al iniciar viaje
  const generarCartaPorteDesdeViaje = useMutation({
    mutationFn: async (data: ViajeToCartaPorteData) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      // 1. Obtener datos básicos del viaje
      const { data: viaje, error: viajeError } = await supabase
        .from('viajes')
        .select('*')
        .eq('id', data.viajeId)
        .eq('user_id', user.id)
        .single();

      if (viajeError) throw viajeError;

      // 2. Obtener datos relacionados por separado
      const [vehiculosData, conductoresData, costosData] = await Promise.all([
        viaje.vehiculo_id ? supabase.from('vehiculos').select('*').eq('id', viaje.vehiculo_id).single() : Promise.resolve({ data: null }),
        viaje.conductor_id ? supabase.from('conductores').select('*').eq('id', viaje.conductor_id).single() : Promise.resolve({ data: null }),
        supabase.from('costos_viaje').select('*').eq('viaje_id', viaje.id).single()
      ]);

      // 2. Crear carta porte con datos del viaje
      const trackingData = viaje.tracking_data as any || {};
      const vehiculo = vehiculosData.data;
      const conductor = conductoresData.data;
      
      const { data: cartaPorte, error: cartaError } = await supabase
        .from('cartas_porte')
        .insert({
          usuario_id: user.id,
          viaje_id: viaje.id,
          status: 'borrador',
          folio: `CP-${Date.now()}`,
          rfc_emisor: 'RFC_EMISOR',
          rfc_receptor: 'RFC_RECEPTOR',
          datos_formulario: {
            viaje: {
              origen: viaje.origen,
              destino: viaje.destino,
              fecha_inicio: viaje.fecha_inicio_programada,
              fecha_fin: viaje.fecha_fin_programada
            },
            autotransporte: vehiculo ? {
              placa_vm: vehiculo.placa,
              marca: vehiculo.marca,
              modelo: vehiculo.modelo,
              año: vehiculo.anio,
              config_vehicular: vehiculo.config_vehicular,
              peso_bruto_vehicular: vehiculo.peso_bruto_vehicular
            } : {},
            figuras: conductor ? [{
              tipo_figura: 'Operador',
              rfc: conductor.rfc,
              nombre: conductor.nombre,
              num_licencia: conductor.num_licencia,
              vigencia_licencia: conductor.vigencia_licencia
            }] : [],
            mercancias: data.mercanciaData || [],
            ubicaciones: data.ubicacionesData || [
              {
                tipo_ubicacion: 'Origen',
                descripcion: viaje.origen,
                fecha_salida_llegada: viaje.fecha_inicio_programada
              },
              {
                tipo_ubicacion: 'Destino',
                descripcion: viaje.destino,
                fecha_salida_llegada: viaje.fecha_fin_programada,
                distancia_recorrida: trackingData.distancia_estimada || 0
              }
            ]
          }
        })
        .select()
        .single();

      if (cartaError) throw cartaError;

      // 3. Actualizar viaje con referencia a carta porte
      const { error: updateError } = await supabase
        .from('viajes')
        .update({ carta_porte_id: cartaPorte.id })
        .eq('id', viaje.id);

      if (updateError) throw updateError;

      return { cartaPorte, viaje };
    },
    onSuccess: (data) => {
      toast.success(`Carta porte generada automáticamente para el viaje`);
      queryClient.invalidateQueries({ queryKey: ['cartas_porte'] });
      queryClient.invalidateQueries({ queryKey: ['viajes'] });
    },
    onError: (error) => {
      console.error('Error generando carta porte:', error);
      toast.error('Error al generar carta porte automáticamente');
    }
  });

  // Actualizar costos reales durante/después del viaje
  const actualizarCostosReales = useMutation({
    mutationFn: async (data: {
      viajeId: string;
      costosReales: {
        combustible?: number;
        peajes?: number;
        casetas?: number;
        mantenimiento?: number;
        otros?: number;
      };
      precioFinalCobrado?: number;
      comprobantesUrls?: string[];
    }) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const costoTotalReal = Object.values(data.costosReales).reduce((sum, cost) => sum + (cost || 0), 0);
      const margenReal = (data.precioFinalCobrado || 0) - costoTotalReal;

      const { error } = await supabase
        .from('costos_viaje')
        .update({
          combustible_real: data.costosReales.combustible,
          peajes_reales: data.costosReales.peajes,
          casetas_reales: data.costosReales.casetas,
          mantenimiento_real: data.costosReales.mantenimiento,
          otros_costos_reales: data.costosReales.otros,
          costo_total_real: costoTotalReal,
          precio_final_cobrado: data.precioFinalCobrado,
          margen_real: margenReal,
          comprobantes_urls: data.comprobantesUrls || [],
          updated_at: new Date().toISOString()
        })
        .eq('viaje_id', data.viajeId)
        .eq('user_id', user.id);

      if (error) throw error;

      // También actualizar en analisis_viajes para reportes
      const { data: viaje } = await supabase
        .from('viajes')
        .select('origen, destino, vehiculo_id')
        .eq('id', data.viajeId)
        .single();

      if (viaje) {
        const rutaHash = `${viaje.origen}-${viaje.destino}`.toLowerCase().replace(/\s+/g, '-');
        
        await supabase
          .from('analisis_viajes')
          .upsert({
            user_id: user.id,
            viaje_id: data.viajeId,
            ruta_hash: rutaHash,
            fecha_viaje: new Date().toISOString().split('T')[0],
            costo_real: costoTotalReal,
            precio_cobrado: data.precioFinalCobrado,
            margen_real: margenReal,
            vehiculo_tipo: 'carga'
          });
      }

      return { costoTotalReal, margenReal };
    },
    onSuccess: () => {
      toast.success('Costos reales actualizados correctamente');
      queryClient.invalidateQueries({ queryKey: ['costos_viaje'] });
      queryClient.invalidateQueries({ queryKey: ['real-dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['analisis_viajes'] });
    },
    onError: (error) => {
      console.error('Error actualizando costos reales:', error);
      toast.error('Error al actualizar costos reales');
    }
  });

  return {
    convertirCotizacionAViaje,
    generarCartaPorteDesdeViaje,
    actualizarCostosReales,
    isLoading: convertirCotizacionAViaje.isPending || 
               generarCartaPorteDesdeViaje.isPending || 
               actualizarCostosReales.isPending
  };
};
