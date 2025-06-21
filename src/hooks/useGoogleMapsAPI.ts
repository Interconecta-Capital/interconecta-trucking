
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback?: () => void;
  }
}

export const useGoogleMapsAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Verificar si ya está cargado
        if (window.google && window.google.maps) {
          setIsLoaded(true);
          return;
        }

        // Obtener API key desde Supabase Secrets
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) {
          console.warn('⚠️ No se pudo obtener Google Maps API key:', error);
          setError('Google Maps API key no configurada');
          return;
        }

        const key = data?.apiKey || process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
        
        if (!key) {
          setError('Google Maps API key no encontrada');
          return;
        }

        setApiKey(key);

        // Crear callback global
        window.initGoogleMapsCallback = () => {
          console.log('✅ Google Maps API cargada');
          setIsLoaded(true);
        };

        // Cargar script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=geometry,places&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        
        script.onerror = () => {
          setError('Error cargando Google Maps API');
        };

        document.head.appendChild(script);

      } catch (error) {
        console.error('❌ Error inicializando Google Maps:', error);
        setError('Error de inicialización');
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, error, apiKey };
};
