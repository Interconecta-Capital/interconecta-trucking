
import { useState, useEffect } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
import { supabase } from '@/integrations/supabase/client';

interface TimezoneTrialInfo {
  daysUsed: number;
  daysRemaining: number;
  totalTrialDays: number;
  trialStartDate: Date | null;
  trialEndDate: Date | null;
  isTrialExpired: boolean;
  isTrialActive: boolean;
  timezone: string;
}

export const useTimezoneAwareTrialTracking = () => {
  const { user } = useUnifiedAuth();
  const [trialInfo, setTrialInfo] = useState<TimezoneTrialInfo>({
    daysUsed: 0,
    daysRemaining: 14,
    totalTrialDays: 14,
    trialStartDate: null,
    trialEndDate: null,
    isTrialExpired: false,
    isTrialActive: true,
    timezone: 'America/Mexico_City'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchTrialInfo = async () => {
      try {
        console.log('[TimezoneTrialTracking] Obteniendo información de trial para:', user.id);
        
        const { data, error } = await supabase.rpc('get_trial_status_with_timezone', {
          user_uuid: user.id
        });

        if (error) {
          console.error('[TimezoneTrialTracking] Error:', error);
          setLoading(false);
          return;
        }

        if (data?.error) {
          console.error('[TimezoneTrialTracking] Error en función:', data.error);
          setLoading(false);
          return;
        }

        console.log('[TimezoneTrialTracking] Datos recibidos:', data);

        setTrialInfo({
          daysUsed: data.days_used || 0,
          daysRemaining: data.days_remaining || 0,
          totalTrialDays: data.total_trial_days || 14,
          trialStartDate: data.trial_start_date ? new Date(data.trial_start_date) : null,
          trialEndDate: data.trial_end_date ? new Date(data.trial_end_date) : null,
          isTrialExpired: data.is_trial_expired || false,
          isTrialActive: data.is_trial_active || false,
          timezone: data.timezone || 'America/Mexico_City'
        });

      } catch (error) {
        console.error('[TimezoneTrialTracking] Error inesperado:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();
  }, [user?.id]);

  return {
    trialInfo,
    loading,
    refreshTrialInfo: () => {
      setLoading(true);
    }
  };
};
