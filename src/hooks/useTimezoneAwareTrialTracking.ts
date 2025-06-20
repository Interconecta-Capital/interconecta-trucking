
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TrialInfo {
  isTrialActive: boolean;
  isTrialExpired: boolean;
  daysRemaining: number;
  trialEndDate: Date | null;
  hasValidSubscription: boolean;
  subscriptionStatus: string | null;
}

export function useTimezoneAwareTrialTracking() {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialInfo>({
    isTrialActive: false,
    isTrialExpired: false,
    daysRemaining: 0,
    trialEndDate: null,
    hasValidSubscription: false,
    subscriptionStatus: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadTrialInfo = async () => {
      try {
        console.log('[TimezoneTrialTracking] Loading trial info for:', user.id);

        // Get profile data directly
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('created_at, trial_end_date')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.warn('[TimezoneTrialTracking] Profile error:', profileError);
          // Use fallback: calculate from user creation
          const userCreatedAt = new Date(user.created_at);
          const trialEndDate = new Date(userCreatedAt.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          
          setTrialInfo({
            isTrialActive: daysRemaining > 0,
            isTrialExpired: daysRemaining <= 0,
            daysRemaining,
            trialEndDate,
            hasValidSubscription: false,
            subscriptionStatus: 'trial',
          });
          return;
        }

        // Calculate trial status from profile
        const createdAt = new Date(profile.created_at);
        const trialEndDate = profile.trial_end_date ? 
          new Date(profile.trial_end_date) : 
          new Date(createdAt.getTime() + (14 * 24 * 60 * 60 * 1000)); // 14 days default

        const now = new Date();
        const daysRemaining = Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

        // Try to get subscription info (but don't fail if it errors)
        let subscriptionStatus = 'trial';
        let hasValidSubscription = false;

        try {
          const { data: subscription } = await supabase
            .from('suscripciones')
            .select('status')
            .eq('user_id', user.id)
            .single();

          if (subscription) {
            subscriptionStatus = subscription.status;
            hasValidSubscription = ['active', 'trial'].includes(subscription.status);
          }
        } catch (subError) {
          console.warn('[TimezoneTrialTracking] Subscription query failed, using defaults');
        }

        setTrialInfo({
          isTrialActive: daysRemaining > 0 && !hasValidSubscription,
          isTrialExpired: daysRemaining <= 0 && !hasValidSubscription,
          daysRemaining,
          trialEndDate,
          hasValidSubscription,
          subscriptionStatus,
        });

      } catch (error) {
        console.error('[TimezoneTrialTracking] Error:', error);
        // Fallback to safe defaults
        setTrialInfo({
          isTrialActive: true,
          isTrialExpired: false,
          daysRemaining: 14,
          trialEndDate: new Date(Date.now() + (14 * 24 * 60 * 60 * 1000)),
          hasValidSubscription: false,
          subscriptionStatus: 'trial',
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrialInfo();
  }, [user?.id, user?.created_at]);

  return { trialInfo, loading };
}
