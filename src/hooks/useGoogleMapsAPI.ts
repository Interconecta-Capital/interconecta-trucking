
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleMapsAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMapsAPI = async () => {
      try {
        // Check if Google Maps is already loaded
        if (window.google && window.google.maps) {
          console.log('✅ Google Maps already loaded');
          setIsLoaded(true);
          return;
        }

        console.log('🔄 Loading Google Maps API...');

        // Get API key from Edge Function
        const { data, error: keyError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (keyError || !data?.apiKey) {
          throw new Error('No se pudo obtener la API key de Google Maps');
        }

        setApiKey(data.apiKey);

        // Load Google Maps script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=geometry,places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          console.log('✅ Google Maps API loaded successfully');
          setIsLoaded(true);
          setError(null);
        };

        script.onerror = () => {
          const errorMsg = 'Error cargando Google Maps API';
          console.error('❌', errorMsg);
          setError(errorMsg);
        };

        document.head.appendChild(script);

        // Cleanup function
        return () => {
          const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
          if (existingScript) {
            document.head.removeChild(existingScript);
          }
        };

      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error desconocido cargando Google Maps';
        console.error('❌ Error loading Google Maps:', err);
        setError(errorMsg);
      }
    };

    loadGoogleMapsAPI();
  }, []);

  return { isLoaded, error, apiKey };
};
