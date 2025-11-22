/**
 * Hook seguro para cargar Google Maps API desde Vault (ISO 27001 A.10.1)
 * La API key se obtiene del backend y se carga dinámicamente
 */

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface GoogleMapsLoaderState {
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;
}

let isLoadingGlobal = false;
let isLoadedGlobal = false;

export const useGoogleMapsLoader = () => {
  const [state, setState] = useState<GoogleMapsLoaderState>({
    isLoaded: isLoadedGlobal,
    isLoading: false,
    error: null
  });

  useEffect(() => {
    // Si ya está cargado globalmente, actualizar estado
    if (isLoadedGlobal) {
      setState({ isLoaded: true, isLoading: false, error: null });
      return;
    }

    // Si ya se está cargando, esperar
    if (isLoadingGlobal) {
      setState(prev => ({ ...prev, isLoading: true }));
      const checkInterval = setInterval(() => {
        if (isLoadedGlobal) {
          setState({ isLoaded: true, isLoading: false, error: null });
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }

    // Cargar Google Maps API
    const loadGoogleMaps = async () => {
      try {
        isLoadingGlobal = true;
        setState({ isLoaded: false, isLoading: true, error: null });

        // Obtener API key desde Edge Function que accede al Vault
        const { data, error } = await supabase.functions.invoke('get-google-maps-key');
        
        if (error) throw error;
        
        const apiKey = data?.apiKey;  // ✅ Campo correcto de la respuesta
        
        if (!apiKey) {
          throw new Error('No se pudo obtener la API key de Google Maps desde el Vault');
        }

        // Cargar script de Google Maps
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          isLoadedGlobal = true;
          isLoadingGlobal = false;
          setState({ isLoaded: true, isLoading: false, error: null });
        };

        script.onerror = () => {
          isLoadingGlobal = false;
          const errorMsg = 'Error al cargar Google Maps API';
          setState({ isLoaded: false, isLoading: false, error: errorMsg });
        };

        document.head.appendChild(script);
      } catch (error: any) {
        console.error('[Google Maps Loader] Error:', error);
        isLoadingGlobal = false;
        setState({ 
          isLoaded: false, 
          isLoading: false, 
          error: error.message || 'Error al cargar Google Maps' 
        });
      }
    };

    loadGoogleMaps();
  }, []);

  return state;
};
