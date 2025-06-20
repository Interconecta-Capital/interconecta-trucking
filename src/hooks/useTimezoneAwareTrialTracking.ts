
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface TrialInfo {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  daysUsed: number;
  totalTrialDays: number;
  timezone: string;
  trialStartDate?: Date;
  trialEndDate?: Date;
}

export const useTimezoneAwareTrialTracking = () => {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isTrialActive: false,
    isTrialExpired: false,
    daysRemaining: 0,
    daysUsed: 0,
    totalTrialDays: 14,
    timezone: 'America/Mexico_City'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadTrialInfo = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('timezone, trial_end_date, created_at')
          .eq('id', user.id)
          .single();

        const userTimezone = profile?.timezone || 'America/Mexico_City';
        const trialEndDate = profile?.trial_end_date ? new Date(profile.trial_end_date) : null;
        const trialStartDate = profile?.created_at ? new Date(profile.created_at) : null;

        const now = new Date();
        const totalTrialDays = 14;

        let isTrialActive = false;
        let isTrialExpired = false;
        let daysRemaining = 0;
        let daysUsed = 0;

        if (trialEndDate) {
          const diffTime = trialEndDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (daysRemaining > 0) {
            isTrialActive = true;
            daysUsed = totalTrialDays - daysRemaining;
          } else {
            isTrialExpired = true;
            daysUsed = totalTrialDays;
          }
        }

        setTrialInfo({
          isTrialActive,
          isTrialExpired,
          daysRemaining: Math.max(0, daysRemaining),
          daysUsed: Math.max(0, daysUsed),
          totalTrialDays,
          timezone: userTimezone,
          trialStartDate,
          trialEndDate
        });

      } catch (error) {
        console.error('Error loading trial info:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTrialInfo();
  }, [user?.id]);

  return { trialInfo, loading };
};
