
import { useSuscripcion } from '../useSuscripcion';
import { useSuperuser } from '../useSuperuser';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useStableAuth } from '../useStableAuth';

type ResourceType = 'cartas_porte' | 'conductores' | 'vehiculos' | 'socios';

export const useResourceLimits = () => {
  const { user } = useStableAuth();
  const { suscripcion } = useSuscripcion();
  const { isSuperuser } = useSuperuser();

  // Obtener uso actual de recursos
  const { data: usoActual = {} } = useQuery({
    queryKey: ['resource-usage', user?.id],
    queryFn: async () => {
      if (!user?.id) return {};

      const [cartasResult, conductoresResult, vehiculosResult, sociosResult] = await Promise.all([
        supabase.from('cartas_porte').select('id', { count: 'exact', head: true }).eq('usuario_id', user.id),
        supabase.from('conductores').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('vehiculos').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('socios').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
      ]);

      return {
        cartas_porte: cartasResult.count || 0,
        conductores: conductoresResult.count || 0,
        vehiculos: vehiculosResult.count || 0,
        socios: sociosResult.count || 0
      };
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000 // 30 segundos
  });

  const obtenerLimites = () => {
    if (isSuperuser) {
      return {
        cartas_porte: null,
        conductores: null,
        vehiculos: null,
        socios: null
      };
    }

    const plan = suscripcion?.plan;
    return {
      cartas_porte: plan?.limite_cartas_porte || 5,
      conductores: plan?.limite_conductores || 2,
      vehiculos: plan?.limite_vehiculos || 2,
      socios: plan?.limite_socios || 5
    };
  };

  const puedeCrear = (tipo: ResourceType): boolean => {
    if (isSuperuser) return true;

    const limites = obtenerLimites();
    const uso = usoActual[tipo] || 0;
    const limite = limites[tipo];

    // Sin límite (null) significa ilimitado
    if (limite === null) return true;

    return uso < limite;
  };

  const obtenerUsoActual = (tipo?: ResourceType) => {
    if (tipo) {
      return usoActual[tipo] || 0;
    }
    return usoActual;
  };

  return {
    puedeCrear,
    obtenerLimites,
    obtenerUsoActual,
    limites: obtenerLimites(),
    uso: usoActual
  };
};
