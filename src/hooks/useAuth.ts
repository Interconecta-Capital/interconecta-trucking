
import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = useCallback((session: Session | null) => {
    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        updateAuthState(session);
        
        // Defer any additional data fetching to prevent deadlocks
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(() => {
            // Any additional user data fetching can go here
            console.log('User signed in:', session.user.email);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateAuthState(session);
    });

    return () => subscription.unsubscribe();
  }, [updateAuthState]);

  const signOut = useCallback(async () => {
    try {
      // Clean up local storage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Force page reload for clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, []);

  return {
    user,
    session,
    loading,
    signOut
  };
};
