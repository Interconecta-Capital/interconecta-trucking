
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays, parseISO } from 'date-fns';

interface TrialInfo {
  daysUsed: number;
  daysRemaining: number;
  totalTrialDays: number;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  isTrialExpired: boolean;
  isTrialActive: boolean;
}

export const useTrialTracking = () => {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    daysUsed: 0,
    daysRemaining: 14,
    totalTrialDays: 14,
    trialStartDate: null,
    trialEndDate: null,
    isTrialExpired: false,
    isTrialActive: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTrialInfo = async () => {
      try {
        // Usar .maybeSingle() en lugar de .single() para evitar errores cuando no hay datos
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('created_at, trial_end_date, plan_type')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching trial info:', error);
          setLoading(false);
          return;
        }

        // Si no hay perfil, usar valores por defecto sin errores
        if (!profile) {
          console.log('[TrialTracking] No profile found, using defaults');
          setLoading(false);
          return;
        }

        const now = new Date();
        const createdAt = profile.created_at ? parseISO(profile.created_at) : new Date();
        
        // Usar trial_end_date si existe, sino calcular basado en created_at
        let trialEndDate: Date;
        if (profile.trial_end_date) {
          trialEndDate = parseISO(profile.trial_end_date);
        } else {
          trialEndDate = new Date(createdAt);
          trialEndDate.setDate(trialEndDate.getDate() + 14);
        }

        const daysUsed = Math.max(0, differenceInDays(now, createdAt));
        const daysRemaining = Math.max(0, differenceInDays(trialEndDate, now));
        const isTrialExpired = now > trialEndDate;
        const isTrialActive = !isTrialExpired && (!profile.plan_type || profile.plan_type === 'trial');

        setTrialInfo({
          daysUsed,
          daysRemaining,
          totalTrialDays: 14,
          trialStartDate: createdAt,
          trialEndDate,
          isTrialExpired,
          isTrialActive
        });

        // Solo actualizar trial_end_date si no existe y no causar recargas
        if (!profile.trial_end_date) {
          supabase
            .from('profiles')
            .update({ trial_end_date: trialEndDate.toISOString() })
            .eq('id', user.id)
            .then(() => {
              console.log('[TrialTracking] Updated trial_end_date');
            })
            .catch(err => {
              console.error('[TrialTracking] Error updating trial_end_date:', err);
            });
        }

      } catch (error) {
        console.error('Error calculating trial info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();

    // Reducir drasticamente la frecuencia de actualización de 1 minuto a 10 minutos
    // para evitar recargas constantes
    const interval = setInterval(fetchTrialInfo, 10 * 60 * 1000); // 10 minutos

    return () => clearInterval(interval);
  }, [user?.id]); // Solo depender del user.id, no del objeto completo

  const refreshTrialInfo = () => {
    // Función para refrescar manualmente sin causar recargas automáticas
    setLoading(true);
  };

  return {
    trialInfo,
    loading,
    refreshTrialInfo
  };
};
