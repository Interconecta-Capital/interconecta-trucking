
import { useState, useEffect, useRef } from 'react';
import { useUnifiedAuth } from './useUnifiedAuth';
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

export const useOptimizedTrialTracking = () => {
  const { user } = useUnifiedAuth();
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
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchTrialInfo = async () => {
      try {
        // Usar datos del perfil ya cargado si están disponibles
        const profile = user.profile;
        
        if (!profile) {
          console.log('[OptimizedTrialTracking] No profile found, using defaults');
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
          
          // Actualizar silenciosamente si es necesario, con throttling
          if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
          }
          
          updateTimeoutRef.current = setTimeout(async () => {
            try {
              await supabase
                .from('profiles')
                .update({ trial_end_date: trialEndDate.toISOString() })
                .eq('id', user.id);
            } catch {
              // Ignorar errores silenciosamente
            }
          }, 5000); // 5 segundos de delay
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

      } catch (error) {
        console.error('[OptimizedTrialTracking] Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrialInfo();

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [user?.id]); // Solo depender del user.id

  const refreshTrialInfo = () => {
    setLoading(true);
  };

  return {
    trialInfo,
    loading,
    refreshTrialInfo
  };
};
