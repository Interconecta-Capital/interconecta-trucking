
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecureMapbox = () => {
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Call edge function to get Mapbox token securely
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');

        if (error) {
          throw error;
        }

        if (data?.token) {
          setMapboxToken(data.token);
        } else {
          throw new Error('No Mapbox token received');
        }
      } catch (err) {
        console.error('Failed to fetch Mapbox token:', err);
        setError('Failed to load map configuration');
        setMapboxToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  return {
    mapboxToken,
    isLoading,
    error,
    isTokenAvailable: !!mapboxToken
  };
};
