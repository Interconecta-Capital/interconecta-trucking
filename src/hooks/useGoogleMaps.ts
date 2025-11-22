import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para cargar Google Maps API dinámicamente
 * 
 * Obtiene la API key desde Supabase edge function y carga el script
 * Cumple con ISO 27001:
 * - A.14.1.2: Seguridad en el desarrollo - API keys no expuestas en código
 * - A.9.4.1: Restricción de acceso - API key almacenada en secrets
 * 
 * @returns isLoaded - Indica si Google Maps está listo
 */
export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Si ya está cargado globalmente, marcar como listo
    if ((window as any).google?.maps) {
      setIsLoaded(true);
      return;
    }

    // Si ya hay una carga en progreso, esperar
    if ((window as any).googleMapsLoading) {
      const checkLoaded = setInterval(() => {
        if ((window as any).google?.maps) {
          setIsLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);
      return () => clearInterval(checkLoaded);
    }

    // Marcar como cargando
    (window as any).googleMapsLoading = true;

    const loadGoogleMaps = async () => {
      try {
        console.log('🗺️ Obteniendo API key de Google Maps...');
        
        // Obtener API key desde edge function seguro
        const { data, error: apiError } = await supabase.functions.invoke('get-google-maps-key');
        
        if (apiError || !data?.apiKey) {
          console.error('❌ Error obteniendo API key:', apiError);
          setError('No se pudo cargar Google Maps');
          return;
        }

        const apiKey = data.apiKey;
        console.log('✅ API key obtenida');

        // Crear y cargar script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('✅ Google Maps API cargada');
          setIsLoaded(true);
          (window as any).googleMapsLoading = false;
        };
        
        script.onerror = (err) => {
          console.error('❌ Error cargando Google Maps:', err);
          setError('Error al cargar Google Maps');
          (window as any).googleMapsLoading = false;
        };

        document.head.appendChild(script);
        
      } catch (err) {
        console.error('❌ Error en useGoogleMaps:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        (window as any).googleMapsLoading = false;
      }
    };

    loadGoogleMaps();
  }, []);

  return { isLoaded, error };
}
