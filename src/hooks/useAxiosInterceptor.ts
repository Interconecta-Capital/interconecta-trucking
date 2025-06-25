
import { useEffect } from 'react';
import { toast } from 'sonner';

// Simulamos axios para el interceptor (en un proyecto real usarías axios)
interface AxiosError {
  response?: {
    status: number;
    data?: {
      code?: string;
      limit_type?: string;
      message?: string;
    };
  };
}

// Global state para el modal de upgrade
let showUpgradeModalGlobal: ((props: any) => void) | null = null;

export const setGlobalUpgradeModal = (showModal: (props: any) => void) => {
  showUpgradeModalGlobal = showModal;
};

export const useAxiosInterceptor = () => {
  useEffect(() => {
    // Simulamos un interceptor de respuesta de axios
    const handleApiError = (error: AxiosError) => {
      console.log('[AxiosInterceptor] 🚨 Error capturado:', error);
      
      // Verificar si es un error 402 con código LIMIT_REACHED
      if (error.response?.status === 402 && error.response?.data?.code === 'LIMIT_REACHED') {
        const { limit_type, message } = error.response.data;
        
        console.log('[AxiosInterceptor] 💰 Límite alcanzado:', limit_type);
        
        // Mostrar el modal de upgrade si está disponible
        if (showUpgradeModalGlobal) {
          showUpgradeModalGlobal({
            title: "¡Has alcanzado tu límite!",
            description: message || "Has alcanzado el límite de tu plan gratuito.",
            blockedAction: getLimitTypeMessage(limit_type)
          });
        } else {
          // Fallback: mostrar toast si el modal no está disponible
          toast.error(message || "Has alcanzado el límite de tu plan gratuito.", {
            duration: 5000,
            action: {
              label: 'Ver Planes',
              onClick: () => window.location.href = '/planes'
            }
          });
        }
        
        return Promise.reject(error);
      }
      
      return Promise.reject(error);
    };

    // En un proyecto real, aquí configurarías el interceptor de axios:
    // axios.interceptors.response.use(
    //   (response) => response,
    //   handleApiError
    // );

    // Simulamos la configuración del interceptor
    console.log('[AxiosInterceptor] ✅ Interceptor configurado');
    
    // Cleanup function
    return () => {
      console.log('[AxiosInterceptor] 🧹 Limpiando interceptor');
    };
  }, []);
};

function getLimitTypeMessage(limitType?: string): string {
  switch (limitType) {
    case 'vehicles':
      return 'Intentaste crear un vehículo adicional';
    case 'trailers':
      return 'Intentaste agregar un remolque adicional';
    case 'partners':
      return 'Intentaste agregar un socio adicional';
    case 'trips':
      return 'Intentaste crear un viaje adicional este mes';
    case 'documents':
      return 'Intentaste timbrar una carta porte adicional este mes';
    default:
      return 'Intentaste realizar una acción que excede los límites de tu plan';
  }
}
