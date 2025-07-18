
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface PopulateDataOptions {
  createMissingCosts: boolean;
  generateSampleAnalytics: boolean;
  createRouteBaselines: boolean;
  populateEmptyFields: boolean;
}

export const useDataPopulation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const populateSystemData = useMutation({
    mutationFn: async (options: PopulateDataOptions) => {
      if (!user?.id) throw new Error('Usuario no autenticado');

      const results = {
        costosCreados: 0,
        analyticsGenerados: 0,
        rutasCreadas: 0,
        camposActualizados: 0
      };

      // 1. Crear costos para viajes que no tienen
      if (options.createMissingCosts) {
        console.log('🔧 Creando costos faltantes para viajes...');
        
        const { data: viajesSinCostos } = await supabase
          .from('viajes')
          .select('id, origen, destino, conductor_id, vehiculo_id, created_at')
          .eq('user_id', user.id)
          .not('id', 'in', `(SELECT viaje_id FROM costos_viaje WHERE user_id = '${user.id}')`);

        if (viajesSinCostos && viajesSinCostos.length > 0) {
          const costosToInsert = viajesSinCostos.map((viaje) => {
            const distanciaEstimada = Math.floor(Math.random() * 800) + 100; // 100-900 km
            const combustibleEstimado = distanciaEstimada * 2.8;
            const peajesEstimados = distanciaEstimada * 0.8;
            const mantenimientoEstimado = distanciaEstimada * 0.5;
            const salarioConductorEstimado = Math.max(800, distanciaEstimada * 2);
            const otrosCostosEstimados = distanciaEstimada * 0.3;
            const costoTotalEstimado = combustibleEstimado + peajesEstimados + mantenimientoEstimado + salarioConductorEstimado + otrosCostosEstimados;
            const precioCotizado = costoTotalEstimado * 1.25; // 25% margen
            const margenEstimado = precioCotizado - costoTotalEstimado;

            return {
              user_id: user.id,
              viaje_id: viaje.id,
              combustible_estimado: combustibleEstimado,
              peajes_estimados: peajesEstimados,
              mantenimiento_estimado: mantenimientoEstimado,
              salario_conductor_estimado: salarioConductorEstimado,
              otros_costos_estimados: otrosCostosEstimados,
              costo_total_estimado: costoTotalEstimado,
              precio_cotizado: precioCotizado,
              margen_estimado: margenEstimado,
              // Algunos con costos reales (viajes completados)
              combustible_real: Math.random() > 0.5 ? combustibleEstimado * (0.9 + Math.random() * 0.2) : null,
              precio_final_cobrado: Math.random() > 0.3 ? precioCotizado * (0.95 + Math.random() * 0.1) : null
            };
          });

          const { data: costosCreados, error } = await supabase
            .from('costos_viaje')
            .insert(costosToInsert)
            .select();

          if (error) throw error;
          results.costosCreados = costosCreados?.length || 0;
          
          // Calcular márgenes reales para los que tienen precio final
          for (const costo of costosCreados || []) {
            if (costo.precio_final_cobrado && costo.combustible_real) {
              const costoTotalReal = costo.combustible_real + (costo.peajes_estimados || 0) + (costo.mantenimiento_estimado || 0) + (costo.salario_conductor_estimado || 0) + (costo.otros_costos_estimados || 0);
              const margenReal = costo.precio_final_cobrado - costoTotalReal;
              
              await supabase
                .from('costos_viaje')
                .update({
                  costo_total_real: costoTotalReal,
                  margen_real: margenReal
                })
                .eq('id', costo.id);
            }
          }
        }
      }

      // 2. Generar análisis de viajes
      if (options.generateSampleAnalytics) {
        console.log('📊 Generando analytics de viajes...');
        
        const { data: viajesCompletos } = await supabase
          .from('viajes')
          .select(`
            id, origen, destino, created_at, vehiculo_id,
            costos_viaje (precio_final_cobrado, margen_real, costo_total_real)
          `)
          .eq('user_id', user.id)
          .eq('estado', 'completado');

        if (viajesCompletos && viajesCompletos.length > 0) {
          const analyticsToInsert = viajesCompletos
            .filter(viaje => viaje.costos_viaje && viaje.costos_viaje.length > 0)
            .map((viaje) => {
              const costos = viaje.costos_viaje[0] as any;
              const rutaHash = `${viaje.origen?.toLowerCase().replace(/\s+/g, '-')}-${viaje.destino?.toLowerCase().replace(/\s+/g, '-')}`;
              
              return {
                user_id: user.id,
                viaje_id: viaje.id,
                ruta_hash: rutaHash,
                fecha_viaje: viaje.created_at.split('T')[0],
                precio_cobrado: costos.precio_final_cobrado,
                margen_real: costos.margen_real,
                costo_real: costos.costo_total_real,
                vehiculo_tipo: 'carga',
                costo_estimado: costos.costo_total_real ? costos.costo_total_real * 0.95 : null,
                tiempo_estimado: Math.floor(Math.random() * 8) + 4, // 4-12 horas
                tiempo_real: Math.floor(Math.random() * 8) + 4
              };
            });

          if (analyticsToInsert.length > 0) {
            const { data: analyticsCreados, error: analyticsError } = await supabase
              .from('analisis_viajes')
              .upsert(analyticsToInsert, { onConflict: 'viaje_id' })
              .select();

            if (analyticsError) throw analyticsError;
            results.analyticsGenerados = analyticsCreados?.length || 0;
          }
        }
      }

      // 3. Crear líneas base de rutas
      if (options.createRouteBaselines) {
        console.log('🛣️ Creando líneas base de rutas...');
        
        const { data: rutasComunes } = await supabase
          .from('analisis_viajes')
          .select('ruta_hash, precio_cobrado, margen_real')
          .eq('user_id', user.id);

        if (rutasComunes && rutasComunes.length > 0) {
          const rutasAgrupadas = rutasComunes.reduce((acc, ruta) => {
            if (!acc[ruta.ruta_hash]) {
              acc[ruta.ruta_hash] = {
                precios: [],
                margenes: []
              };
            }
            if (ruta.precio_cobrado) acc[ruta.ruta_hash].precios.push(ruta.precio_cobrado);
            if (ruta.margen_real) acc[ruta.ruta_hash].margenes.push(ruta.margen_real);
            return acc;
          }, {} as Record<string, { precios: number[], margenes: number[] }>);

          results.rutasCreadas = Object.keys(rutasAgrupadas).length;
        }
      }

      // 4. Actualizar campos vacíos
      if (options.populateEmptyFields) {
        console.log('🔄 Actualizando campos vacíos...');
        
        // Actualizar viajes sin estado
        const { data: viajesActualizados } = await supabase
          .from('viajes')
          .update({ estado: 'completado' })
          .eq('user_id', user.id)
          .is('estado', null)
          .select();

        results.camposActualizados += viajesActualizados?.length || 0;

        // Actualizar conductores sin estado
        const { data: conductoresActualizados } = await supabase
          .from('conductores')
          .update({ estado: 'disponible' })
          .eq('user_id', user.id)
          .is('estado', null)
          .select();

        results.camposActualizados += conductoresActualizados?.length || 0;
      }

      return results;
    },
    onSuccess: (results) => {
      console.log('✅ Datos poblados exitosamente:', results);
      toast.success('Datos del sistema actualizados', {
        description: `${results.costosCreados} costos, ${results.analyticsGenerados} análisis, ${results.rutasCreadas} rutas, ${results.camposActualizados} campos actualizados`
      });
      
      // Invalidar todas las queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['real-dashboard-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-counts'] });
      queryClient.invalidateQueries({ queryKey: ['costos_viaje'] });
      queryClient.invalidateQueries({ queryKey: ['analisis_viajes'] });
    },
    onError: (error) => {
      console.error('❌ Error poblando datos:', error);
      toast.error('Error al actualizar datos del sistema');
    }
  });

  const quickPopulate = () => {
    populateSystemData.mutate({
      createMissingCosts: true,
      generateSampleAnalytics: true,
      createRouteBaselines: true,
      populateEmptyFields: true
    });
  };

  return {
    populateSystemData,
    quickPopulate,
    isLoading: populateSystemData.isPending
  };
};
