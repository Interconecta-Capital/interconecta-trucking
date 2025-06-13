import { useState, useEffect } from 'react';
import { useSimpleAuth } from '@/hooks/useSimpleAuth';
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
  const { user } = useSimpleAuth();
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
        // Obtener información del perfil del usuario
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('created_at, trial_end_date, plan_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching trial info:', error);
          setLoading(false);
          return;
        }

        if (!profile) {
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

        // Actualizar trial_end_date si no existe
        if (!profile.trial_end_date) {
          await supabase
            .from('profiles')
            .update({ trial_end_date: trialEndDate.toISOString() })
            .eq('id', user.id);
        }

      } catch (error) {
        console.error('Error calculating trial info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();

    // Actualizar cada minuto para mantener la información en tiempo real
    const interval = setInterval(fetchTrialInfo, 60000);

    return () => clearInterval(interval);
  }, [user]);

  const refreshTrialInfo = () => {
    setLoading(true);
    // El useEffect se encargará de refrescar cuando loading cambie
  };

  return {
    trialInfo,
    loading,
    refreshTrialInfo
  };
};
