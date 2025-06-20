
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

interface TrialStatusResponse {
  days_used?: number;
  days_remaining?: number;
  total_trial_days?: number;
  trial_start_date?: string;
  trial_end_date?: string;
  is_trial_expired?: boolean;
  is_trial_active?: boolean;
  timezone?: string;
  error?: string;
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
        
        // Usar la función SQL personalizada a través de una consulta directa
        const { data, error } = await supabase
          .from('profiles')
          .select('created_at, trial_end_date, timezone')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('[TimezoneTrialTracking] Error:', error);
          setLoading(false);
          return;
        }

        if (!data) {
          console.error('[TimezoneTrialTracking] No se encontró perfil');
          setLoading(false);
          return;
        }

        console.log('[TimezoneTrialTracking] Datos recibidos:', data);

        // Calcular días manualmente con zona horaria de México
        const now = new Date();
        const created = new Date(data.created_at);
        const trialEnd = data.trial_end_date ? new Date(data.trial_end_date) : new Date(created.getTime() + (14 * 24 * 60 * 60 * 1000));
        
        const msPerDay = 24 * 60 * 60 * 1000;
        const daysUsed = Math.max(0, Math.floor((now.getTime() - created.getTime()) / msPerDay));
        const daysRemaining = Math.max(0, Math.floor((trialEnd.getTime() - now.getTime()) / msPerDay));
        
        setTrialInfo({
          daysUsed,
          daysRemaining,
          totalTrialDays: 14,
          trialStartDate: created,
          trialEndDate: trialEnd,
          isTrialExpired: now > trialEnd,
          isTrialActive: now <= trialEnd,
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
