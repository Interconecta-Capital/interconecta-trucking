
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface Plan {
  id: string;
  nombre: string;
  precio_mensual: number;
  limite_cartas_porte?: number;
  limite_vehiculos?: number;
  limite_conductores?: number;
  limite_socios?: number;
}

interface Suscripcion {
  id: string;
  status: string;
  plan?: Plan;
  fecha_fin_prueba?: string;
  fecha_vencimiento?: string;
}

export function useSuscripcion() {
  const { user } = useAuth();
  const [suscripcion, setSuscripcion] = useState<Suscripcion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadSuscripcion = async () => {
      try {
        const { data, error } = await supabase
          .from('suscripciones')
          .select(`
            id,
            status,
            fecha_fin_prueba,
            fecha_vencimiento,
            plan:planes_suscripcion(
              id,
              nombre,
              precio_mensual,
              limite_cartas_porte,
              limite_vehiculos,
              limite_conductores,
              limite_socios
            )
          `)
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.warn('[useSuscripcion] Error loading subscription:', error);
          // Create default trial subscription
          setSuscripcion({
            id: 'trial',
            status: 'trial',
            plan: {
              id: 'basic',
              nombre: 'Básico',
              precio_mensual: 0,
              limite_cartas_porte: 10,
              limite_vehiculos: 5,
              limite_conductores: 3,
              limite_socios: 2,
            }
          });
        } else if (data) {
          setSuscripcion(data);
        }
      } catch (error) {
        console.error('[useSuscripcion] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuscripcion();
  }, [user?.id]);

  const enPeriodoPrueba = () => {
    if (!suscripcion) return true;
    return suscripcion.status === 'trial';
  };

  return {
    suscripcion,
    loading,
    enPeriodoPrueba,
  };
}
